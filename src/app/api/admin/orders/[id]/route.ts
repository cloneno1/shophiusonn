import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { status, adminNote } = await req.json();

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (status) order.status = status;
    if (adminNote !== undefined) order.adminNote = adminNote;
    await order.save();

    // Xử lý hoa hồng Affiliate nếu đơn hàng hoàn tất
    if (status === 'Completed' && !order.commissionPaid) {
      const buyer = await User.findById(order.userId);
      if (buyer && buyer.referredBy) {
        const referrer = await User.findById(buyer.referredBy);
        if (referrer) {
          const profit = order.price - (order.cost || 0);
          if (profit > 0) {
            const commission = Math.floor(profit * 0.35);
            referrer.affiliateBalance = (referrer.affiliateBalance || 0) + commission;
            referrer.totalAffiliateEarnings = (referrer.totalAffiliateEarnings || 0) + commission;
            await referrer.save();
            
            order.commissionPaid = true;
            await order.save();
          }
        }
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update Order Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
