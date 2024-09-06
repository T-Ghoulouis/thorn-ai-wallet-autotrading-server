import { LimitOrder } from "../../types/limit-order";
import { UserOperation } from "../UserOperation/userOperation";

const mempool: {
    userOp: UserOperation;
    order: LimitOrder;
}[] = [];

export async function AddToMempool(data: { order: LimitOrder; userOp: UserOperation }) {
    mempool.push(data);
}

export async function getAllUserOpFromMempool() {
    return mempool;
}
