import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

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
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    if (status) transaction.status = status;
    if (adminNote !== undefined) transaction.adminNote = adminNote;
    
    await transaction.save();

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Update Transaction Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
