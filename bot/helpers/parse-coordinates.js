// Helper function to parse coordinates from a string
export function parseCoordinates(string) {
  const match = string.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2]),
    };
  }
  return null;
}
