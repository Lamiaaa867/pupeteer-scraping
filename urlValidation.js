// Function to ensure a valid URL
export default function ensureValidUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};
