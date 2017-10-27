var happyml = function(module) {
    return module.version = "0.0.0", module.greet = function() {
        console.log("Those about to learn we salute you :)");
    }, module;
}(happyml || module);