/* import {
  IERC20,
  EntryPoint,
  EntryPoint__factory,
  SimpleWallet__factory,
} from "../typechain"; */
// import { BytesLike } from "@ethersproject/bytes";
// import { expect } from "chai";

import { ethers } from "ethers";
import { provider } from "../../config";

const panicCodes: { [key: number]: string } = {
    // from https://docs.soliditylang.org/en/v0.8.0/control-structures.html
    0x01: "assert(false)",
    0x11: "arithmetic overflow/underflow",
    0x12: "divide by zero",
    0x21: "invalid enum value",
    0x22: "storage byte array that is incorrectly encoded",
    0x31: ".pop() on an empty array.",
    0x32: "array sout-of-bounds or negative index",
    0x41: "memory overflow",
    0x51: "zero-initialized variable of internal function type",
};

export async function getBalance(address: string): Promise<number> {
    const balance = await provider.getBalance(address);
    return parseInt(balance.toString());
}

export function callDataCost(data: string): number {
    return ethers
        .getBytes(data)
        .map((x: any) => (x === 0 ? 4 : 16))
        .reduce((sum: any, x: any) => sum + x);
}

export const Erc20 = [
    "function transfer(address _receiver, uint256 _value) public returns (bool success)",
    "function transferFrom(address, address, uint256) public returns (bool)",
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
    "function balanceOf(address _owner) public view returns (uint256 balance)",
    "event Approval(address indexed _owner, address indexed _spender, uint256 _value)",
];
