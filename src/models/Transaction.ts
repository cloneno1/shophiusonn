import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  amount: { type: Number, required: true }, // The original value of card/bank (e.g. 100k)
  receivedAmount: { type: Number }, // The final balance credited (after fees/penalties)
  method: { type: String, required: true }, // 'card' or 'bank'
  telco: { type: String }, // For card
  serial: { type: String }, // For card
  code: { type: String }, // For card
  requestId: { type: String }, // For card API tracking
  status: { type: String, default: 'Pending' }, // Pending, Success, Failed
  adminNote: { type: String }, // To display feedback to the user
  createdAt: { type: Date, default: Date.now },
});

// Thêm Index để tăng tốc độ truy vấn
TransactionSchema.index({ username: 1, createdAt: -1 });
TransactionSchema.index({ requestId: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
