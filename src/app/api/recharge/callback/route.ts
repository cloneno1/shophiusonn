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

    console.log('Gachthe1s Callback Received Data:', JSON.stringify(data, null, 2));

    const status_code = data.status;
    const request_id = data.request_id || data.requestId || data.content;
    const amount = data.amount; // Real amount received after fees
    const declaredValue = data.declared_value;
    const value = data.value; // Real card value

    if (!request_id) {
      console.error('Callback missing request_id');
      return NextResponse.json({ message: 'Missing request_id' }, { status: 400 });
    }

    // realAmount logic: Gachthe1s V2 uses 'amount' for the balance to add
    // If amount is not present, use value (though amount is usually better as it handles fines)
    const realAmount = Number(amount) || Number(value) || Number(declaredValue) || 0;

    await connectDB();
    // Use flexible query for requestId
    const transaction = await Transaction.findOne({ 
      $or: [{ requestId: request_id }, { requestId: String(request_id) }] 
    });

    if (!transaction) {
      console.error(`Transaction not found for request_id: ${request_id}`);
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    console.log(`Processing transaction ${transaction._id} for user ${transaction.username}. Current status: ${transaction.status}`);

    if (transaction.status === 'Pending') {
      const tsrStatus = Number(status_code);
      
      if (tsrStatus === 1 || tsrStatus === 2) { 
        // 1: Success, 2: Success with wrong declared amount
        transaction.status = 'Success';
        transaction.amount = realAmount || transaction.amount;
        await transaction.save();

        // Cộng tiền cho User
        const user = await User.findOne({ username: transaction.username });
        if (user) {
          const oldBalance = user.balance || 0;
          user.balance = oldBalance + realAmount;
          await user.save();
          console.log(`Successfully added ${realAmount} to user ${user.username}. Old: ${oldBalance}, New: ${user.balance}`);
        } else {
          console.error(`User ${transaction.username} not found for transaction ${transaction._id}`);
        }
      } else if (tsrStatus === 3 || tsrStatus === 4) {
        // 3: Failed, 4: Maintenance
        transaction.status = 'Failed'; 
        transaction.adminNote = 'Thẻ lỗi hoặc sai thông tin từ nhà mạng';
        await transaction.save();
      } else if (tsrStatus !== 99) {
        transaction.status = 'Failed';
        await transaction.save();
      }
    } else {
      console.log(`Transaction ${transaction._id} is already processed with status: ${transaction.status}`);
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
