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

    // 1. Phân tích tham số từ URL (luôn có thể có)
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
    const amount_received = Number(data.amount || data.value_receive || 0); 
    const card_value = Number(data.value || data.declared_value || 0);
    const callback_sign = data.callback_sign;

    if (!request_id) {
      console.error('Missing request_id in callback data');
      return NextResponse.json({ message: 'Missing request_id' }, { status: 200 });
    }

    const db = await connectDB();
    
    // DEBUG: Kiểm tra tên Database và tồng số record hiện có
    const dbName = db.connection?.name || 'unknown';
    
    // CƠ CHẾ THỬ LẠI (Retry): Chờ đợi giây lát phòng trường hợp DB chưa kịp commit
    let transaction = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      transaction = await Transaction.findOne({ 
        requestId: { $regex: new RegExp(`^${request_id.toString().trim()}$`, 'i') }
      });
      if (transaction) break;
      retries++;
      console.log(`Transaction NOT FOUND, retrying... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Đợi 1.5s rồi tìm lại
    }

    if (!transaction) {
      const totalCount = await Transaction.countDocuments();
      console.error(`FINAL_ERROR: Transaction not found: ${request_id}. DB: ${dbName}, Total: ${totalCount}`);
      // Ghi thêm log hỗ trợ để debug các giao dịch gần đây
      const recent = await Transaction.find().sort({ createdAt: -1 }).limit(5).select('requestId status').lean();
      console.log('Recent 5 IDs in DB:', recent.map((t: any) => `[ID:${t.requestId}, Stat:${t.status}]`).join(' | '));
      return NextResponse.json({ message: 'Not found' }, { status: 200 });
    }

    // --- DEBUG: Save raw data to adminNote so we can see it in UI ---
    transaction.adminNote = `CB: st=${status_code}, am=${amount_received}, val=${card_value}`;
    
    if (transaction.status === 'Pending') {
      const gStatus = Number(status_code);
      
      // Gachthe1s: 1 is success, 2 is success wrong amount
      if (gStatus === 1 || gStatus === 2) { 
        transaction.status = 'Success';
        // Use amount_received if present, otherwise calculate from card_value or original amount
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

          // Send Discord notification
          await sendDiscordWebhook(`NẠP THẺ THÀNH CÔNG`, [
            { name: 'Khách hàng', value: user.username, inline: true },
            { name: 'Loại thẻ', value: transaction.telco || 'Unknown', inline: true },
            { name: 'Mệnh giá', value: `${transaction.amount.toLocaleString()} VNĐ`, inline: true },
            { name: 'Thực nhận', value: `${finalAmount.toLocaleString()} VNĐ`, inline: true },
          ], 0x22c55e);
        }
      } else if (gStatus === 3 || gStatus === 4 || gStatus === 100) {
        // Failed
        transaction.status = 'Failed';
        transaction.adminNote += ' (Thẻ lỗi/Từ chối)';
        await transaction.save();
      } else {
         // Still pending or other code
         await transaction.save();
      }
    } else {
      await transaction.save();
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('Gachthe1s Callback Error:', error);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}
