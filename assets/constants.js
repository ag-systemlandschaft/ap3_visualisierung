// for other styling constants like colors, see index.css
// Anpassung erfolgt durch EZB
const systemNode = Object.freeze({
    radiusMin: 5,
    radiusScaling: 0.7,
    textXOffset: 11,
    textYOffset: 5,
})

const exchangeArc = Object.freeze({
    thickness: 1.5,
    tolerance: 1.5,
    straightness: 1,
});

const physics = Object.freeze({
    baseDistance: 300,
    repulsion: 1000,
    velocityDecay: 0.3,
    collideRadius: 30,
    collideIterations: 100,
    collideTextScaling: 8,
});
