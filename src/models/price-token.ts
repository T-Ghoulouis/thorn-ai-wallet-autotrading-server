import { Schema } from "mongoose";
import { PriceToken } from "../types/price-token";
import { autoTradeDB } from "../database/db";

const PriceTokenSchema = new Schema<PriceToken>({
    address: { type: String, required: true },
    priceUSD: { type: Schema.Types.BigInt, required: true },
    date: { type: Date, required: true },
});

export const PriceTokenModel = autoTradeDB.model<PriceToken>("PriceToken", PriceTokenSchema);
