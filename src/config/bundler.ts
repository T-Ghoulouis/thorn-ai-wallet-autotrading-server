import { Bundler } from "@biconomy/bundler";

export const bundler = new Bundler({
    bundlerUrl: process.env.BUNDLER_MAINNET_URL!,
    chainId: Number(23294),
    entryPointAddress: "0x90cf31349Bc09Fb7eBBcdEbFaB61940030ecd696",
    userOpReceiptMaxDurationIntervals: {
        [Number(23294)]: 60000,
    },
    userOpWaitForTxHashMaxDurationIntervals: {
        [Number(23294)]: 60000,
    },
});
