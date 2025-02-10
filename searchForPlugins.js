import puppeteer from "puppeteer";
import fs from "fs";
import { parse } from "json2csv";

const commonCorrections = {
  "triplewhale": "triple whale",
  "looxio": "loox",
  "gorgiaschat": "gorgias chat",
  "judge me": "judge.me",
  "klaviyoio": "klaviyo"
};

function normalizeForMatch(str) {
  let normalized = str.toLowerCase()
    .replace(/-/g, " ") 
    .replace(/[^a-z0-9\s]/g, "") 
    .split(/\s+/)
    .sort()
    .join(" ");

  // Apply corrections dynamically
  for (const [incorrect, correct] of Object.entries(commonCorrections)) {
    const regex = new RegExp(`\\b${incorrect}\\b`, "gi");
    normalized = normalized.replace(regex, correct);
  }

  return normalized;
}

function calculateMatchScore(target, candidate) {
  const targetWords = new Set(target.split(" "));
  const candidateWords = new Set(candidate.split(" "));
  const intersection = [...targetWords].filter((word) => candidateWords.has(word));
  return intersection.length / targetWords.size;
}

function findBestMatch(target, pluginsData) {
  let bestMatch = null;
  let highestScore = 0;

  for (const plugin of pluginsData) {
    if (!plugin.name) continue;
    const normalizedPluginName = normalizeForMatch(plugin.name);
    const score = calculateMatchScore(target, normalizedPluginName);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = plugin;
    }
  }
  return bestMatch;
}

function saveDataToCSV(data, filename = "shopify_apps_plugins.csv") {
  try {
    const csv = parse(data, {
      fields: ["id", "uniqueElement", "pluginIndex", "name", "link", "icon", "createdAt", "updatedAt"],
    });
    fs.writeFileSync(filename, csv);
    console.log(`✅ Data saved to ${filename}`);
  } catch (err) {
    console.error("❌ Error saving CSV:", err);
  }
}

export const searchAppDetails = async (extractedData) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    let allSearchResults = [];
    let totalPluginCount = 0;

    for (const app of extractedData) {
      if (!app.searchKey) continue;
const normalize= normalizeForMatch(app.searchKey)
      console.log(`🔍 Searching for: ${app.searchKey}`);
      let searchUrl = `https://apps.shopify.com/search?q=${encodeURIComponent(normalize)}`;
      let appResults = [];
      let foundDesiredPlugin = false;

      while (searchUrl && !foundDesiredPlugin) {
        try {
          await page.goto(searchUrl, { waitUntil: "networkidle2" });
          await page.waitForSelector(".tw-container #search_app_grid", { timeout: 5000 });
        } catch (e) {
          console.error(`❌ No results found for: ${app.searchKey}`);
          break;
        }

        let uniqueElement = app.element;
        let pluginsData = await page.$$eval('.tw-w-full[data-controller="app-card"]', (elements, uniqueElement) =>
          elements.map((el) => ({
            id: crypto.randomUUID(),
            uniqueElement,
            name: el.getAttribute("data-app-card-name-value") || "Unknown",
            link: el.getAttribute("data-app-card-app-link-value") || "N/A",
            icon: el.getAttribute("data-app-card-icon-url-value") || "N/A",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        , uniqueElement);

        let targetValue = app.searchKey;
        if (app.element) {
          try {
            targetValue = new URL(app.element).pathname.split("/").pop();
          } catch (error) {
            console.error("⚠️ Error extracting slug from app.element:", error.message);
          }
        }

        const normalizedTarget = normalizeForMatch(targetValue);
        let bestMatch = findBestMatch(normalizedTarget, pluginsData);

        if (bestMatch) {
          appResults.push(bestMatch);
          totalPluginCount++;
          console.log(`✅ Found best match: ${bestMatch.name} on ${searchUrl}`);
          foundDesiredPlugin = true;
          break;
        } else {
          console.log(`➡️ No exact match on ${searchUrl}. Checking next page...`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1500)); 

        const nextPageButton = await page.$('a[rel="next"]');
        if (nextPageButton) {
          searchUrl = await page.evaluate((el) => el.href, nextPageButton);
          console.log(`🔄 Moving to next page: ${searchUrl}`);
        } else {
          console.log("❌ No more pages.");
          searchUrl = null;
        }
      }

      allSearchResults.push(...appResults);
      console.log(`📦 Stored ${appResults.length} matching plugin(s) for "${app.searchKey}"`);
    }

    if (allSearchResults.length > 0) {
      saveDataToCSV(allSearchResults);
      fs.writeFileSync("shopify_apps_plugins.json", JSON.stringify(allSearchResults, null, 2));
      console.log(`✅ Total Plugins Extracted: ${totalPluginCount}`);
    } else {
      console.log("⚠️ No plugins found.");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await browser.close();
    console.log("✅ Finished all searches.");
  }
};
