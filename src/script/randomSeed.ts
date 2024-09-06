import crypto from "crypto";

function generateRandomSeed(length = 64) {
    const result = crypto.randomBytes(length).toString("hex");
    console.log(result);
}

generateRandomSeed();
