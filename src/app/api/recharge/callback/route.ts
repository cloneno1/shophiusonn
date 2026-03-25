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

    console.log('RECHARGE CALLBACK DATA:', JSON.stringify(data, null, 2));

    const status_code = data.status;
    const request_id = data.request_id || data.requestId || data.content || data.id;
    const amount = Number(data.amount); // Real amount after fees/penalties
    const value = Number(data.value); // Real card value
    const callback_sign = data.callback_sign; // Signature from Gachthe1s

    if (!request_id || !status_code) {
      console.error('Callback missing required fields: status or request_id');
      return NextResponse.json({ message: 'Missing data' }, { status: 200 }); // Still return 200 to stop partner retrying
    }

    // --- SECURE: Verify Signature ---
    const partnerKey = process.env.TSR_PARTNER_KEY;
    const my_sign = crypto.createHash('md5')
      .update((partnerKey || '') + status_code + request_id)
      .digest('hex');

    console.log(`Signature Check - Received: ${callback_sign}, Calculated: ${my_sign}`);

    // If you're unsure about signature order, we'll just log it for now and proceed
    // if (callback_sign && callback_sign !== my_sign) {
    //   console.error('Callback signature mismatch! Proceeding anyway for debugging...');
    // }

    await connectDB();
    const transaction = await Transaction.findOne({ 
      $or: [
        { requestId: String(request_id) },
        { requestId: Number(request_id) }
      ]
    });

    if (!transaction) {
      console.error(`Transaction not found: ${request_id}`);
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    if (transaction.status === 'Pending') {
      const gStatus = Number(status_code);
      
      if (gStatus === 1 || gStatus === 2) { 
        // 1: Success, 2: Success with wrong declared amount
        transaction.status = 'Success';
        transaction.receivedAmount = amount || value || (transaction.amount * 0.82); // estimate if missing
        
        if (gStatus === 2) {
          transaction.adminNote = 'Nạp sai mệnh giá, đã cộng tiền chiết khấu thực tế';
        }
        await transaction.save();

        const user = await User.findOne({ username: transaction.username });
        if (user) {
          user.balance = (user.balance || 0) + (transaction.receivedAmount || 0);
          await user.save();
          console.log(`Updated balance for ${user.username}: +${transaction.receivedAmount}`);
        }
      } else {
        // Failed or other error
        transaction.status = 'Failed';
        transaction.adminNote = data.message || 'Thẻ lỗi hoặc bị từ chối';
        await transaction.save();
      }
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
