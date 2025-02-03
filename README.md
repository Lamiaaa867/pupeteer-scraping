# Shopify App Scraper

This is a Node.js script that extracts app details from Shopify stores and the Shopify App Store. It fetches app-related elements, such as the app's name, icon, link, and more, then saves the extracted data into a CSV file.

## Table of Contents
- [Installation](#installation)
- [Running the Script](#running-the-script)
- [Expected Output](#expected-output)
- [Technologies Used](#technologies-used)

## Installation

Follow these steps to install the dependencies and set up the project:

1. **Clone the repository or create a new directory:**

   If you're starting from scratch, create a new folder for your project:
   ```bash
   mkdir shopify-app-scraper
   cd shopify-app-scraper

## Running the script
2. **to run the script:**
     If you're running the script:
   ```bash
   npm i
   node index.js

## expected-output
3. **expected output:**
🔍 Searching for: loox
✅ Found best match: Loox - Photo Reviews & Referrals on https://apps.shopify.com/search?q=loox
📦 Stored 1 matching plugin(s) for "loox"

🔍 Searching for: klaviyo
✅ Found best match: Klaviyo - Email Marketing & SMS on https://apps.shopify.com/search?q=klaviyo
📦 Stored 1 matching plugin(s) for "klaviyo"

🔍 Searching for: pagefly
✅ Found best match: PageFly - Advanced Page Builder on https://apps.shopify.com/search?q=pagefly
📦 Stored 1 matching plugin(s) for "pagefly"

✅ Total Plugins Extracted: 3
✅ Data saved to shopify_apps_plugins.csv
✅ Finished all searches.
 **output example**

[
  {
    "id": "a1b2c3d4",
    "pluginIndex": 1,
    "uniqueElement": "https://apps.shopify.com/loox",
    "name": "Loox - Photo Reviews & Referrals",
    "link": "https://apps.shopify.com/loox",
    "icon": "https://cdn.shopify.com/s/files/1/0001/1234/5678/t/1/assets/loox-icon.png",
    "createdAt": "2025-02-03T12:00:00.000Z",
    "updatedAt": "2025-02-03T12:00:00.000Z"
  }
]
