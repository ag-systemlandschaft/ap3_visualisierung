// for other styling constants like colors, see index.css
// change style relatios
const systemNode = Object.freeze({
    radiusMin: 5,
    radiusScaling: 0.7,
    textXOffset: 11,
    textYOffset: 5,
})

const exchangeArc = Object.freeze({
    thickness: 1.5,
    tolerance: 12, // clickable width of an exchange in screen pixels
    straightness: 1,
});

const zoomSettings = Object.freeze({
    minScale: 0.05,
    maxScale: 5,
    fitMargin: 0.02, // free space around the graph when fitted into view, as a fraction of the view size
});

const physics = Object.freeze({
    baseDistance: 300,
    repulsion: 1000,
    velocityDecay: 0.3,
    collideRadius: 30,
    collideIterations: 100,
    collideTextScaling: 8,
});
