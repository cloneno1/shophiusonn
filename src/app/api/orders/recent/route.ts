import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch latest 6 orders with Completed or Processing status to show as activity
    // If no orders yet, this will return empty array
    const orders = await Order.find({ status: { $in: ['Completed', 'Processing', 'Pending'] } })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const formattedOrders = orders.map((order: any) => {
      const userStr = order.username;
      // Mask username: keep first 3 chars, then ***, then last 3 or similar
      const maskedUser = userStr.length > 6 
        ? `${userStr.substring(0, 3)}***${userStr.substring(order.username.length - 2)}`
        : `***${userStr.substring(userStr.length - 2)}`;

      // Calculate relative time (simple version)
      const diffMs = new Date().getTime() - new Date(order.createdAt).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      let timeStr = 'Vừa xong';
      if (diffMin > 0 && diffMin < 60) timeStr = `${diffMin} phút trước`;
      if (diffMin >= 60 && diffMin < 1440) timeStr = `${Math.floor(diffMin / 60)} giờ trước`;
      if (diffMin >= 1440) timeStr = `${Math.floor(diffMin / 1440)} ngày trước`;

      return {
        id: order._id.toString(),
        user: maskedUser,
        time: timeStr,
        amount: order.amount,
        type: order.type === 'premium' ? 'Premium' : 'Robux'
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json([], { status: 500 });
  }
}
