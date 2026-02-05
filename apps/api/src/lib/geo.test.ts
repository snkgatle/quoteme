import { getBoundsOfDistance, calculateDistance } from './geo';

describe('Geo Lib', () => {
    describe('getBoundsOfDistance', () => {
        it('should return correct bounds for a given distance', () => {
            const lat = 40.7128;
            const lon = -74.0060;
            const distance = 50; // km

            const bounds = getBoundsOfDistance(lat, lon, distance);

            expect(bounds.minLat).toBeLessThan(lat);
            expect(bounds.maxLat).toBeGreaterThan(lat);
            expect(bounds.minLon).toBeLessThan(lon);
            expect(bounds.maxLon).toBeGreaterThan(lon);

            // Verify that the corner of the box is at least distance away (it should be more)
            const cornerDist = calculateDistance(lat, lon, bounds.maxLat, bounds.maxLon);
            expect(cornerDist).toBeGreaterThan(distance);

            // Verify that the midpoints of the sides are approximately distance away
            const topDist = calculateDistance(lat, lon, bounds.maxLat, lon);
            // Floating point math and Earth approximation make it not exact, but close
            expect(Math.abs(topDist - distance)).toBeLessThan(1);
        });
    });
});
