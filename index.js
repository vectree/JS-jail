'use strict';

var version = '0.0.0';

var LoopStopManager = require('./loop-stop/manager');
var LoopStopInjector = require('./loop-stop/injector');
var jailEnvironment = require('./environment');

module.exports = JSJail();

function JSJail() {

    // Pre initialization of necessary parameters in jail environment.
    jailEnvironment.add({LoopStopManager: LoopStopManager});

    var t = {};

    t.version = version;

    t.make = make;

    return t;

    /**
     * Returns an object which represents the jail (separate environment to JS execution).
     *
     * @public
     */
    function make(code) {

        var jailInitializationCode = LoopStopInjector.inject(code);

        jailInitializationCode = tryToCoverWindow(jailInitializationCode);

        // Preparation for function call.
        var parameters = jailEnvironment.getNames();
        // Add code as the last parameter of function for an apply call.
        parameters.push(jailInitializationCode);

        var f = Function.apply(null, parameters);

        return new f(jailEnvironment.getValues());

    }

    /**
     * Makes stubs of variables for avoid the changing of outside environment which has these variables too.
     *
     * TODO need to take this function into a separate module.
     *
     * @private
     * @param {String} code The source code.
     */
    function tryToCoverWindow(code) {

        if (typeof window === "object") {

            var variables = Object.getOwnPropertyNames(window);

            if (!window.hasOwnProperty('window')) {

                variables.push('window');

            }

            var stubDeclarations = '';
            variables.forEach(function(name) {

                var stub = 'var ' + name + '; \n';

                stubDeclarations = stubDeclarations + stub;

            });

            code = stubDeclarations + code;

        }

        return code;

    }

}
