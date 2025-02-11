import { extractShopifyPlugins} from "./extractUniqueElement.js";
import fs from "fs";


import { searchAppDetails } from "./searchForPlugins.js";
import { extractShopifyPluginsWithPupeteer } from "./extractPlugins.js";
const processStores = async () => {
  const uniqueElements = await extractShopifyPluginsWithPupeteer("www.digifeel.io");

  if (uniqueElements === undefined) {
    console.error("Data to write is undefined");
  } else {
    fs.writeFileSync("digifeel_plugins.json", JSON.stringify(uniqueElements, null, 2));
    console.log("Data saved to website plugins .json");
  }
  searchAppDetails(uniqueElements);
};
processStores();
