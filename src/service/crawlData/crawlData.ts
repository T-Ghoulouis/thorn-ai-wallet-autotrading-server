import { log } from "winston";
import { AutoTrading__factory } from "../../../typechain-types";
import { provider } from "../../config";
import { address } from "../UserOperation/solidityTypes";
import logger from "../logs/logService";
import { LimitOrder, Side, Status, StatusRequest } from "../../types/limit-order";
import { addLimitOrder, updateLimitOrder } from "../database/order";

const autoTrading = AutoTrading__factory.connect("0xA5854C6d14cc0A50b093AA0fF98083C1831a4528", provider);

export async function setupAutoCrawlData() {
    await crawlData();

    setInterval(async () => {
        await crawlData();
    }, 30 * 60000);
}

export async function crawlData() {
    const numUser = await autoTrading.numUser();
    let crawDataProimse = [];
    for (let i = 0; i < numUser; i++) {
        crawDataProimse.push(crawlDataUser(i));
    }
    await Promise.all(crawDataProimse);
}

async function crawlDataUser(id: number) {
    const user = await autoTrading.users(id);
    const code = await provider.getCode(user);
    if (code.length <= 3) {
        return;
    }
    const numOrder = await autoTrading.numOrder(user);
    let crawDataPromise = [];
    for (let i = 1; i <= numOrder; i++) {
        crawDataPromise.push(crawlLimitOrder(user, i));
    }
    await Promise.all(crawDataPromise);
}
export async function crawlLimitOrder(user: address, id: number) {
    const data = await autoTrading.orders(user, id);
    let side: Side = Side["Buy"];
    if (
        data.side == 0n ||
        data.status == 6n ||
        data.status == 0n ||
        data.status == 3n ||
        data.status == 4n ||
        data.status == 5n
    ) {
        return;
    }
    if (data.amountEntry == 0n) {
        return;
    }
    switch (data.side) {
        case 1n:
            side = Side["Buy"];
            break;
        case 2n:
            side = Side["Sell"];
            break;
        case 3n:
            side = Side["BuyTPSL"];
            break;
        case 4n:
            side = Side["SellTPSL"];
            break;
    }
    let status: Status = Status["Null"];
    switch (data.status) {
        case 1n:
            status = Status["SwapTime"];
            break;
        case 2n:
            status = Status["ProfitTime"];
            break;
        case 3n:
            status = Status["SwapSuccess"];
            break;
        case 4n:
            status = Status["Stoplossed"];
            break;
        case 5n:
            status = Status["Profited"];
            break;
        case 6n:
            status = Status["Cancelled"];
            break;
    }

    const newOrder: LimitOrder = {
        owner: user,
        id: Number(data.id),
        side: side,
        tokenUse: data.tokenUse,
        tokenInteract: data.tokenInteract,
        amountEntry: data.amountEntry,
        priceEntry: data.priceEntry,
        amountPhase1: data.amountPhase1,
        priceTakeProfit: data.priceTakeProfit,
        priceStopLoss: data.priceStopLoss,
        amountPhase2: data.amountPhase2,
        status: status,
        statusRequest: StatusRequest["Waiting"],
    };

    await updateLimitOrder(newOrder);
}
