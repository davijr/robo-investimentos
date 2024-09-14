import mongoose from "mongoose";

// Converter JSON para Schema do Mongoose:
// https://transform.tools/json-to-mongoose

const schema = new mongoose.Schema({
    lastUpdate: Number,
    // myTrades: {}
});

export default mongoose.model('Trade', schema);