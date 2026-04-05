import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    let { telco, code, serial, amount, username } = await req.json();
    
    // Trim spaces and ensure consistency
    code = code?.trim();
    serial = serial?.trim();
    telco = telco?.toUpperCase();

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const callbackUrl = `${protocol}://${host}/api/recharge/callback`;

    const partnerId = process.env.TSR_PARTNER_ID;
    const partnerKey = process.env.TSR_PARTNER_KEY;
    const requestId = Math.floor(Math.random() * 1000000000).toString();

    const sign = crypto
      .createHash('md5')
      .update((partnerKey || '') + code + serial)
      .digest('hex');

    console.log('RECHARGE REQUEST TO GACHTHE1S:', {
      telco,
      code,
      serial,
      amount,
      requestId,
      partnerId,
    });

    // 1. Tạo đơn hàng trong DB TRƯỚC khi gửi đi (để chắc chắn callback có ID)
    await connectDB();
    const newTransaction = new Transaction({
      username,
      amount: Number(amount),
      method: 'card',
      telco,
      serial,
      code,
      requestId,
      status: 'Pending',
    });
    await newTransaction.save();
    console.log(`Transaction PRE-SAVED: ${requestId}`);

    // 2. Gửi yêu cầu sang Gachthe1s
    const response = await axios.get('https://gachthe1s.com/chargingws/v2', {
      params: {
        telco,
        code,
        serial,
        amount,
        request_id: requestId,
        partner_id: partnerId,
        sign,
        command: 'charging',
        callback: callbackUrl
      },
    });

    console.log('GACHTHE1S RESPONSE:', JSON.stringify(response.data, null, 2));

    const status = response.data.status;
    const message = response.data.message;

    // Nếu Gachthe1s trả về lỗi ngay lập tức, cập nhật trạng thái đơn (tùy chọn)
    if (status !== 1 && status !== 99 && message !== 'VALID_CARD') {
       await Transaction.findOneAndUpdate({ requestId }, { status: 'Failed', adminNote: message });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Gachthe1s Card Error:', error);
    return NextResponse.json({ message: 'Lỗi gửi thẻ' }, { status: 500 });
  }
}
