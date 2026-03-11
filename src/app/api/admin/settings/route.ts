import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

export async function GET() {
  try {
    await connectDB();
    const configs = await SiteConfig.find();
    const configMap = configs.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Default values if not set
    const defaultConfig = {
      robuxRate120h: 140,
      robuxRateGroup: 160,
      robuxCost120h: 100,
      robuxCostGroup: 120,
      linkFacebook: 'https://facebook.com',
      linkDiscord: 'https://discord.gg',
      linkYoutube: 'https://youtube.com',
      videoTutorial: '',
    };

    return NextResponse.json({ ...defaultConfig, ...configMap });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    for (const [key, value] of Object.entries(body)) {
      await SiteConfig.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
