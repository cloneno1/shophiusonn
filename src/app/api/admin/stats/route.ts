import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 1. Total Users
    const totalUsers = await User.countDocuments();

    // 2. Orders Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });

    // 3. Monthly Revenue (Sum of all completed orders this month)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const monthlyOrders = await Order.find({ 
      status: 'Completed', 
      createdAt: { $gte: firstDayOfMonth } 
    });
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.price, 0);

    // 4. System Balance (Total balance of all users)
    const users = await User.find({}, 'balance');
    const systemBalance = users.reduce((sum, user) => sum + user.balance, 0);

    // 5. Recent Orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({
      stats: {
        totalUsers,
        ordersToday,
        monthlyRevenue,
        systemBalance
      },
      recentOrders
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
