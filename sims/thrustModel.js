var exports = exports || {};

/**
 * Model assumes that thrust is adjusted with 10Hz frequency
 * @constructor
 */
exports.Model = function () {

    /**
     * Number of adjustment cycles per second
     * @type {number}
     */
    this.adjustmentsPerSecond = 10;

    /**
     * Max vertical speed in cm/s
     * @type {number}
     */
    this.verticalSpeed = 40;

    this.targetAltitude = 0; //[cm]
    this.currentAltitude = 0;
    this.currentSpeed = 0;
    this.altitudes = [];
    this.speeds = [];

    this.currentOutput = 0;

    this.outputs = [];

    this.controller = null;

    //Bigger value causes bigger inertia and it takes longer to archive desired speed
    this.delayFactor = 0.75;

    this.altitudeError = 50; // [cm]

    this.inertiaLength = 2;
    this.speedInertias = [];

    this.zeroThrustAt = 90; // [pwm]

    this.speedPerUnit = (this.verticalSpeed / (255 - this.zeroThrustAt)) / this.adjustmentsPerSecond;

    this.setController = function (controller) {
        this.controller = controller;
    };

    this.reset = function (current, target) {
        this.targetAltitude = target;
        this.currentAltitude = current;
        this.currentSpeed = 0;
        this.altitudes = [];
        this.speeds = [];

        this.currentOutput = 0;

        this.speedInertias = [];
        for(var i = 0; i < this.inertiaLength; i++) {
            this.speedInertias.push(0);
        }

        this.outputs = [];
    };

    /**
     * Altitude can have an error of this.altitudeError plus, resut is rounded to 10cm
     * @param {number} value
     * @returns {number}
     */
    this.addNoiseToAltitude = function (value) {
        var retVal = value + (Math.random() * this.altitudeError) - (this.altitudeError / 2);

        /*
         * Round to tens of centimeters
         */
        retVal = Math.round(retVal / 10) * 10;

        return retVal;
    };

    this.pushInertia = function (value) {
        this.speedInertias.shift();
        this.speedInertias.push(value);
    };

    this.pushOutput = function (value) {
        this.outputs.push(value);
    };

    this.run = function () {

        var controllerOutput = this.controller.run(this.targetAltitude, this.addNoiseToAltitude(this.currentAltitude));

        this.pushOutput(controllerOutput);

        var speed = (controllerOutput - this.zeroThrustAt) * this.speedPerUnit;

        if (this.currentAltitude === 0 && speed < 0) {
            speed = 0;
        }

        //Compute new values
        this.currentSpeed = speed;

        //add inertia to limit speed in which altitude can change
        this.currentAltitude = this.currentAltitude + this.currentSpeed - ((this.currentSpeed - this.speedInertias.average()) * this.delayFactor);

        this.pushInertia(this.currentSpeed);
        this.altitudes.push(Math.round(this.currentAltitude * 10) / 10);
        this.speeds.push(Math.round(this.currentSpeed * 10) / 10);

    };

};
