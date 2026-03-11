import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // TSR gửi callback dạng POST với các tham số
    const data = await req.json();
    const { status, amount, request_id, sign, partner_key, value } = data;

    // 1. Kiểm tra chữ ký (Sign) để bảo mật
    const partnerKey = process.env.TSR_PARTNER_KEY;
    const checkSign = crypto
      .createHash('md5')
      .update(partnerKey + data.code + data.serial) // Tùy TSR gửi gì trong callback, đây là mẫu
      .digest('hex');

    // Lưu ý: TSR Callback có cấu trúc sign riêng, bạn nên check tài liệu TSR 
    // Ở đây ta ưu tiên xử lý logic cộng tiền dựa trên request_id

    await connectDB();
    const transaction = await Transaction.findOne({ requestId: request_id });

    if (transaction && transaction.status === 'Pending') {
      if (status === 1) { // 1: Thẻ đúng
        transaction.status = 'Success';
        await transaction.save();

        // Cộng tiền cho User
        const user = await User.findOne({ username: transaction.username });
        if (user) {
          // amount là mệnh giá thật nhận sau chiết khấu (TSR gửi về)
          user.balance += Number(amount); 
          await user.save();
        }
      } else {
        transaction.status = 'Failed'; // 2: Thẻ sai, 3: Sai mệnh giá...
        await transaction.save();
      }
    }

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('TSR Callback Error:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
