import mongoose from "mongoose";

// Converter JSON para Schema do Mongoose:
// https://transform.tools/json-to-mongoose

const schema = new mongoose.Schema({
    key: String, // USDCUSDT_PENDLEUSDC_PENDLEUSDT_1.0075079448576885
    strategy: String,
    pair1: String,
    pair2: String,
    pair3: String,
    price1: Number,
    price2: Number,
    price3: Number,
    firstOffer: Number,
    duration: Number, // seconds
    profitability: Number
});

export default mongoose.model('Oportunity', schema);