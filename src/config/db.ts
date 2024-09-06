import mongoose from "mongoose";

import { config } from "dotenv";
import logger from "../service/logs/logService";
config();
const commonConnectionOptions = {
    user: process.env.MONGO_USERNAME!,
    pass: process.env.MONGO_PASSWORD!,
    autoCreate: true,
    autoIndex: true,
};

export const autoTradeDB = mongoose.createConnection(process.env.MONGO_URL!, {
    ...commonConnectionOptions,
    dbName: "thorn-auto-trade",
});

autoTradeDB.on("open", () => {
    logger.info("Connected to the auto-trade database");
});
