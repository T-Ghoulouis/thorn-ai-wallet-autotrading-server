import { parseUnits } from "ethers";
import { getAllTokens, getToken } from "../database/tokens";
import { provider } from "../../config";
import { ILuminexRouterV1__factory } from "../../../typechain-types";

export async function getPriceTokenAtBlockNumber(tokenAddress: string, blocknumber: number) {
    const token = await getToken(tokenAddress);
    const privateUSDT = "0x9Ca066f00e55b90623eFe323feB2A649686538b6";

    const oneUnit = parseUnits("1", Number(token.decimals));

    const path = [token.privateAddress, privateUSDT];

    const route = ILuminexRouterV1__factory.connect("0x5b82acbDe21bda0E9E277BF29A0F84f8deB5F1A7", provider);

    const price = await route.getAmountsOut(oneUnit, path, {
        blockTag: blocknumber,
    });
    return price[1];
}

export async function getPriceOnChain() {
    const tokensDB = await getAllTokens();
    const privateUSDT = "0x9Ca066f00e55b90623eFe323feB2A649686538b6";
    let tokens: any = [];
    tokensDB.forEach((token: any) => {
        const oneUnit = parseUnits("1", Number(token.decimals));
        const path = [token.privateAddress, privateUSDT];
        tokens.push({
            name: token.name,
            address: token.address,
            privateAddress: token.privateAddress,
            decimals: token.decimals,
            oneUnit: oneUnit,
            path: path,
        });
    });
    const route = ILuminexRouterV1__factory.connect("0x5b82acbDe21bda0E9E277BF29A0F84f8deB5F1A7", provider);
    let requestPricePromise: any = [];
    tokens.forEach((req: any) => {
        requestPricePromise.push(route.getAmountsOut(req.oneUnit, req.path));
    });
    const prices = await Promise.all(requestPricePromise);
    tokens.forEach((token: any, index: any) => {
        token.priceUSD = prices[index][1];
    });
    return tokens;
}
