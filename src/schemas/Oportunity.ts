import mongoose from "mongoose";

// Converter JSON para Schema do Mongoose:
// https://transform.tools/json-to-mongoose

const schema = new mongoose.Schema({
    key: { // ex: USDCUSDT_PENDLEUSDC_PENDLEUSDT_1.0075079448576885
        type: String,
        required: true,
        index: true // ---Index----
    },
    strategy: String,
    timeFirstOffer: Number,
    duration: Number, // seconds
    profitability: Number,
    initialValue: Number,
    finalValue: Number,
    ordersRequest: [mongoose.Schema.Types.Mixed],
    ordersResponse: [mongoose.Schema.Types.Mixed],
    status: {
        type: String,
        enum: [
            'SUCCESS',
            'ERROR_ORDER1',
            'ERROR_ORDER2',
            'ERROR_ORDER3',
            'ERROR_OTHER'
        ]
    },
    error: String
}, { timestamps: true });

export default mongoose.model('Oportunity', schema);