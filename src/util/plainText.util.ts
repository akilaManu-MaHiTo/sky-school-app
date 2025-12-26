export const getPlainAddress = (address?: string) => {
  if (!address) return "";
  // Remove HTML tags, asterisks, and numbers followed by a dot (e.g., '1.')
  return address
    .replace(/<[^>]*>/g, "")
    .replace(/\*/g, "")
    .replace(/\b\d+\./g, "")
    .trim();
};