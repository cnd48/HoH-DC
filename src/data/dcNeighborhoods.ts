export interface NeighborhoodData {
  neighborhood: string;
  listings: number;
  medianNightlyPrice: number;
  medianNightsBookedActive: number;
  medianRevenueActive: number;
  pctWithLicense: number;
  medianPrice1BR: number | null;
  medianPrice2BR: number | null;
  medianPrice3BR: number | null;
  medianPrice4BRPlus: number | null;
}

/**
 * Robust price cleaner that converts string formats like "$150.00", "$ 150", "150", 150, etc. to a numeric float or null
 */
export function cleanPrice(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Raw data from DC Airbnb dataset (stored inside the app so it works without external files)
 */
const RAW_DC_AIRBNB_DATA: Array<[
  string, // neighborhood
  any, // listings
  any, // median_nightly_price
  any, // median_nights_booked_active
  any, // median_revenue_active
  any, // pct_with_license
  any, // 1BR
  any, // 2BR
  any, // 3BR
  any // 4BR+
]> = [
  ["Union Station, Stanton Park, Kingman Park", 116, 332.0, 120.0, 39455.0, 77.0, 188.0, 329.0, 400.0, 509.0],
  ["Columbia Heights, Mt. Pleasant, Pleasant Plains, Park View", 87, 315.0, 66.0, 22364.0, 79.0, 181.0, 236.0, 363.0, 497.0],
  ["Edgewood, Bloomingdale, Truxton Circle, Eckington", 83, 402.0, 90.0, 27027.0, 76.0, 161.0, 247.0, 445.0, 596.0],
  ["Capitol Hill, Lincoln Park", 78, 327.0, 105.0, 35201.0, 65.0, 170.0, 306.0, 488.0, 543.0],
  ["Ivy City, Arboretum, Trinidad, Carver Langston", 65, 299.0, 60.0, 18900.0, 74.0, 170.0, 240.0, 326.0, 386.0],
  ["Brightwood Park, Crestwood, Petworth", 54, 216.0, 84.0, 17910.0, 81.0, 170.0, 218.0, 251.0, 326.0],
  ["Shaw, Logan Circle", 36, 526.0, 132.0, 58734.0, 78.0, 217.0, 216.0, 570.0, 738.0],
  ["Congress Heights, Bellevue, Washington Highlands", 35, 227.0, 30.0, 10170.0, 71.0, 168.0, 204.0, 232.0, 320.0],
  ["Georgetown, Burleith/Hillandale", 32, 541.0, 72.0, 29738.0, 59.0, 337.0, 335.0, 622.0, 533.0],
  ["Takoma, Brightwood, Manor Park", 31, 274.0, 42.0, 9864.0, 71.0, 130.0, 283.0, 285.0, 548.0],
  ["Lamont Riggs, Queens Chapel, Fort Totten, Pleasant Hill", 29, 178.0, 102.0, 19404.0, 72.0, 126.0, 176.0, 243.0, 297.0],
  ["Twining, Fairlawn, Randle Highlands, Penn Branch, Fort Davis Park, Fort Dupont", 29, 233.0, 99.0, 29431.0, 69.0, 176.0, 215.0, 308.0, 424.0],
  ["Capitol View, Marshall Heights, Benning Heights", 26, 236.0, 108.0, 25608.0, 92.0, 130.0, 178.0, 287.0, 327.0],
  ["Brookland, Brentwood, Langdon", 25, 328.0, 112.0, 33516.0, 84.0, 136.0, 158.0, 352.0, 510.0],
  ["Howard University, Le Droit Park, Cardozo/Shaw", 24, 408.0, 124.0, 36432.0, 83.0, 182.0, 251.0, 474.0, 561.0],
  ["Dupont Circle, Connecticut Avenue/K Street", 22, 286.0, 180.0, 50940.0, 59.0, 238.0, 308.0, 227.0, 852.0],
  ["Deanwood, Burrville, Grant Park, Lincoln Heights, Fairmont Heights", 21, 184.0, 125.0, 29630.0, 57.0, 174.0, 168.0, 245.0, 177.0],
  ["North Michigan Park, Michigan Park, University Heights", 16, 306.0, 54.0, 13185.0, 62.0, 148.0, 311.0, 306.0, 455.0],
  ["Woodridge, Fort Lincoln, Gateway", 13, 284.0, 66.0, 25575.0, 100.0, 89.0, 278.0, 453.0, 306.0],
  ["Mayfair, Hillbrook, Mahaning Heights", 12, 224.0, 62.0, 11285.0, 67.0, 274.0, 215.0, 210.0, 224.0],
  ["Sheridan, Barry Farm, Buena Vista", 11, 295.0, 72.0, 10777.0, 82.0, 126.0, 334.0, 331.0, 356.0],
  ["Cleveland Park, Woodley Park, Massachusetts Avenue Heights, Woodland-Normanstone Terrace", 11, 410.0, 255.0, 40163.0, 64.0, 165.0, 449.0, 436.0, 446.0],
  ["Douglas, Shipley Terrace", 11, 332.0, 78.0, 29484.0, 91.0, 132.0, 252.0, 332.0, 574.0],
  ["River Terrace, Benning, Greenway, Dupont Park", 9, 213.0, 111.0, 25324.0, 78.0, 213.0, 196.0, 403.0, 289.0],
  ["Cathedral Heights, McLean Gardens, Glover Park", 9, 1092.0, 48.0, 32152.0, 100.0, 138.0, null, 338.0, 1246.0],
  ["Colonial Village, Shepherd Park, North Portal Estates", 8, 332.0, 102.0, 29568.0, 100.0, 110.0, 165.0, 366.0, 452.0],
  ["Southwest Employment Area, Southwest/Waterfront, Fort McNair, Buzzard Point", 8, 310.0, 132.0, 44196.0, 75.0, 298.0, 322.0, 432.0, null],
  ["Downtown, Chinatown, Penn Quarters, Mount Vernon Square, North Capitol Street", 8, 762.0, 150.0, 108626.0, 88.0, 329.0, 222.0, 898.0, 694.0],
  ["Historic Anacostia", 6, 344.0, 96.0, 54432.0, 83.0, null, null, 272.0, 567.0],
  ["Fairfax Village, Naylor Gardens, Hillcrest, Summit Park", 6, 295.0, 72.0, 31558.0, 83.0, 195.0, null, 305.0, 543.0],
  ["Friendship Heights, American University Park, Tenleytown", 6, 326.0, 60.0, 20390.0, 50.0, null, null, 340.0, 207.0],
  ["Spring Valley, Palisades, Wesley Heights, Foxhall Crescent, Foxhall Village, Georgetown Reservoir", 5, 615.0, 60.0, 16311.0, 100.0, 247.0, null, 820.0, 615.0],
  ["Kalorama Heights, Adams Morgan, Lanier Heights", 5, 378.0, 108.0, 48720.0, 80.0, 203.0, null, 437.0, 785.0],
  ["Eastland Gardens, Kenilworth", 5, 262.0, 132.0, 35552.0, 80.0, 114.0, null, 278.0, 375.0],
  ["North Cleveland Park, Forest Hills, Van Ness", 5, 407.0, 62.0, 26677.0, 100.0, 148.0, null, 451.0, 418.0],
  ["Near Southeast, Navy Yard", 4, 48.0, 45.0, 1790.0, 25.0, 41.0, 46.0, 672.0, null],
  ["Hawthorne, Barnaby Woods, Chevy Chase", 3, 360.0, 96.0, 41280.0, 33.0, null, null, null, 360.0],
  ["West End, Foggy Bottom, GWU", 3, 449.0, 130.0, 81730.0, 67.0, null, 449.0, null, null],
  ["Woodland/Fort Stanton, Garfield Heights, Knox Hill", 1, 272.0, 90.0, 24435.0, 100.0, null, null, null, 272.0]
];

export const DC_NEIGHBORHOODS: NeighborhoodData[] = RAW_DC_AIRBNB_DATA.map((row) => ({
  neighborhood: row[0],
  listings: typeof row[1] === 'number' ? row[1] : parseInt(String(row[1]), 10) || 0,
  medianNightlyPrice: cleanPrice(row[2]) || 250,
  medianNightsBookedActive: cleanPrice(row[3]) || 90,
  medianRevenueActive: cleanPrice(row[4]) || 25000,
  pctWithLicense: cleanPrice(row[5]) || 75,
  medianPrice1BR: cleanPrice(row[6]),
  medianPrice2BR: cleanPrice(row[7]),
  medianPrice3BR: cleanPrice(row[8]),
  medianPrice4BRPlus: cleanPrice(row[9])
}));

/**
 * Top 10 neighborhoods by listing volume (for reliable statistical comparison)
 */
export const TOP_10_NEIGHBORHOODS_BY_LISTINGS: NeighborhoodData[] = [...DC_NEIGHBORHOODS]
  .sort((a, b) => b.listings - a.listings)
  .slice(0, 10);

/**
 * Top 10 neighborhoods by median nightly price
 */
export const TOP_10_NEIGHBORHOODS_BY_PRICE: NeighborhoodData[] = [...DC_NEIGHBORHOODS]
  .sort((a, b) => b.medianNightlyPrice - a.medianNightlyPrice)
  .slice(0, 10);

/**
 * Helper to get median price based on space type
 */
export function getMedianPriceForSpace(
  data: NeighborhoodData,
  spaceType: '1BR' | '2BR' | '3BR' | '4BR+' | 'overall'
): number {
  if (spaceType === '1BR') {
    return data.medianPrice1BR ?? data.medianNightlyPrice;
  }
  if (spaceType === '2BR') {
    return data.medianPrice2BR ?? data.medianNightlyPrice;
  }
  if (spaceType === '3BR') {
    return data.medianPrice3BR ?? data.medianNightlyPrice;
  }
  if (spaceType === '4BR+') {
    return data.medianPrice4BRPlus ?? data.medianNightlyPrice;
  }
  return data.medianNightlyPrice;
}

export function getMedianPriceForRentalSpace(
  data: NeighborhoodData | undefined,
  spaceType: 'private_room' | 'basement_unit' | 'whole_home'
): number {
  if (!data) return 200;
  if (spaceType === 'private_room') {
    return data.medianPrice1BR ?? data.medianNightlyPrice ?? 200;
  }
  if (spaceType === 'basement_unit') {
    return data.medianPrice2BR ?? data.medianNightlyPrice ?? 280;
  }
  if (spaceType === 'whole_home') {
    return data.medianPrice3BR ?? data.medianPrice4BRPlus ?? data.medianNightlyPrice ?? 350;
  }
  return data.medianNightlyPrice ?? 200;
}
