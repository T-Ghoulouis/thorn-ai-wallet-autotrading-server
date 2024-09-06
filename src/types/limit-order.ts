export interface LimitOrder {
    owner: string;
    id: number;
    side: Side;
    tokenUse: string;
    tokenInteract: string;
    amountEntry: BigInt;
    priceEntry: BigInt;
    amountPhase1: BigInt;
    priceTakeProfit: BigInt;
    priceStopLoss: BigInt;
    amountPhase2: BigInt;
    status: Status;
    statusRequest: StatusRequest;
}

export enum Side {
    Null = 0,
    Buy = 1,
    Sell = 2,
    BuyTPSL = 3,
    SellTPSL = 4,
}

export enum Status {
    Null = 0,
    SwapTime = 1,
    ProfitTime = 2,
    SwapSuccess = 3,
    Stoplossed = 4,
    Profited = 5,
    Cancelled = 6,
}

export enum StatusRequest {
    Waiting = 0,
    Freeze = 1,
    Processing = 2,
    Done = 3,
}
