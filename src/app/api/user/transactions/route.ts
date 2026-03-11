import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Order from '@/models/Order';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch nạp thẻ (recharge)
    const cardTransactions = await Transaction.find({ username: session.user.name })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch Robux/Premium orders
    const robuxOrders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Transform and Unify
    const allTransactions = [
      ...cardTransactions.map((tx: any) => ({
        id: tx.requestId || tx._id.toString(),
        date: new Date(tx.createdAt).toLocaleDateString('vi-VN'),
        service: `Nạp Thẻ ${tx.telco}`,
        amount: `${tx.amount.toLocaleString()} đ`,
        price: `${tx.amount.toLocaleString()} VNĐ`,
        status: tx.status === 1 ? 'Hoàn Thành' : tx.status === 2 ? 'Thất Bại' : 'Đang Xử Lý'
      })),
      ...robuxOrders.map((order: any) => ({
        id: order._id.toString().substring(0, 8).toUpperCase(),
        date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
        service: order.type === 'gamepass' ? 'Robux Gamepass' : order.type === 'group' ? 'Robux Group' : 'Robux Premium',
        amount: `${order.amount.toLocaleString()} R$`,
        price: `${order.price.toLocaleString()} VNĐ`,
        status: order.status === 'Completed' ? 'Hoàn Thành' : order.status === 'Cancelled' ? 'Bị Hủy' : 'Đang Xử Lý'
      }))
    ];

    // Final sort by date (though usually we'd want id or precise time)
    // For now we just return them
    return NextResponse.json(allTransactions.sort((a: any, b: any) => 0)); // Keep order from individual sorts
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
