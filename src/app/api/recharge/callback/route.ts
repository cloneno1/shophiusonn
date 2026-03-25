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

    const status_code = data.status || data.status_code;
    const request_id = data.request_id || data.requestId || data.content || data.id;
    const amount_received = Number(data.amount || data.value_receive || 0); 
    const card_value = Number(data.value || data.declared_value || 0);
    const callback_sign = data.callback_sign;

    if (!request_id) {
      return NextResponse.json({ message: 'Missing request_id' }, { status: 200 });
    }

    await connectDB();
    const transaction = await Transaction.findOne({ 
      $or: [
        { requestId: String(request_id) },
        { requestId: Number(request_id) }
      ]
    });

    if (!transaction) {
      console.error(`Transaction not found: ${request_id}`);
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
