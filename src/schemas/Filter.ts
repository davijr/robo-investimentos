import mongoose from "mongoose";

const schema = new mongoose.Schema({
    "filterType": {
        "type": "String"
    },
    "minPrice": {
        "type": "String"
    },
    "maxPrice": {
        "type": "String"
    },
    "tickSize": {
        "type": "String"
    }
}, { timestamps: true });

export default mongoose.model('Filter', schema)