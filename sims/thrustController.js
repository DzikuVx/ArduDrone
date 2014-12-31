exports.Controller = function () {

    this.errorLength = 5;
    this.errors = [];

    this.Kp = 5;
    this.Ki = 0.1;
    this.Kd = 1;

    this.maxOutput = 230; // [PWM]
    this.minOutput =  64; // [PWM]
    this.maxDelta = 128; // [PWM]

    this.currentOutput = 0; // [PWM]

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

    this.computeI = function (target, current) {

        var sum=0;
        for (var i = this.errors.length; i--;) {
            sum += this.errors[i];
        }
        return this.Ki * sum;
    };

    this.pushI = function (error) {
        this.errors.push(error);
        if (this.errors.length > this.errorLength) {
            this.errors.shift();
        }
    };

    this.run = function (target, current) {
        var delta = 0;

        delta += this.computeP(target, current);
        delta += this.computeI(target, current);

        this.pushI(target - current);

        delta = Math.round(delta);
        delta = this.capDelta(delta);
        this.currentOutput = this.cap(this.currentOutput + delta);

        return this.currentOutput;
    }
};