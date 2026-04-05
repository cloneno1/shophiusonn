import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import SiteConfig from '@/models/SiteConfig';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sendDiscordWebhook } from '@/lib/discord';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { username, type, amount, price, details } = await req.json();
    
    if (!amount || amount <= 0 || !price || price <= 0) {
      return NextResponse.json({ message: 'Số lượng hoặc giá không hợp lệ' }, { status: 400 });
    }

    await connectDB();

    // 1. Kiểm tra số dư người dùng
    const user = await User.findOne({ username: session.user?.name });
    if (!user || user.balance < price) {
      return NextResponse.json({ message: 'Số dư không đủ' }, { status: 400 });
    }

    // 2. Trừ tiền người dùng
    user.balance -= price;
    await user.save();

    // 2.1 Lấy giá vốn từ cấu hình
    const configs = await SiteConfig.find({ key: { $in: ['robuxCost120h', 'robuxCostGroup'] } });
    const configMap = configs.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    const costPerRobux = type === 'group' ? (configMap.robuxCostGroup || 0) : (configMap.robuxCost120h || 0);
    const totalCost = amount * costPerRobux;

    // 3. Tạo đơn hàng mới
    const newOrder = new Order({
      userId: user._id,
      username,
      type,
      amount,
      price,
      cost: totalCost,
      status: 'Pending',
      details: {
        gamepassUrl: details?.gamepassUrl,
        image: details?.image,
        note: details?.note
      }
    });

    await newOrder.save();

    // 4. Discord Notification
    await sendDiscordWebhook(`ĐƠN HÀNG MỚI (#${newOrder._id.toString().slice(-6)})`, [
      { name: 'Khách hàng', value: username, inline: true },
      { name: 'Sản phẩm', value: type === 'group' ? 'Robux Group' : 'Robux Gamepass', inline: true },
      { name: 'Số lượng', value: `${amount} R$`, inline: true },
      { name: 'Giá bán', value: `${price.toLocaleString()} VNĐ`, inline: true },
      { name: 'Lợi nhuận', value: `${(price - totalCost).toLocaleString()} VNĐ`, inline: true },
      { name: 'Chi tiết', value: details?.gamepassUrl || 'N/A' },
    ], 0x3b82f6);

    return NextResponse.json({ message: 'Đặt hàng thành công', orderId: newOrder._id });
  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ message: 'Lỗi hệ thống' }, { status: 500 });
  }
}
