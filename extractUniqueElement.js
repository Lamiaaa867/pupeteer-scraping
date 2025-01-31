import * as cheerio from "cheerio";
import { ensureValidUrl } from "./urlValidation.js";
import axios from "axios";

export const extractUniqueAppElements = async (storeUrl) => {
  try {
    const validUrl = ensureValidUrl(storeUrl);

    const { data: html } = await axios.get(validUrl);

    const $ = cheerio.load(html);
    const websiteName = new URL(validUrl).hostname.replace("www.", "");

    const appBlockData = [];
    const appRegex =
      /<!-- BEGIN app block: shopify:\/\/apps\/([\w-]+)\/blocks\/([\w-]+)\/([\w-]+)/g;

    let match;

    while ((match = appRegex.exec(html)) !== null) {
      const appName = match[1];
      const appUrl = `https://apps.shopify.com/${appName}`;

      const isDuplicate = appBlockData.some((app) => app.searchKey === appName);

      if (!isDuplicate) {
        appBlockData.push({
          element: appUrl,
          searchKey: appName,
        });
      }
    }

    return appBlockData;
  } catch (error) {
    console.error("Error from unique elements:", error.message);
  }
};
