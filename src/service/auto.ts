import { Mutex } from "async-mutex";
import { getLimitOrdersBuyHasPriceEntryBiggerThanPrice, updateStatusRequestLimitOrder } from "./database/order";
import { makeAutoBuyUserOp } from "./UserOperation/autoTradingUserOP";
import { UserOperation } from "./UserOperation/userOperation";
import { LimitOrder, StatusRequest } from "../types/limit-order";

import { getPriceOnChain } from "./priceService/priceService";
import { crawlLimitOrder } from "./crawlData/crawlData";
import { bundler } from "../config/bundler";
import logger from "./logs/logService";

const mutex = new Mutex();

export async function setupAuto() {
    await runTrigger();

    setInterval(async () => {
        await runTrigger();
    }, 30 * 1000);
}

async function runTrigger() {
    await mutex.runExclusive(async () => {
        let orders: LimitOrder[] = [];
        let userOp_promise: any = [];

        const tokens = await getPriceOnChain();

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            let buy_order = await getLimitOrdersBuyHasPriceEntryBiggerThanPrice(token.address, token.priceUSD);
            if (buy_order !== null)
                buy_order!.forEach((order: any) => {
                    orders.push(order);
                    userOp_promise.push(makeAutoBuyUserOp(order));
                });
        }

        let userOps: UserOperation[] = await Promise.all(userOp_promise);
        let data: {
            userOp: UserOperation;
            order: LimitOrder;
        }[] = [];
        for (let i = 0; i < userOps.length; i++) {
            data.push({
                userOp: userOps[i],
                order: orders[i],
            });
        }

        const uniqueData: {
            userOp: UserOperation;
            order: LimitOrder;
        }[] = [];
        const uniqueLimitOrder: LimitOrder[] = [];
        const seenSenders = new Set<string>();
        data.forEach((a: any) => {
            if (!seenSenders.has(a.userOp.sender)) {
                seenSenders.add(a.userOp.sender);
                uniqueLimitOrder.push();
                uniqueData.push(a);
            }
        });

        logger.debug(`trigger limit ${uniqueData.length}`);

        for (let i = 0; i < uniqueData.length; i++) {
            const userOp = uniqueData[i].userOp;
            try {
                await updateStatusRequestLimitOrder([uniqueData[i].order], StatusRequest.Processing);
                const response = await bundler.sendUserOp(userOp);
                const receipt = await response.wait();
                console.log(receipt);
                if (receipt.success == true) {
                    await crawlLimitOrder(uniqueData[i].order.owner, uniqueData[i].order.id);
                }
            } catch (error) {
                console.log(error);
            }
        }
    });
}
