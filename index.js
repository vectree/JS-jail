'use strict';

const version = '0.0.0';

const LoopStopManager = require('./loop-stop/manager');
const LoopStopInjector = require('./loop-stop/injector');
const jailEnvironment = require('./environment');

module.exports = JSJail();

function JSJail() {

    // Pre initialization of necessary parameters in jail environment.
    jailEnvironment.add({LoopStopManager});

    let t = {};

    t.version = version;

    t.make = make;

    return t;

    /**
     * Returns an object which represents the jail (separate environment to JS execution).
     *
     * @public
     */
    function make(code) {

        let jailInitializationCode = LoopStopInjector.inject(code);

        jailInitializationCode = tryToCoverWindow(jailInitializationCode);

        // Preparation for function call.
        const parameters = jailEnvironment.getNames();
        // Add code as the last parameter of function for an apply call.
        parameters.push(jailInitializationCode);

        const f = Function.apply(null, parameters);

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

            let variables = Object.getOwnPropertyNames(window);

            if (!window.hasOwnProperty('window')) {

                variables.push('window');

            }

            let stubDeclarations = '';
            variables.forEach((name) => {

                let stub = 'var ' + name + '; \n';

                stubDeclarations = stubDeclarations + stub;

            });

            code = stubDeclarations + code;

        }

        return code;

    }

}
