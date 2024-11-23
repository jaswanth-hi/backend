const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  transaction_id: { type: Number, required: true, unique: true },
  amount: { type: Number, required: true },
  transaction_type: {
    type: String,
    enum: ["DEPOSIT", "WITHDRAWAL"],
    required: true,
  },
  user: { type: Number, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING",
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
