import mongoose from "mongoose";

const schema = new mongoose.Schema({
    quote: String,
    profitability: Number,
    amount: Number
})

export default mongoose.model('Settings', schema)