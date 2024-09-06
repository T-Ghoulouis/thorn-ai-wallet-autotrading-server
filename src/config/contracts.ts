import { provider } from ".";
import { AutoTrading__factory } from "../../typechain-types";
import { autoTradingAddress } from "./address";

export const autoTradingContract = AutoTrading__factory.connect(autoTradingAddress, provider);
