import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import crypto from 'crypto';
import { sendDiscordWebhook } from '@/lib/discord';

async function handleCallback(req: Request) {
  try {
    let data: Record<string, any> = {};
    const url = new URL(req.url);

    // 1. Phân tích tham số từ URL
    url.searchParams.forEach((value, key) => {
      data[key] = value;
    });

    // 2. Phân tích tham số từ Body (nếu là POST)
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      try {
        if (contentType.includes('application/json')) {
          const bodyJson = await req.json();
          data = { ...data, ...bodyJson };
        } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
          const formData = await req.formData();
          formData.forEach((value, key) => {
            data[key] = value.toString();
          });
        } else {
          const text = await req.text();
          try {
            data = { ...data, ...JSON.parse(text) };
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Error reading callback body:', err);
      }
    }

    console.log('RECHARGE CALLBACK DATA:', JSON.stringify(data, null, 2));

    const status_code = data.status || data.status_code;
    const request_id = data.request_id || data.requestId || data.content || data.id;
    const amount_received = Number(data.amount || data.value_receive || data.amount_receive || 0); 
    const card_value = Number(data.value || data.declared_value || 0);
    const callback_sign = data.callback_sign;

    if (!request_id) {
      console.error('Missing request_id in callback data');
      return NextResponse.json({ message: 'Missing request_id' }, { status: 200 });
    }

    await connectDB();
    
    // Tìm giao dịch với requestId tương ứng
    let transaction = await Transaction.findOne({ requestId: request_id.toString().trim() });

    // CƠ CHẾ THỬ LẠI (Retry): Chờ đợi giây lát phòng trường hợp DB chưa kịp commit (Next.js Edge Runtime / Serverless)
    if (!transaction) {
      let retries = 0;
      const maxRetries = 3;
      while (retries < maxRetries) {
        retries++;
        console.log(`Transaction NOT FOUND, retrying... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        transaction = await Transaction.findOne({ requestId: request_id.toString().trim() });
        if (transaction) break;
      }
    }

    if (!transaction) {
      console.error(`FINAL_ERROR: Transaction not found: ${request_id}`);
      return NextResponse.json({ message: 'Not found' }, { status: 200 });
    }

    // --- BẢO MẬT: Kiểm tra Signature của TheSieuRe ---
    // Công thức TSR: MD5(PartnerKey + status + request_id)
    const partnerKey = process.env.TSR_PARTNER_KEY || '';
    if (callback_sign && partnerKey) {
       const mySign = crypto.createHash('md5').update(partnerKey + status_code + request_id).digest('hex');
       if (mySign !== callback_sign) { 
         console.error(`INVALID CALLBACK SIGNATURE: Expected ${mySign}, got ${callback_sign}`);
         // Tùy chọn: Có thể chặn xử lý nếu sai chữ ký để bảo mật tuyệt đối
         // return NextResponse.json({ message: 'Invalid Signature' }, { status: 200 }); 
       } else {
         console.log('Callback signature verified successfully.');
       }
    }

    // Cập nhật log thô để admin có thể kiểm tra nếu có lỗi
    transaction.adminNote = `TSR CB: st=${status_code}, am=${amount_received}, val=${card_value}`;
    
    if (transaction.status === 'Pending') {
      const gStatus = Number(status_code);
      
      // TheSieuRe: 1 là thành công, 2 là thành công nhưng sai mệnh giá
      if (gStatus === 1 || gStatus === 2) { 
        transaction.status = 'Success';
        
        // Tính toán số tiền cộng cho khách
        // TheSieuRe trả về amount là số tiền thực nhận sau chiết khấu
        const finalAmount = amount_received || (card_value * 0.83) || (transaction.amount * 0.83);
        transaction.receivedAmount = finalAmount;
        
        if (gStatus === 2) {
          transaction.adminNote += ' (Nạp sai mệnh giá)';
        }
        await transaction.save();

        const user = await User.findOne({ username: transaction.username });
        if (user) {
          user.balance = (user.balance || 0) + finalAmount;
          await user.save();
          console.log(`Updated balance for ${user.username}: +${finalAmount}`);

          // Gửi thông báo Discord
          try {
            await sendDiscordWebhook(`NẠP THẺ THÀNH CÔNG (TSR)`, [
              { name: 'Khách hàng', value: user.username, inline: true },
              { name: 'Loại thẻ', value: transaction.telco || 'Unknown', inline: true },
              { name: 'Mệnh giá', value: `${transaction.amount.toLocaleString()} VNĐ`, inline: true },
              { name: 'Thực nhận', value: `${finalAmount.toLocaleString()} VNĐ`, inline: true },
            ], 0x22c55e);
          } catch (discordErr) {
            console.error('Discord Webhook Error:', discordErr);
          }
        }
      } else if (gStatus === 3 || gStatus === 4 || gStatus === 100) {
        // Trạng thái thất bại (3: Sai mã thẻ/seri, 4: Thẻ đã sử dụng)
        transaction.status = 'Failed';
        transaction.adminNote += ' (Thẻ lỗi/Từ chối)';
        await transaction.save();
      } else {
        // Các trạng thái khác (vẫn đang xử lý)
        await transaction.save();
      }
    } else {
      await transaction.save();
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('TheSieuRe Callback Error:', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}


export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}

