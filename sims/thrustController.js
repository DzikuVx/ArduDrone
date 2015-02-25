var exports = exports || {};

exports.Controller = function () {

    /*
     * Values used by I factor for a error queue
     */
    this.errorLength = 20;
    this.errors = [];

    this.Kp = 0.6;
    this.Ki = 0.08;
    this.Kd = 0.75;

    this.maxOutput = 144; // [PWM] Max thrust set at 80%
    this.minOutput = 45; // [PWM] Min thrust set at 25%
    this.maxDelta = 60; // [PWM]

    this.currentOutput = 0; // [PWM]

    this.previousInput = 0;

    this.inputLength = 10;
    this.inputs = [];

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
        var retVal = 0,
            delta,
            future;

        if (this.inputs.length == this.inputLength) {
            delta = current - this.inputs[0];
            future = current + delta;
            retVal = this.Kd * (target - future);
        }

        console.log(retVal);

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

    this.pushCurrentInput = function (value) {
        this.inputs.push(value);
        if (this.inputs.length > this.inputLength) {
            this.inputs.shift();
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

        this.pushCurrentInput(current);

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