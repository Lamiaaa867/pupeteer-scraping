import axios from 'axios';
import * as cheerio from 'cheerio';
import url from 'url';
import ensureValidUrl from './urlValidation.js';

export const extractShopifyPlugins = async (storeUrl) => {
  try {
    const validUrl = ensureValidUrl(storeUrl);
    const { data: html } = await axios.get(validUrl);
    const $ = cheerio.load(html);

const appBlockData=new Set()

    // Extract Shopify app blocks from HTML comments
    const appRegex = /<!-- BEGIN app block: shopify:\/\/apps\/([\w-]+)\/blocks\/([\w-]+)\/([\w-]+)/g;
    let match;
    while ((match = appRegex.exec(html)) !== null) {
      const appName = match[1];
      appBlockData.add(JSON.stringify({ element: `https://apps.shopify.com/${appName}`, searchKey: appName }));
    }

    const extractedApps = Array.from(appBlockData).map(JSON.parse);
    console.log("📦 Extracted Shopify Apps:", extractedApps);
    return extractedApps;
  } catch (error) {
    console.error("❌ Error scraping Shopify plugins:", error.message);
    return [];
  }
};
