function normalizeForMatch(str) {
    return str
      .toLowerCase()
      .replace(/-/g, ' ')           // Replace hyphens with a space.
      .replace(/[^a-z0-9\s]/g, '')    // Remove any non-alphanumeric characters (except whitespace).
      .split(/\s+/)                 // Split into words by whitespace.
      .filter(token => token.length > 0) // Remove empty tokens.
      .sort()                       // Sort alphabetically.
      .join(' ');                   // Join tokens back into a string.
  }
  
  /**
   * Compare two plugin names by normalizing them first.
   *
   * @param {string} name1 - The first string to compare.
   * @param {string} name2 - The second string to compare.
   * @return {boolean} True if they match (ignoring spacing, punctuation, and word order), else false.
   */
  export function matchPluginNames(name1, name2) {
    const normalized1 = normalizeForMatch(name1);
    const normalized2 = normalizeForMatch(name2);
    return normalized1 === normalized2;
  }
  
  // Example usage:
  const pluginNameFromElement = "adroll-advertising-marketing";
  const pluginNameToMatch = "adroll marketing advertising";
  
  if (matchPluginNames(pluginNameFromElement, pluginNameToMatch)) {
    console.log("The plugin names match!");
  } else {
    console.log("The plugin names do not match.");
  }