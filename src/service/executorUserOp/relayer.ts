import { formatEther, formatUnits, hexlify, Wallet } from "ethers";
import HDKey from "hdkey";
import { Mutex } from "async-mutex";
import { provider } from "../../config";

const numberRelayers = 2;

export interface Relayer {
    wallet: Wallet;
    mutex: Mutex;
    locker: boolean;
}

const relayers: Relayer[] = [];

export async function setupRelayer() {
    const seed = process.env.SEED!;
    const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
    for (let i = 0; i < numberRelayers; i++) {
        const path = `m/44'/60'/0'/0/${i}`;
        const childKey = hdkey.derive(path);
        console.log("childKey", childKey.privateKey);
        const wallet = new Wallet(hexlify(childKey.privateKey));

        const balance = Number(formatUnits(await provider.getBalance(wallet.address), 18));
        if (balance >= 1) {
            const mutex = new Mutex();
            relayers.push({ wallet, mutex, locker: false });
        }
    }
}

export async function getFreeRelayerAndLockIt() {
    for (const relayer of relayers) {
        if (!relayer.locker) {
            relayer.locker = true;
            return relayer;
        }
    }
    return null;
}
