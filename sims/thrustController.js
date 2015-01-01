var exports = exports || {};

exports.Controller = function () {

    this.errorLength = 10;
    this.errors = [];

    this.Kp = 0.4;
    this.Ki = 0.02;
    this.Kd = 0.1;

    this.deltaMultiplier = 1;

    this.maxOutput = 250; // [PWM]
    this.minOutput = 48; // [PWM]
    this.maxDelta = 20; // [PWM]

    this.currentOutput = 0; // [PWM]

    this.previousInput = 0;

    this.cap = function (value) {
        //cap max
        if (value > this.maxOutput) {
            value = this.maxOutput;
        }
        //cap min
        if (value < this.minOutput) {
            value = this.minOutput;
        }

        return value;
    };

    this.capDelta = function (value) {

        if (Math.abs(value) > this.maxDelta) {
            if (value > 0) {
                value = this.maxDelta;
            } else {
                value = -1 * this.maxDelta;
            }
        }
        return value;
    };

    this.computeP = function (target, current) {
        return this.Kp * (target - current);
    };

    this.computeI = function () {
        var sum=0;
        for (var i = this.errors.length; i--;) {
            sum += this.errors[i];
        }
        return this.Ki * sum;
    };

    /**
     * Compute Derivative component of controller
     * @param {number} target
     * @param {number} current
     * @returns {number}
     */
    this.computeD = function (target, current) {
        var retVal,
            delta = current - this.previousInput;

        retVal = target - (current + (delta * this.deltaMultiplier));

        retVal = this.Kd * retVal;

        this.previousInput = current;

        return retVal;
    };

    /**
     * @param {number} error
     */
    this.pushI = function (error) {
        this.errors.push(error);
        if (this.errors.length > this.errorLength) {
            this.errors.shift();
        }
    };

    /**
     *
     * @param {float} target
     * @param {float} current
     * @returns {int}
     */
    this.run = function (target, current) {
        var delta = 0;

        delta += this.computeP(target, current);
        delta += this.computeI();
        delta += this.computeD(target, current);

        this.pushI(target - current);

        delta = Math.round(delta);
        delta = this.capDelta(delta);
        this.currentOutput = this.cap(this.currentOutput + delta);

        return this.currentOutput;
    }
};