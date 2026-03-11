import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { username, type, amount, price, details } = await req.json();

    await connectDB();

    // 1. Kiểm tra số dư người dùng
    const user = await User.findOne({ username: session.user?.name });
    if (!user || user.balance < price) {
      return NextResponse.json({ message: 'Số dư không đủ' }, { status: 400 });
    }

    // 2. Trừ tiền người dùng
    user.balance -= price;
    await user.save();

    // 3. Tạo đơn hàng mới
    const newOrder = new Order({
      userId: user._id,
      username,
      type,
      amount,
      price,
      status: 'Pending',
      details: {
        gamepassUrl: details?.gamepassUrl,
        image: details?.image,
        note: details?.note
      }
    });

    await newOrder.save();

    return NextResponse.json({ message: 'Đặt hàng thành công', orderId: newOrder._id });
  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ message: 'Lỗi hệ thống' }, { status: 500 });
  }
}
