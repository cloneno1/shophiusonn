import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  requestId: { type: String, required: true, unique: true },
  telco: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: Number, default: 0 }, // 0: Pending, 1: Success, 2: Failed, 3: Wrong Amount
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
