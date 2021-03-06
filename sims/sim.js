Array.prototype.average = function () {
    var sum = 0;
    for( var i = 0; i < this.length; i++ ){
        sum += this[i]
    }

    return sum / this.length;
};

var mThrustController = require("./thrustController");
var mThrustModel = require("./thrustModel");

var c = new mThrustController.Controller();
var m = new mThrustModel.Model();
var i;

m.setController(c);
m.reset(0, 400);

/*
 * Set altitude error rate to 10cm
 */
m.altitudeError = 50;

/*
 * Run model for given number of iterations
 */
for(i = 0; i < 900; i++) {
    if (i === 450) {
        m.targetAltitude = 500;
    }

    if (i === 600) {
        m.targetAltitude = 200;
    }

    m.run();
}

var Canvas = require('canvas')
    , canvas = new Canvas(1000, 300)
    , ctx = canvas.getContext('2d')
    , Chart = require('nchart')
    , fs = require('fs');

ctx.rect(0,0,1000,300);
ctx.fillStyle="white";
ctx.fill();

var labels = [],
    line = [],
    boundUp = [],
    boundDown = [],
    length = m.altitudes.length;

for (i = 0; i < length; i++) {
    labels.push(0);
    line.push(400);
    boundDown.push(400 - 25);
    boundUp.push(400 + 25);
}

Chart(ctx).Line({
    labels: labels,
    datasets: [
        {
            data: m.alitudesFromSensor,
            strokeColor: "green"
        }, 
        {
            data: line,
            strokeColor: "blue"
        },
        {
            data: boundDown,
            strokeColor: "lightgray"
        },
        {
            data: boundUp,
            strokeColor: "lightgray"
        },
        {
            data: m.altitudes,
            strokeColor: "red"
        }
    ]
}, {
    scaleShowValues: false,
    scaleFontSize: 12,
    datasetFill: false,
    bezierCurve: false,
    pointDot: false,
    scaleShowLabels: false,
    drawScale: true,
    scaleShowGridLines: false,
    showXLabels: false
});

canvas.toBuffer(function (err, buf) {
    if (err) throw err;
    fs.writeFile(__dirname + '/altitudes.png', buf);
});