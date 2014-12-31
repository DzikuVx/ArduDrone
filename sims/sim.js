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

m.setController(c);
m.reset(0, 400);

/*
 * Set altitude error rate to 10cm
 */
m.altitudeError = 40;

/*
 * Run model for given number of iterations
 */
for(var i = 0; i < 30; i++) {
    m.run();
}

console.log("Outputs", m.outputs);
console.log("Altitudes", m.altitudes);
