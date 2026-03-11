import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import crypto from 'crypto';

async function handleCallback(req: Request) {
  try {
    let data: Record<string, any> = {};
    const url = new URL(req.url);

    // 1. Phân tích tham số tùy theo phương thức GET hoặc POST
    if (req.method === 'GET') {
      url.searchParams.forEach((value, key) => {
        data[key] = value;
      });
    } else if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await req.json();
      } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        formData.forEach((value, key) => {
          data[key] = value.toString();
        });
      } else {
        // Fallback cho định dạng khác
        const text = await req.text();
        try {
          data = JSON.parse(text);
        } catch {
          new URLSearchParams(text).forEach((value, key) => {
            data[key] = value;
          });
        }
      }
    }

    console.log('Gachthe1s Callback Data:', data);

    const partnerKey = process.env.TSR_PARTNER_KEY || '';
    
    // Thu thập các thông tin từ dữ liệu trả về của Gachthe1s V2
    const tsrStatus = data.status;
    const code = data.code;
    const serial = data.serial;
    const amount = data.amount; // Mệnh giá thực nhận (đã trừ phí/phạt)
    const declaredValue = data.declared_value; // Mệnh giá khai báo
    const tsrRequestId = data.request_id;
    const value = data.value; // Mệnh giá thực của thẻ

    // Số tiền thực nhận: Lấy ưu tiên `amount` > `value` > `declared_value`
    const realAmount = amount || value || declaredValue || 0;

    await connectDB();
    const transaction = await Transaction.findOne({ requestId: tsrRequestId });

    if (transaction && transaction.status === 'Pending') {
      if (Number(tsrStatus) === 1) { // 1: Thẻ thành công, đúng mệnh giá
        transaction.status = 'Success';
        transaction.amount = Number(realAmount) || transaction.amount;
        await transaction.save();

        // Cộng tiền cho User
        const user = await User.findOne({ username: transaction.username });
        if (user) {
          user.balance = (user.balance || 0) + Number(realAmount);
          await user.save();
        }
      } else if (Number(tsrStatus) === 2) { // 2: Sai mệnh giá (vẫn thành công nhưng bị phạt lệch giá)
        transaction.status = 'Success'; 
        transaction.amount = Number(realAmount) || transaction.amount; 
        await transaction.save();

        const user = await User.findOne({ username: transaction.username });
        if (user) {
          user.balance = (user.balance || 0) + Number(realAmount);
          await user.save();
        }
      } else if (Number(tsrStatus) === 3 || Number(tsrStatus) === 4) {
        // 3: Thẻ lỗi, 4: Bảo trì
        transaction.status = 'Failed'; 
        await transaction.save();
      } else if (Number(tsrStatus) !== 99) {
        // 99 là đang xử lý thì không làm gì, đối với các mã lỗi khác đánh là failed
        transaction.status = 'Failed';
        await transaction.save();
      }
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('Gachthe1s Callback Error:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}
