
Array.prototype.average = function () {
	var sum = 0;
	for( var i = 0; i < this.length; i++ ){
	    sum += this[i]
	}

	return avg = sum/this.length;
};

/*
 * This controller uses only PI model
 */
var controller = (function () {

	var self = {};

	self.errorLength = 5;
	self.errors = [];

	self.Kp = 0.5;
	self.Ki = 0.01,
	self.Kd = 1;

	self.maxOutput = 20; // [cm/s]

	self.cap = function (value) {
		if (value > self.maxOutput) {
			value = self.maxOutput;
		} else if (value < -1 * self.maxOutput) {
			value = -1 * self.maxOutput;
		}
		return value;
	};

	self.computeP = function (target, current) {
		return self.Kp * (target - current);
	};

	self.computeI = function (target, current) {

		var sum=0;
	   	for (var i=self.errors.length; i--;) {
	    	sum += self.errors[i];
	   	}

	   	return self.Ki * sum;
	};

	self.pushI = function (error) {
		self.errors.push(error);
		if (self.errors.length > self.errorLength) {
			self.errors.shift();
		}
	};

	self.run = function (target, current) {
		var retVal = 0;

		retVal += self.computeP(target, current);
		retVal += self.computeI(target, current);

		self.pushI(target - current);

		return Math.round(self.cap(retVal) * 100) / 100;
	};

	return self;
})();

var model = (function () {

	var self = {};

	self.targetAltitude = 0;
	self.currentAltitude = 0;
	self.currentSpeed = 0;
	self.altitudes = [];
	self.speeds = [];
	self.previousAltitude = 0;
	self.previousSpeed = 0;

	self.controller = null;

	self.delayFactor = 0.8;

	self.altitudeError = 40;

	self.inertiaLength = 2;
	self.speedInertias = [];

	self.setController = function (controller) {
		self.controller = controller;
	};

	self.reset = function (current, target) {
		self.targetAltitude = target;
		self.currentAltitude = current;
		self.currentSpeed = 0;
		self.altitudes = [];
		self.speeds = [];
		self.previousAltitude = 0;
		self.previousSpeed = 0;

		self.speedInerta = [];
		for(var i = 0; i < self.inertiaLength; i++) {
			self.speedInertias.push(0);
		}

	};

	self.addNoiseToAltitude = function (value) {
		return value + (Math.random() * self.altitudeError) - (self.altitudeError / 2);
	};

	self.pushInertia = function (value) {
		self.speedInertias.shift();
		self.speedInertias.push(value);
	};

	self.run = function () {

		var controllerOutput = self.controller.run(self.targetAltitude, self.addNoiseToAltitude(self.currentAltitude));

		//Store previous values
		self.previousAltitude = self.currentAltitude;
		self.previousSpeed = self.currentSpeed;

		//Compute new values
		self.currentSpeed = controllerOutput;

		//add inertia to limit speed in which altitude can change
		self.currentAltitude = self.currentAltitude + self.currentSpeed - ((self.currentSpeed - self.speedInertias.average()) * self.delayFactor);

		self.pushInertia(controllerOutput);
		self.altitudes.push(Math.round(self.currentAltitude * 10) / 10);
		self.speeds.push(Math.round(self.currentSpeed * 10) / 10);

	};

	return self;
})();

model.setController(controller);
model.reset(0, 400);

/*
 * Run model for given number of iterations
 */
for(var i = 0; i < 50; i++) {

	if (i === 25) {
		model.targetAltitude = 350;
	}

	model.run();
}

console.log("Altitudes", model.altitudes);
// console.log("Speeds", model.speeds);
