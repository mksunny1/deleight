'use strict';

var apption = require('apption');



Object.keys(apption).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return apption[k]; }
	});
});
