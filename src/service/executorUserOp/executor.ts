import { Mutex } from "async-mutex";

import { getFreeRelayerAndLockIt, setupRelayer } from "./relayer";
import { UserOperation } from "../UserOperation/userOperation";
import { EntryPoint__factory } from "../../../typechain-types";
import { entryPointAddress } from "../../config/address";
import { provider } from "../../config";
import { getAllUserOpFromMempool } from "./mempool";
import { LimitOrder } from "../../types/limit-order";

const mutex = new Mutex();

const entrypointContract = EntryPoint__factory.connect(entryPointAddress, provider);

export async function setupExecuteUserOp() {
    await setupRelayer();
    setInterval(async () => {
        mutex.runExclusive(async () => {
            const datas = await getAllUserOpFromMempool();
            for (let i = 0; i < datas.length; i += 4) {
                const orderChunk = datas.slice(i, i + 4);
                await processOrderChunk(orderChunk);
            }
        });
    }, 5000);
}

async function processOrderChunk(orderChunk: { order: LimitOrder; userOp: UserOperation }[]) {
    const relayer = await getFreeRelayerAndLockIt();
    if (relayer == null) return;
    const publickey = relayer?.wallet.address;
    console.log("publickey", publickey);
    const userOps = orderChunk.map((data) => data.userOp);
    const response = await entrypointContract.connect(relayer?.wallet).handleOps(userOps, publickey!);
    const receipt = await response.wait();
    console.log(receipt);
}
