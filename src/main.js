
var happyml = (function (module)
{
	var privateVariable = 1;

	function privateMethod() {
		// ...
	}

	module.version = '0.0.0';

	/**
	 * Say hello!
	 */
	module.greet = function ()
	{
		console.log("Those about to learn we salute you :)");
	};

	return module;
}(happyml || {}));