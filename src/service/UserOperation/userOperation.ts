import { BigNumberish, BytesLike } from "ethers";
import * as typ from "./solidityTypes";

export type UserOperation = {
    sender: string;
    nonce: BigNumberish;
    initCode: BytesLike;
    callData: string;
    callGasLimit: BigNumberish;
    verificationGasLimit: BigNumberish;
    preVerificationGas: BigNumberish;
    maxFeePerGas: BigNumberish;
    maxPriorityFeePerGas: BigNumberish;
    paymasterAndData: BytesLike;
    signature: BytesLike;
};
