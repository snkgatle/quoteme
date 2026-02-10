import { calculateDistance } from '../src/lib/geo';

// Mock data generator
const generateSPs = (count: number) => {
    const sps = [];
    for (let i = 0; i < count; i++) {
        // Random coords roughly around a center point (e.g., NYC)
        sps.push({
            id: i,
            latitude: 40.7128 + (Math.random() - 0.5) * 2, // +/- 1 degree (~111km)
            longitude: -74.0060 + (Math.random() - 0.5) * 2
        });
    }
    return sps;
};

const runBenchmark = () => {
    const totalSPs = 10000;
    const centerLat = 40.7128;
    const centerLon = -74.0060;
    const dataset = generateSPs(totalSPs);

    console.log(`Benchmarking with ${totalSPs} Service Providers...`);

    // Scenario 1: In-memory filtering (Current)
    // Filter ALL items using Haversine
    const start1 = process.hrtime();
    const result1 = dataset.filter(sp => {
        const dist = calculateDistance(centerLat, centerLon, sp.latitude, sp.longitude);
        return dist <= 50;
    });
    const end1 = process.hrtime(start1);
    const time1 = (end1[0] * 1000 + end1[1] / 1e6).toFixed(2);
    console.log(`Scenario 1 (In-Memory Filter): ${time1} ms (Found ${result1.length} matches)`);

    // Scenario 2: Database filtered (Simulated)
    // Assume DB returns a subset based on Bounding Box.
    // A BBox for 50km is slightly larger than the circle.
    // Let's assume the DB returns roughly the same amount as the circle + 27% (Area of square vs circle is 4r^2 vs pi*r^2 = 4/pi ~= 1.27)
    // So we take the result set size * 1.3 to be conservative.
    const approximateDBResultSize = Math.ceil(result1.length * 1.3);
    const reducedDataset = dataset.slice(0, approximateDBResultSize);

    const start2 = process.hrtime();
    const result2 = reducedDataset.filter(sp => {
         const dist = calculateDistance(centerLat, centerLon, sp.latitude, sp.longitude);
        return dist <= 50;
    });
    const end2 = process.hrtime(start2);
    const time2 = (end2[0] * 1000 + end2[1] / 1e6).toFixed(2);
    console.log(`Scenario 2 (Post-DB Filter): ${time2} ms (Simulated DB pre-filtering to ${approximateDBResultSize} items)`);

    console.log(`CPU Time Improvement: ${((parseFloat(time1) - parseFloat(time2)) / parseFloat(time1) * 100).toFixed(1)}%`);
};

runBenchmark();
