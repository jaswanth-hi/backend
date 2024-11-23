const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Transaction = require("./models_mongodb/transactionModel");

const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1:27017/local")
  .then(() => {
    console.log("connect mongodb");
  })
  .catch((err) => {
    console.log("abc");
  });

app.post("/api/transactions", async (req, res) => {
  try {
    const { amount, transaction_type, user } = req.body;

    if (!amount || !transaction_type || !user) {
      return res
        .status(400)
        .json({
          error: "All fields (amount, transaction_type, user) are required.",
        });
    }

    const lastTransaction = await Transaction.findOne().sort({
      transaction_id: -1,
    });
    const transaction_id = lastTransaction
      ? lastTransaction.transaction_id + 1
      : 1;

    const newTransaction = new Transaction({
      transaction_id,
      amount,
      transaction_type,
      user,
    });

    await newTransaction.save();

    res.status(201).json({
      transaction_id: newTransaction._id,
      amount: newTransaction.amount,
      transaction_type: newTransaction.transaction_type,
      status: newTransaction.status,
      user: newTransaction.user,
      timestamp: newTransaction.timestamp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res
        .status(400)
        .json({ error: "user_id is required as a query parameter." });
    }

    const transactions = await Transaction.find({ user: user_id });

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/transactions/:transaction_id", async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { status } = req.body;

    console.log("Received transaction_id:", transaction_id);

    if (!status || !["COMPLETED", "FAILED"].includes(status)) {
      return res
        .status(400)
        .json({
          error: "Invalid status value. Must be 'COMPLETED' or 'FAILED'.",
        });
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transaction_id: parseInt(transaction_id) },
      { status },
      { new: true }
    );

    if (!updatedTransaction) {
      console.log("Transaction not found for transaction_id:", transaction_id);
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(200).json({
      transaction_id: updatedTransaction._id,
      amount: updatedTransaction.amount,
      transaction_type: updatedTransaction.transaction_type,
      status: updatedTransaction.status,
      timestamp: updatedTransaction.timestamp,
    });
  } catch (error) {
    console.error("Error updating transaction:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions/:transaction_id", async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const transaction = await Transaction.findOne({
      transaction_id: parseInt(transaction_id),
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(200).json({
      transaction_id: transaction._id,
      amount: transaction.amount,
      transaction_type: transaction.transaction_type,
      status: transaction.status,
      timestamp: transaction.timestamp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4500, () => {
  console.log("Server running on http://localhost:4500");
});
