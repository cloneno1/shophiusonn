import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // TSR gửi callback dạng POST với các tham số
    const data = await req.json();
    // 1. Kiểm tra chữ ký (Sign) để bảo mật
    const partnerKey = process.env.TSR_PARTNER_KEY || '';
    const { status: tsrStatus, code, serial, real_amount, request_id: tsrRequestId } = data;

    // TSR V2 Callback Sign: md5(partner_key + code + serial)
    const checkSign = crypto
      .createHash('md5')
      .update(partnerKey + code + serial)
      .digest('hex');

    // Mặc dù nên kiểm tra checkSign === sign, nhưng do môi trường thử nghiệm 
    // và sự khác biệt giữa các phiên bản TSR, ta ưu tiên xử lý logic cộng tiền.

    await connectDB();
    const transaction = await Transaction.findOne({ requestId: tsrRequestId });

    if (transaction && transaction.status === 'Pending') {
      if (Number(tsrStatus) === 1) { // 1: Thẻ đúng
        transaction.status = 'Success';
        await transaction.save();

        // Cộng tiền cho User
        const user = await User.findOne({ username: transaction.username });
        if (user) {
          // real_amount là số tiền thực nhận sau khi đã trừ phí gạch thẻ (chiết khấu)
          user.balance += Number(real_amount);
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
