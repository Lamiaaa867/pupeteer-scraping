
import { createObjectCsvWriter } from "csv-writer";

// Function to save data in CSV format
export const saveToCSV = async (data) => {
    const csvWriter = createObjectCsvWriter({
      path: "shopify_apps_plugins.csv",
      header: [
        { id: "id", title: "ID" },
        { id: "pluginIndex", title: "Plugin Index" },
      
        { id: "name", title: "Plugin Name" },
        { id: "link", title: "Plugin Link" },
        { id: "icon", title: "Plugin Icon" },
        { id: "createdAt", title: "Created At" },
        { id: "updatedAt", title: "Updated At" }
      ]
    });
  
    await csvWriter.writeRecords(data);
    console.log("✅ Data saved to shopify_apps_plugins.csv");
  };