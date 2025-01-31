import puppeteer from "puppeteer";
import fs from "fs";

import { saveToCSV } from "./csvFormat.js";

export const searchAppDetails = async (extractedData) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    let allSearchResults = [];
    let totalPluginCount = 0;

    for (const app of extractedData) {
      if (!app.searchKey) continue;

      console.log(`🔍 Searching for: ${app.searchKey}`);
      let searchUrl = `https://apps.shopify.com/search?q=${encodeURIComponent(
        app.searchKey
      )}`;

      let appResults = [];
      let pluginIndex = 1;
      while (searchUrl) {
        await page.goto(searchUrl, { waitUntil: "networkidle2" });

        try {
          await page.waitForSelector(".tw-container #search_app_grid", {
            timeout: 5000,
          });
        } catch (e) {
          console.error(` No results found for: ${app.searchKey}`);
          break;
        }

        // Extract plugin details
        const pluginsData = await page.$$eval(
          '.tw-w-full[data-controller="app-card"]',
          (elements, pluginIndex) =>
            elements.map((el, idx) => ({
              id:
                el.getAttribute("data-app-card-name-value") +
                `plugin-${pluginIndex + idx}`,
              pluginIndex: pluginIndex + idx,
              name: el.getAttribute("data-app-card-name-value") || null,
              link: el.getAttribute("data-app-card-app-link-value") || null,
              icon: el.getAttribute("data-app-card-icon-url-value") || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
          pluginIndex
        );

        appResults.push(...pluginsData);
        totalPluginCount += pluginsData.length;
        pluginIndex += pluginsData.length;
        console.log(
          ` Extracted ${pluginsData.length} plugins from ${searchUrl}`
        );

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const nextPageButton = await page.$('a[rel="next"]');
        if (nextPageButton) {
          searchUrl = await page.evaluate((el) => el.href, nextPageButton);
          console.log(" Going to next page:", searchUrl);
        } else {
          console.log("No more pages.");
          searchUrl = null;
        }
      }
      saveToCSV(appResults);

      allSearchResults.push({
        searchKey: app.searchKey,
        totalPlugins: appResults.length,
        plugins: appResults,
      });

      console.log(
        ` Stored ${appResults.length} plugins for "${app.searchKey}"`
      );
    }

    const outputData = {
      totalPlugins: totalPluginCount,
      searches: allSearchResults,
    };
    fs.writeFileSync(
      "shopify_apps_plugins.json",
      JSON.stringify(outputData, null, 2)
    );

    console.log(` Total Plugins Extracted: ${totalPluginCount}`);
    console.log(" Data saved to shopify_apps_plugins.json");
  } catch (error) {
    console.error(" Error:", error.message);
  } finally {
    await browser.close();
    console.log("Finished all searches.");
  }
};
