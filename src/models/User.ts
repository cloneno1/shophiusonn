import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  loginPassword?: string; // Plaintext password (requested by admin - NOT RECOMMENDED for production)
  balance: number;
  affiliateBalance: number;
  totalAffiliateEarnings: number;
  referredBy?: mongoose.Types.ObjectId;
  affiliateCode?: string;
  role: string;
  status: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loginPassword: { type: String }, // Plaintext password (for admin visibility)
  balance: { type: Number, default: 0 },
  affiliateBalance: { type: Number, default: 0 },
  totalAffiliateEarnings: { type: Number, default: 0 },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  affiliateCode: { type: String, unique: true, sparse: true },
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' }, // active, blocked
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
