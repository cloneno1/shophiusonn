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

    const [totalUsers, ordersToday, recentOrders, stats] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$price" }
          }
        }
      ])
    ]);

    const totalRevenue = stats[0]?.totalRevenue || 0;
    
    // Total system balance
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" }
        }
      }
    ]);
    const systemBalance = userStats[0]?.totalBalance || 0;

    return NextResponse.json({
      totalUsers,
      ordersToday,
      totalRevenue,
      systemBalance,
      recentOrders
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
