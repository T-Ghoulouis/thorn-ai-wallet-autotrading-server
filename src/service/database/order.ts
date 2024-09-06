import { LimitOrderModel } from "../../models/limit-order";
import { LimitOrder, Side, Status, StatusRequest } from "../../types/limit-order";
import logger from "../logs/logService";

export async function checkAndDelete(owner: string, id: number) {
    try {
        const order = await LimitOrderModel.findOne({ owner: owner, id: id });
        if (!order) {
            logger.error(`Order with id ${id} not found`);
            return;
        }
        await LimitOrderModel.deleteOne({ owner: owner, id: id });
        logger.info(`Order with id ${id} deleted successfully`);
    } catch (error) {
        logger.error("Error deleting limit order:", error);
    }
}

export async function updateLimitOrder(limit: LimitOrder) {
    try {
        const existingOrder = await LimitOrderModel.findOne({ owner: limit.owner, id: limit.id });

        if (existingOrder) {
            await LimitOrderModel.updateOne(
                { owner: limit.owner, id: limit.id },
                {
                    $set: {
                        tokenInteract: limit.tokenInteract,
                        side: limit.side,
                        status: limit.status,
                        statusRequest: limit.statusRequest,
                        priceEntry: limit.priceEntry,
                        priceTakeProfit: limit.priceTakeProfit,
                        priceStopLoss: limit.priceStopLoss,
                        // add more fields as needed
                    },
                }
            );
            logger.info(`Order with id ${limit.id} updated successfully`);
        } else {
            await LimitOrderModel.create(limit);
            logger.info(`Order with id ${limit.id} created successfully`);
        }
    } catch (error) {
        logger.error("Error updating or creating limit order:", error);
    }
}

export async function addLimitOrder(limit: LimitOrder) {
    const existingOrder = await LimitOrderModel.findOne({ owner: limit.owner, id: limit.id });
    if (existingOrder) {
        // logger.error(`Order with id ${limit.id} already exists`);
        return;
    }
    await LimitOrderModel.create(limit);
}

export async function getLimitOrderByAddressAndId(address: string, id: number) {
    try {
        const order = await LimitOrderModel.findOne({ owner: address, id: id });
        return order;
    } catch (error) {
        logger.error("Error fetching limit order:", error);
    }
}

export async function getLimitOrdersBuyHasPriceEntryBiggerThanPrice(token: string, price: BigInt) {
    try {
        const orders = await LimitOrderModel.find({
            tokenInteract: token,
            side: { $in: [Side.Buy, Side.BuyTPSL] },
            status: Status.SwapTime,
            statusRequest: StatusRequest.Waiting,
            priceEntry: { $gt: price },
        });
        return orders;
    } catch (error) {
        console.error("Error fetching limit orders:", error);
    }
}

export async function getLimitOrdersSellHasPriceEntrySmallerThanPrice(token: string, price: number) {
    try {
        const orders = await LimitOrderModel.find({
            token: token,
            side: { $in: [Side.Sell, Side.SellTPSL] },
            status: Status.SwapTime,
            priceEntry: { $lt: price },
        });
        return orders;
    } catch (error) {
        console.error("Error fetching limit orders:", error);
    }
}

export async function getLimitOrdersBuyTakeProfitPriceSmallerThanPrice(token: string, price: number) {
    try {
        const orders = await LimitOrderModel.find({
            token: token,
            side: Side.BuyTPSL,
            status: Status.ProfitTime,
            priceTakeProfit: { $gt: price },
        });
        return orders;
    } catch (error) {
        console.error("Error fetching limit orders:", error);
    }
}

export async function getLimitOrderSellTakeProfitPriceSmallerThanPrice(token: string, price: number) {
    try {
        const orders = await LimitOrderModel.find({
            token: token,
            side: Side.SellTPSL,
            status: Status.ProfitTime,
            priceTakeProfit: { $lt: price },
        });
        return orders;
    } catch (error) {
        console.error("Error fetching limit orders:", error);
    }
}

export async function getLimitOrderBuyStoplossPriceBiggerThanPrice(token: string, price: number) {
    try {
        const orders = await LimitOrderModel.find({
            token: token,
            side: Side.BuyTPSL,
            status: Status.ProfitTime,
            priceStopLoss: { $lt: price },
        });
        return orders;
    } catch (error) {
        console.error("Error fetching limit orders:", error);
    }
}

export async function getLimitOrderSellStoplossPriceBiggerThanPrice(token: string, price: number) {
    try {
        const orders = await LimitOrderModel.find({
            token: token,
            side: Side.SellTPSL,
            status: Status.ProfitTime,
            priceStopLoss: { $gt: price },
        });
        return orders;
    } catch (error) {
        console.error("Error fetching limit orders:", error);
    }
}

export async function updateStatusRequestLimitOrder(orders: LimitOrder[], statusRequest: StatusRequest) {
    try {
        const updatedOrders = await Promise.all(
            orders.map((order) => {
                try {
                    return LimitOrderModel.findOneAndUpdate(
                        { owner: order.owner, id: order.id },
                        { statusRequest: statusRequest }
                    );
                } catch {
                    logger.error(`Order with id ${order.id} not found`);
                }
            })
        );
        // Trả về mảng các đơn hàng đã được cập nhật
        return updatedOrders;
    } catch (error) {
        console.error("Error updating status request for limit orders:", error);
        throw error; // Ném lỗi để có thể xử lý ngoài hàm nếu cần
    }
}

export async function updateLimitPrice(
    user: string,
    id: number,
    priceEntry: BigInt,
    priceTakeProfit: BigInt,
    priceStopLoss: BigInt
) {
    try {
        const updatedOrder = await LimitOrderModel.findOneAndUpdate(
            { owner: user, id: id },
            {
                priceEntry: priceEntry.toString(),
                priceTakeProfit: priceTakeProfit.toString(),
                priceStopLoss: priceStopLoss.toString(),
            },
            { new: true }
        );
        if (!updatedOrder) {
            logger.error(`Order with id ${id} not found`);
        }
        return updatedOrder;
    } catch (error) {
        logger.error("Error updating limit order:", error);
    }
}

export async function updateStatusLimitOrder(user: string, id: number, status: Status) {
    try {
        const updatedOrder = await LimitOrderModel.findOneAndUpdate(
            { owner: user, id: id },
            { status: status },
            { new: true }
        );
        if (!updatedOrder) {
            logger.error(`Order with id ${id} not found`);
        }
        return updatedOrder;
    } catch (error) {
        logger.error("Error updating limit order:", error);
    }
}

export async function getLimitOrdersByUser(user: string, id: number) {
    try {
        const order = await LimitOrderModel.findOne({ owner: user, id: id });
        return order;
    } catch (error) {
        logger.error("Error fetching limit order:", error);
    }
}
