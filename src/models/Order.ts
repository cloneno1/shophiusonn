import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true }, // Current roblox username for the order
  type: { type: String, required: true }, // gamepass, group, premium
  amount: { type: Number, required: true }, // Robux amount
  price: { type: Number, required: true }, // VND amount (Revenue)
  cost: { type: Number, default: 0 }, // VND amount (Cost of goods)
  commissionPaid: { type: Boolean, default: false },
  status: { type: String, default: 'Pending' }, // Pending, Processing, Completed, Cancelled
  adminNote: { type: String }, // To display feedback to the user
  details: { 
    gamepassUrl: String,
    image: String,
    note: String
  },
  createdAt: { type: Date, default: Date.now },
});

// Thêm Index để tăng tốc độ truy vấn
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ username: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
