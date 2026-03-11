import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true }, // Current roblox username for the order
  type: { type: String, required: true }, // gamepass, group, premium
  amount: { type: Number, required: true }, // Robux amount
  price: { type: Number, required: true }, // VND amount
  status: { type: String, default: 'Pending' }, // Pending, Processing, Completed, Cancelled
  details: { 
    gamepassUrl: String,
    note: String
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
