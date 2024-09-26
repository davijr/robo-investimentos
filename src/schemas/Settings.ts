import mongoose from "mongoose";

const schema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'ACTIVE',
      'STOPPED',
      'SEARCHING',
      'PREPARING',
      'TRADING',
      'ERROR'
    ]
  },
  quote: String,
  profitability: Number,
  amount: Number,
  myTradesUpdateInterval: Number,
  accountUpdateInterval: Number,
  exchangeUpdateInterval: Number,
  lastUpdate: Number,
  attemptIntervals: Array
}, { timestamps: true });

export default mongoose.model('Settings', schema);