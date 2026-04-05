import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Delete all orders with non-positive prices (these were part of the previous bug)
    const result = await Order.deleteMany({ price: { $lte: 0 } });

    console.log(`Cleaned up ${result.deletedCount} invalid orders.`);

    return NextResponse.json({ message: `Successfully deleted ${result.deletedCount} bugged orders.` });
  } catch (error) {
    console.error('Cleanup Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
