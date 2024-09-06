import {
    AbiCoder,
    concat,
    Contract,
    dataSlice,
    encodeBase64,
    ethers,
    getBytes,
    keccak256,
    Signer,
    Wallet,
} from "ethers";
import { UserOperation } from "./userOperation";
import { provider } from "../../config";
import { EntryPoint } from "../../../typechain-types";
import { callDataCost } from "./testUtils";

export function packUserOp(op: UserOperation, forSignature = true): string {
    if (forSignature) {
        return AbiCoder.defaultAbiCoder().encode(
            [
                "address",
                "uint256",
                "bytes32",
                "bytes32",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "bytes32",
            ],
            [
                op.sender,
                op.nonce,
                keccak256(op.initCode),
                keccak256(op.callData),
                op.callGasLimit,
                op.verificationGasLimit,
                op.preVerificationGas,
                op.maxFeePerGas,
                op.maxPriorityFeePerGas,
                keccak256(op.paymasterAndData),
            ]
        );
    } else {
        // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
        return AbiCoder.defaultAbiCoder().encode(
            [
                "address",
                "uint256",
                "bytes",
                "bytes",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "bytes",
                "bytes",
            ],
            [
                op.sender,
                op.nonce,
                op.initCode,
                op.callData,
                op.callGasLimit,
                op.verificationGasLimit,
                op.preVerificationGas,
                op.maxFeePerGas,
                op.maxPriorityFeePerGas,
                op.paymasterAndData,
                op.signature,
            ]
        );
    }
}

export const DefaultsForUserOp: UserOperation = {
    sender: ethers.ZeroAddress,
    nonce: 0,
    initCode: "0x",
    callData: "0x",
    callGasLimit: 0,
    verificationGasLimit: 250000,
    preVerificationGas: 60000,
    maxFeePerGas: 100e9,
    maxPriorityFeePerGas: 100e9,
    paymasterAndData: "0x",
    signature: "0x",
};

export function fillUserOpDefaults(op: Partial<UserOperation>, defaults = DefaultsForUserOp): UserOperation {
    const partial: any = { ...op };
    // we want "item:undefined" to be used from defaults, and not override defaults, so we must explicitly
    // remove those so "merge" will succeed.
    for (const key in partial) {
        if (partial[key] == null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete partial[key];
        }
    }
    const filled = { ...defaults, ...partial };
    return filled;
}

export async function fillUserOp(
    op: Partial<UserOperation>,
    entryPoint: EntryPoint,
    getNonceFunction = "nonce",
    useNonceKey = true,
    nonceKey = 0
) {
    const op1 = { ...op };

    if (op1.nonce == null) {
        const c = new Contract(op.sender!, [`function nonce(uint192) view returns(uint256)`], provider);
        op1.nonce = await c.nonce(nonceKey);
    }

    if (op.initCode != null) {
        const initAddr = dataSlice(op1.initCode!, 0, 20);
        const initCallData = dataSlice(op1.initCode!, 20);
        if (op1.nonce == null) op1.nonce = 0;

        if (op1.verificationGasLimit == null) {
            if (provider == null) throw new Error("no entrypoint/provider");
            let initEstimate;
            try {
                initEstimate = await provider.estimateGas({
                    from: await entryPoint?.getAddress(),
                    to: initAddr,
                    data: initCallData,
                    gasLimit: 10e6,
                });
            } catch (error) {
                initEstimate = 1_000_000;
            }
            op1.verificationGasLimit = BigInt(DefaultsForUserOp.verificationGasLimit) + BigInt(initEstimate);
        }
    }

    if (op1.callGasLimit == null && op.callData != null) {
        if (provider == null) throw new Error("must have entryPoint for callGasLimit estimate");
        let gasEstimated;
        try {
            gasEstimated = await provider.estimateGas({
                from: await entryPoint?.getAddress(),
                to: op1.sender,
                data: op1.callData!,
            });
        } catch (error) {
            gasEstimated = 3_000_000;
        }
        op1.callGasLimit = gasEstimated;
    }

    if (op1.maxFeePerGas == null) {
        op1.maxFeePerGas = 100e9;
    }
    if (op1.maxPriorityFeePerGas == null) {
        op1.maxPriorityFeePerGas = DefaultsForUserOp.maxPriorityFeePerGas;
    }
    const op2 = fillUserOpDefaults(op1);

    if (op2.preVerificationGas.toString() === "0") {
        op2.preVerificationGas = callDataCost(packUserOp(op2, false));
    }
    return op2;
}

export function getUserOpHash(op: UserOperation, entryPoint: string, chainId: number): string {
    const userOpHash = keccak256(packUserOp(op, true));
    console.log(" userOpHash", userOpHash);
    const enc = AbiCoder.defaultAbiCoder().encode(["bytes32", "address", "uint256"], [userOpHash, entryPoint, chainId]);
    return keccak256(enc);
}

export async function fillAndSign(
    op: Partial<UserOperation>,
    signer: Wallet | Signer,
    entryPoint?: EntryPoint,
    getNonceFunction = "nonce",
    useNonceKey = true,
    nonceKey = 0,
    extraPreVerificationGas = 0
) {
    const op2 = await fillUserOp(op, entryPoint!, getNonceFunction, useNonceKey, nonceKey);
    op2.preVerificationGas = Number(op2.preVerificationGas) + extraPreVerificationGas;

    const chainId = await provider!.getNetwork().then((net) => net.chainId);
    console.log("chainId", chainId);

    const message = getBytes(getUserOpHash(op2, await entryPoint!.getAddress(), Number(chainId)));

    return {
        ...op2,
        signature: await signer.signMessage(message),
    };
}
