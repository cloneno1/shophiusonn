import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.affiliateBalance < 10000) {
      return NextResponse.json({ message: 'Số dư hoa hồng tối thiểu để rút là 10.000đ' }, { status: 400 });
    }

    const amount = user.affiliateBalance;
    
    // Chuyển tiền
    user.balance = (user.balance || 0) + amount;
    user.affiliateBalance = 0;
    
    await user.save();

    return NextResponse.json({ 
      message: 'Rút tiền thành công',
      newBalance: user.balance,
      newAffiliateBalance: 0
    });
  } catch (error) {
    console.error('Withdraw Affiliate Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
