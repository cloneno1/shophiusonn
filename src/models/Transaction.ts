import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // 'card' or 'bank'
  telco: { type: String }, // For card
  serial: { type: String }, // For card
  code: { type: String }, // For card
  requestId: { type: String }, // For card API tracking
  status: { type: String, default: 'Pending' }, // Pending, Success, Failed
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
