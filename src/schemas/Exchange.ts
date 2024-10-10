import mongoose from "mongoose";

// Converter JSON para Schema do Mongoose:
// https://transform.tools/json-to-mongoose

const schema = new mongoose.Schema({
    symbols: [mongoose.Schema.Types.Mixed],
    rateLimits: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

export default mongoose.model('Exchange', schema)