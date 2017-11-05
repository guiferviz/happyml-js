
var module = module || {};
module.exports = module.exports || {};


module.exports = (function (happyml)
{
	happyml.version = '0.0.0';

	/**
	 * Say hello!
	 */
	happyml.greet = function ()
	{
		console.log("Those about to learn we salute you :)");
	};

	return happyml;
}({}));
