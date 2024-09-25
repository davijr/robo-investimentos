import mongoose from "mongoose";

// Converter JSON para Schema do Mongoose:
// https://transform.tools/json-to-mongoose

const schema = new mongoose.Schema({
    lastUpdate: Number,
    account: [mongoose.Schema.Types.Mixed] // Tipo any
}, { timestamps: true });

export default mongoose.model('Account', schema);