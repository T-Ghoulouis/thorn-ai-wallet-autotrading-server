import { Schema } from "mongoose";
import { Token } from "../types/tokens";
import { autoTradeDB } from "../config/db";

const TokenSchema = new Schema<Token>({
    name: { type: String, required: true, unique: true },
    symbol: { type: String, required: true },
    address: { type: String, required: true, unique: true },
    decimals: { type: Schema.Types.BigInt, required: true },
    privateAddress: { type: String, required: true },
});

export const TokenModel = autoTradeDB.model<Token>("Token", TokenSchema);
