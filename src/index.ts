import { setupAuto } from "./service/auto";
import { setupAutoCrawlData } from "./service/crawlData/crawlData";
import logger from "./service/logs/logService";
import { config } from "dotenv";
config();

async function main() {
    logger.info("Starting the application");
    await setupAutoCrawlData();
    await setupAuto();
}

main();
