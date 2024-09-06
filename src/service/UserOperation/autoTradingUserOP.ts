import { AbiCoder, ethers, Wallet } from "ethers";
import {
    AutoTrading__factory,
    EntryPoint__factory,
    PrivateWrapperFactory__factory,
    SmartAccount__factory,
} from "../../../typechain-types";
import { fillAndSign } from "./userOp";
import { LimitOrder } from "../../types/limit-order";
import { autoTradingAddress, entryPointAddress } from "../../config/address";
import { provider } from "../../config";
import { config } from "dotenv";
import { getPrivateTokens } from "../database/tokens";
config();

const entryPoint = EntryPoint__factory.connect(entryPointAddress, provider);
const AutoTrading = AutoTrading__factory.connect(autoTradingAddress, provider);
const authorizationKey = new Wallet(process.env.AUTHORIZATION_KEY!);
const moduleAddress = "0x83a753ee2cCDa7Ea352624222DD6AAc35A1F7183";

const wrapper = PrivateWrapperFactory__factory.connect("0xb539f1D01A437C7f30cAfC994e918F952dDc0bA2", provider);

export async function makeAutoBuyUserOp(order: LimitOrder) {
    const private_0 = await getPrivateTokens(order.tokenUse);
    const private_1 = await getPrivateTokens(order.tokenInteract);
    const path = [private_0, private_1];
    const txBuy = await AutoTrading.autoBuy.populateTransaction(Number(order.id), path);
    const userOp = await makeAutoTradingOp(order, txBuy);
    return userOp;
}

export async function makeAutoSellUserOp(order: LimitOrder) {
    const private_0 = await getPrivateTokens(order.tokenUse);
    const private_1 = await getPrivateTokens(order.tokenInteract);
    const path = [private_0, private_1];
    const txSell = await AutoTrading.autoSell.populateTransaction(Number(order.id), path);
    const userOp = await makeAutoTradingOp(order, txSell);
    return userOp;
}

export async function makeAutoTradingOp(order: LimitOrder, tx: any, nonceKey = 0) {
    const smartAccountInterface = SmartAccount__factory.createInterface();
    const txnData = smartAccountInterface.encodeFunctionData("execute_ncC", [tx.to, 0, tx.data]);

    const userOp = await fillAndSign(
        {
            sender: order.owner,
            callData: txnData,
        },
        authorizationKey,
        entryPoint,
        "nonce",
        true,
        nonceKey,
        0
    );
    const signatureWithModuleAddress = AbiCoder.defaultAbiCoder().encode(
        ["bytes", "address"],
        [userOp.signature, moduleAddress]
    );
    userOp.signature = signatureWithModuleAddress;
    return userOp;
}
