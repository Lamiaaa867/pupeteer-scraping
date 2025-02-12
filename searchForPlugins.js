import puppeteer from "puppeteer";
import fs from "fs";
import { parse } from "json2csv";
import crypto from "crypto";

// Common name corrections for better matching
const commonCorrections = {
  "triplewhale": "triple whale",
  "upcart": "up cart",
  "kaching-bundles": "kaching bundles",
  "product-options": "product options",
  "looxio": "Loox",
  "gorgiaschat": "gorgias chat",
  "judge me": "judge.me",
  "klaviyoio": "klaviyo"
};

// Normalize names to improve matching
function normalizeForMatch(str) {
  if (!str) return "";
  let normalized = str
    .toLowerCase()
    .replace(/-/g, " ") 
    .replace(/[^a-z0-9\s]/g, "") 
    .split(/\s+/)
    .join(" ");

  // Apply corrections dynamically
  for (const [incorrect, correct] of Object.entries(commonCorrections)) {
    const regex = new RegExp(`\\b${incorrect}\\b`, "gi");
    normalized = normalized.replace(regex, correct);
  }

  return normalized;
}

// Calculate similarity score
function calculateMatchScore(target, candidate) {
  if (!target || !candidate) return 0;
  
  const targetWords = new Set(target.split(" "));
  const candidateWords = new Set(candidate.split(" "));
  const intersection = [...targetWords].filter((word) => candidateWords.has(word));
  
  return intersection.length / targetWords.size;
}

// Find the best match plugin name
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

// Save data to CSV
function saveDataToCSV(data, filename = "digifeel_apps_plugins.csv") {
  try {
    const csv = parse(data, {
      fields: ["id", "uniqueElement", "name", "link", "icon", "createdAt", "updatedAt"],
    });
    fs.writeFileSync(filename, csv);
    console.log(`✅ Data saved to ${filename}`);
  } catch (err) {
    console.error("❌ Error saving CSV:", err);
  }
}

// Search and extract Shopify app details
export const searchAppDetails = async (extractedData) => {
  // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser', // Use Alpine-installed Chromium
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--single-process"
    ]
  });
  const page = await browser.newPage();

  try {
    let allSearchResults = [];
    let totalPluginCount = 0;

    for (const app of extractedData) {
      if (!app.searchKey) continue;

      console.log(`🔍 Searching for: ${app.searchKey}`);
      let searchUrl = `https://apps.shopify.com/search?q=${encodeURIComponent(app.searchKey)}`;
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
        let pluginsData = await page.$$eval('.tw-w-full[data-controller="app-card"]', (elements,uniqueElement) =>
          elements.map((el) => ({
            id: crypto.randomUUID(),
            uniqueElement,
            name: el.getAttribute("data-app-card-name-value") || "Unknown",
            link: el.getAttribute("data-app-card-app-link-value") || "N/A",
            icon: el.getAttribute("data-app-card-icon-url-value") || "N/A",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })));
        let targetValue = app.searchKey;
  

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
