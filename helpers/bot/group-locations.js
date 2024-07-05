// Helper function to group locations by region
export function groupLocationsByRegion(locations) {
  return locations.reduce((acc, location) => {
    if (!acc[location.region]) {
      acc[location.region] = [];
    }
    acc[location.region].push(location);
    return acc;
  }, {});
}
