import { extractUniqueAppElements } from "./extractUniqueElement.js";
import fs from "fs";


import { searchAppDetails } from "./searchForPlugins.js";
const processStores = async () => {
  const uniqueElements = await extractUniqueAppElements("www.dorado.com");

  if (uniqueElements === undefined) {
    console.error("Data to write is undefined");
  } else {
    fs.writeFileSync(
      "websitePlugins.json",
      JSON.stringify(uniqueElements, null, 2)
    );
    console.log("Data saved to website plugins .json");
  }
  searchAppDetails(uniqueElements);
};
processStores();
