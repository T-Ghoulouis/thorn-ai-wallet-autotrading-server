import { Schema } from "mongoose";
import { LimitOrder } from "../types/limit-order";
import { autoTradeDB } from "../config/db";

const LimitOrderSchema = new Schema<LimitOrder>({
    owner: { type: String, required: true },
    id: { type: Number, required: true },
    side: { type: Number, required: true },
    tokenUse: { type: String, required: true },
    tokenInteract: { type: String, required: true },
    amountEntry: { type: Schema.Types.BigInt, required: true },
    priceEntry: { type: Schema.Types.BigInt, required: true },
    amountPhase1: { type: Schema.Types.BigInt, required: true },
    priceTakeProfit: { type: Schema.Types.BigInt, required: true },
    priceStopLoss: { type: Schema.Types.BigInt, required: true },
    amountPhase2: { type: Schema.Types.BigInt, required: true },
    status: { type: Number, required: true },
    statusRequest: { type: Number, required: true },
});

export const LimitOrderModel = autoTradeDB.model<LimitOrder>("LimitOrder", LimitOrderSchema);
