import { add } from "winston";
import { IERC20__factory, PrivateWrapperFactory__factory } from "../../../typechain-types";
import { provider } from "../../config";
import { privateWrapperFactoryAddress } from "../../config/address";
import { TokenModel } from "../../models/tokens";

export async function getAllTokens() {
    const tokens = await TokenModel.find();
    return tokens;
}

export async function getPrivateTokens(address: string) {
    if (address == "0xeC240a739D04188D83E9125CECC2ea88fABd9B08") {
        return "0x9Ca066f00e55b90623eFe323feB2A649686538b6";
    }
    try {
        const token = await TokenModel.findOne({ address });
        if (!token) {
            throw new Error("Token not found");
        }
        return token.privateAddress;
    } catch (error) {
        console.error("Error fetching token:", error);
        throw error;
    }
}

export async function getToken(address: string) {
    try {
        const token = await TokenModel.findOne({ address });
        if (!token) {
            throw new Error("Token not found");
        }
        return token;
    } catch (error) {
        console.error("Error fetching token:", error);
        throw error;
    }
}

export async function addToken(address: string) {
    const contract = IERC20__factory.connect(address, provider);
    const symbolPromise = contract.symbol();
    const decimalsPromise = contract.decimals();
    const namePromise = contract.name();
    const privateFactoryContract = PrivateWrapperFactory__factory.connect(privateWrapperFactoryAddress, provider);
    const privateAddressPromise = privateFactoryContract.wrappers(address);
    const [symbol, decimals, name, privateAddress] = await Promise.all([
        symbolPromise,
        decimalsPromise,
        namePromise,
        privateAddressPromise,
    ]);
    const newToken = new TokenModel({
        name,
        symbol,
        address,
        decimals,
        privateAddress,
    });
    try {
        const existingToken = await TokenModel.findOne({ address });
        if (!existingToken) {
            await newToken.save();
            console.log(`Token at ${address} added successfully.`);
        }
    } catch (error) {
        // console.error(`Failed to add/update token at ${address}:`, error);
    }
}
