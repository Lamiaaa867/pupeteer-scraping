import puppeteer from 'puppeteer';
import fs from 'fs';
import { parse } from 'json2csv';
import { v4 as uuidv4 } from 'uuid';

// Utility: Normalize text for better matching
function normalizeForMatch(str) {
  return str
    .toLowerCase()
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters
    .split(/\s+/) // Split into words
    .sort() // Sort for consistent comparison
    .join(' '); // Rejoin into a single string
}

// Utility: Calculate how similar two strings are (word match ratio)
function calculateMatchScore(target, candidate) {
  const targetWords = new Set(target.split(' '));
  const candidateWords = new Set(candidate.split(' '));
  const intersection = [...targetWords].filter(word => candidateWords.has(word));
  return intersection.length / targetWords.size; // Ratio of matched words
}

// Utility: Find the best matching plugin from a list
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

// Utility: Save data to CSV
function saveDataToCSV(data, filename = 'shopify_apps_plugins.csv') {
  try {
    const csv = parse(data, { fields: ['id', 'uniqueElement', 'pluginIndex', 'name', 'link', 'icon', 'createdAt', 'updatedAt'] });
    fs.writeFileSync(filename, csv);
    console.log(`✅ Data saved to ${filename}`);
  } catch (err) {
    console.error('❌ Error saving CSV:', err);
  }
}

// Main Function: Search for app details
export const searchAppDetails = async (extractedData) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    let allSearchResults = [];
    let totalPluginCount = 0;

    for (const app of extractedData) {
      if (!app.searchKey) continue;

      console.log(`🔍 Searching for: ${app.searchKey}`);
      let searchUrl = `https://apps.shopify.com/search?q=${encodeURIComponent(app.searchKey)}`;
      let appResults = [];
      let pluginIndex = 1;
      let foundDesiredPlugin = false;

      while (searchUrl && !foundDesiredPlugin) {
        try {
          await page.goto(searchUrl, { waitUntil: 'networkidle2' });
          await page.waitForSelector('.tw-container #search_app_grid', { timeout: 5000 });
        } catch (e) {
          console.error(`❌ No results found for: ${app.searchKey}`);
          break;
        }

        let uniqueElement = app.element;

        // Extract plugin details efficiently using Promise.all
        let pluginsData = await page.$$eval(
          '.tw-w-full[data-controller="app-card"]',
          (elements, pluginIndex, uniqueElement) =>
            elements.map((el, idx) => ({
              id: crypto.randomUUID(), // Use native UUID generator
              pluginIndex: pluginIndex + idx,
              uniqueElement,
              name: el.getAttribute('data-app-card-name-value') || 'Unknown',
              link: el.getAttribute('data-app-card-app-link-value') || 'N/A',
              icon: el.getAttribute('data-app-card-icon-url-value') || 'N/A',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
          pluginIndex,
          uniqueElement
        );

        let targetValue = app.searchKey;
        if (app.element) {
          try {
            targetValue = new URL(app.element).pathname.split('/').pop();
          } catch (error) {
            console.error('⚠️ Error extracting slug from app.element:', error.message);
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

        pluginIndex += pluginsData.length;
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Reduce wait time

        const nextPageButton = await page.$('a[rel="next"]');
        if (nextPageButton) {
          searchUrl = await page.evaluate(el => el.href, nextPageButton);
          console.log(`🔄 Moving to next page: ${searchUrl}`);
        } else {
          console.log('❌ No more pages.');
          searchUrl = null;
        }
      }

      allSearchResults.push(...appResults);
      console.log(`📦 Stored ${appResults.length} matching plugin(s) for "${app.searchKey}"`);
    }

    // Save results
    if (allSearchResults.length > 0) {
      saveDataToCSV(allSearchResults);
      fs.writeFileSync('shopify_apps_plugins.json', JSON.stringify(allSearchResults, null, 2));
      console.log(`✅ Total Plugins Extracted: ${totalPluginCount}`);
    } else {
      console.log('⚠️ No plugins found.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Finished all searches.');
  }
};
