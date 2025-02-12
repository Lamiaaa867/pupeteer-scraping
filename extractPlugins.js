import puppeteer from "puppeteer";

// Regex pattern to match known Shopify & Social Media plugins
const pluginRegex =
  /(klaviyo|rebuy|aftersell|candyrack|cartc-drawer|upcart|triplewhale|avis-options|kaching-bundles|Boost|Videowise|Richpanel|productreviews|trustpilot|goaffpro|gorgias|trackifyx|weglot|loox|facebook|instagram|google|snapchat|judge\.me)/i;

function extractPluginName(url) {
  const match = url.match(pluginRegex);
  return match ? match[1] : null;
}

export const extractShopifyPluginsWithPupeteer = async () => {
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

  console.log("🔍 Visiting digifeel.io...");
  await page.goto("https://www.digifeel.io", { waitUntil: "networkidle2" });
  let detectedPlugins = [];

  const extractedScripts = await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll("script[src], link[href], script[data-src]")
    );
    return elements
      .map(
        (el) =>
          el.getAttribute("src") ||
          el.getAttribute("href") ||
          el.getAttribute("data-src")
      )
      .filter(Boolean);
  });

  extractedScripts.forEach((scriptUrl) => {
    const pluginName = extractPluginName(scriptUrl);
    if (
      pluginName &&
      !detectedPlugins.some((p) => p.searchKey === pluginName)
    ) {
      detectedPlugins.push({ searchKey: pluginName, element: scriptUrl });
    }
  });

  console.log("✅ Extracted Plugins from HTML:", detectedPlugins);

  await page.setRequestInterception(true);

  page.on("request", (request) => {
    const requestUrl = request.url();
    const pluginName = extractPluginName(requestUrl);
    if (
      pluginName &&
      !detectedPlugins.some((p) => p.searchKey === pluginName)
    ) {
      detectedPlugins.push({ searchKey: pluginName, element: requestUrl });
    }
    request.continue();
  });

  await page.reload({ waitUntil: "networkidle2" });

  console.log("✅ Final Extracted Plugins:", detectedPlugins);

  await browser.close();
  return detectedPlugins;
};
