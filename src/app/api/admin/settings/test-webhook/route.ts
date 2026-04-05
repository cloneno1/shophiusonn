import { NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ message: 'Missing URL' }, { status: 400 });
    }

    await axios.post(url, {
      embeds: [{
        title: '🔔 SHOP HIUSONN - KIỂM TRA WEBHOOK',
        description: 'Kết nối Discord thành công! Bạn sẽ nhận được thông báo tại kênh này.',
        color: 0x5865F2,
        timestamp: new Date().toISOString()
      }]
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('Test Webhook Error:', error);
    return NextResponse.json({ message: 'Failed to send webhook' }, { status: 500 });
  }
}
