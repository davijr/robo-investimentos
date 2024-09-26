import mongoose from "mongoose";

const schema = new mongoose.Schema({
    "symbol": {
        "type": "String"
    },
    "status": {
        "type": "String"
    },
    "baseAsset": {
        "type": "String"
    },
    "baseAssetPrecision": {
        "type": "Number"
    },
    "quoteAsset": {
        "type": "String"
    },
    "quotePrecision": {
        "type": "Number"
    },
    "quoteAssetPrecision": {
        "type": "Number"
    },
    "baseCommissionPrecision": {
        "type": "Number"
    },
    "quoteCommissionPrecision": {
        "type": "Number"
    },
    "orderTypes": {
        "type": [
        "String"
        ]
    },
    "icebergAllowed": {
        "type": "Boolean"
    },
    "ocoAllowed": {
        "type": "Boolean"
    },
    "otoAllowed": {
        "type": "Boolean"
    },
    "quoteOrderQtyMarketAllowed": {
        "type": "Boolean"
    },
    "allowTrailingStop": {
        "type": "Boolean"
    },
    "cancelReplaceAllowed": {
        "type": "Boolean"
    },
    "isSpotTradingAllowed": {
        "type": "Boolean"
    },
    "isMarginTradingAllowed": {
        "type": "Boolean"
    },
    "filters": {
        "type": "Array"
    },
    "permissions": {
        "type": "Array"
    },
    "permissionSets": {
        "type": [
        "Array"
        ]
    },
    "defaultSelfTradePreventionMode": {
        "type": "String"
    },
    "allowedSelfTradePreventionModes": {
        "type": [
        "String"
        ]
    }
}, { timestamps: true });

export default mongoose.model('Symbol', schema)