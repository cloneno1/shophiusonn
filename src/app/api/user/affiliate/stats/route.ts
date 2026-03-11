import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 1. Tìm tất cả người dùng được giới thiệu bởi user này
    const referredUsers = await User.find({ referredBy: session.user.id }).select('username createdAt _id');

    // 2. Với mỗi người dùng, lấy số lượng đơn hàng và tổng hoa hồng
    const referralList = await Promise.all(referredUsers.map(async (refUser) => {
      const orders = await Order.find({ 
        userId: refUser._id, 
        status: 'Completed',
        commissionPaid: true 
      });

      const totalCommission = orders.reduce((acc, order) => {
        const profit = order.price - (order.cost || 0);
        return acc + (profit > 0 ? Math.floor(profit * 0.35) : 0);
      }, 0);

      return {
        username: refUser.username,
        createdAt: refUser.createdAt,
        orderCount: orders.length,
        totalCommission
      };
    }));

    // Tự động tạo mã nếu chưa có (cho tài khoản cũ)
    if (!currentUser.affiliateCode) {
      currentUser.affiliateCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await currentUser.save();
    }

    return NextResponse.json({
      referralCount: referredUsers.length,
      totalEarnings: currentUser.totalAffiliateEarnings || 0,
      currentBalance: currentUser.affiliateBalance || 0,
      affiliateCode: currentUser.affiliateCode,
      referrals: referralList
    });
  } catch (error) {
    console.error('Affiliate Stats Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
