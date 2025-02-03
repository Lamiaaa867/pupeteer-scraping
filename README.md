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
## technologies used

This project utilizes the following technologies and tools:

### **Programming Languages & Runtime**
- **JavaScript (ES6+)** – Core language for scripting  
- **Node.js** – JavaScript runtime for executing Puppeteer  

### **Libraries & Packages**
- **[Puppeteer](https://pptr.dev/)** – Headless Chrome automation for web scraping  
- **[json2csv](https://www.npmjs.com/package/json2csv)** – Converts JSON data to CSV format  
- **[fs (File System)](https://nodejs.org/api/fs.html)** – Reads/Writes data files (`.json`, `.csv`)  

### **Web Technologies**
- **Shopify App Store** – Target website for extracting app data  
- **Google Search (optional)** – Used to enhance search functionality  

### **Data Processing & Extraction**
- **String Normalization & Similarity Matching** – Compares and extracts relevant app data  
- **Regex & DOM Parsing** – Extracts structured data from Shopify app store search results  

### **Output Formats**
- **JSON** – Stores structured data for further processing  
- **CSV** – Allows easy spreadsheet analysis and reporting  

---

📌 **Why These Technologies?**  
- **Puppeteer** enables automated browsing and data extraction  
- **json2csv** makes it easy to convert scraped data into a structured format  
- **Regex & DOM Parsing** allow precise data filtering from web pages  
- **CSV & JSON** provide structured output for further analysis  


