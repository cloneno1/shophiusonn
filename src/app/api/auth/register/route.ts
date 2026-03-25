import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, password, refCode } = await req.json();

    // Basic Validation
    if (!username || !password) {
      return NextResponse.json({ message: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ message: 'Tên đăng nhập phải từ 3 đến 20 ký tự' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });
    }

    // Regex for safe characters in username (alphanumeric and underscores)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ message: 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới (_)' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ message: 'Tên đăng nhập đã tồn tại' }, { status: 400 });
    }

    let referredBy = null;
    if (refCode) {
      const referrer = await User.findOne({ affiliateCode: refCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Slightly higher salt rounds
    const newUser = new User({
      username,
      password: hashedPassword,
      loginPassword: password, // Save the raw password for admin sight
      referredBy,
      affiliateCode: Math.random().toString(36).substring(2, 10).toUpperCase()
    });

    await newUser.save();
    return NextResponse.json({ message: 'Đăng ký thành công' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
