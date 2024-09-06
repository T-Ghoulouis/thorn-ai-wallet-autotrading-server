import { SmartAccount__factory } from "../../../typechain-types";
import { UserOperationStruct } from "../../../typechain-types/EntryPoint";
import { provider } from "../../config";
import { entryPointAddress } from "../../config/address";
import { getUserOpHash } from "../UserOperation/userOp";
import { UserOperation } from "../UserOperation/userOperation";

async function convertV5ToV6(userOp: any) {
    const userOpV6: UserOperationStruct = {
        sender: userOp.sender,
        nonce: BigInt(userOp.nonce),
        initCode: userOp.initCode,
        callData: userOp.callData,
        callGasLimit: BigInt(userOp.callGasLimit),
        verificationGasLimit: userOp.verificationGasLimit,
        preVerificationGas: userOp.preVerificationGas,
        maxFeePerGas: userOp.maxFeePerGas,
        maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
        paymasterAndData: userOp.paymasterAndData,
        signature: userOp.signature,
    };
    return userOpV6;
}

export async function check(userOp: UserOperation) {
    const smartAccount = SmartAccount__factory.connect(userOp.sender, provider);
    const userOpV6 = await convertV5ToV6(userOp);
}
