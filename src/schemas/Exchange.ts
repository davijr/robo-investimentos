import mongoose from "mongoose";

// Converter JSON para Schema do Mongoose:
// https://transform.tools/json-to-mongoose

const schema = new mongoose.Schema({
    "timezone": {
        "type": "String"
    },
    "serverTime": {
        "type": "Number"
    },
    "rateLimits": {
        "type": [
            "Mixed"
        ]
    },
    "exchangeFilters": {
        "type": "Array"
    },
    "symbols": {
        "type": [
            "Mixed"
        ]
    }
})

export default mongoose.model('Exchange', schema)