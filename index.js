'use strict';

const version = '0.0.0';

const LoopStopManager = require('./loop-stop/manager');
const LoopStopInjector = require('./loop-stop/injector');
const environment = require('./environment');

module.exports = JSJail();

function JSJail() {

    let code;

    let t = {};

    t.version = version;

    t.init = init;
    t.run = run;

    return t;

    /**
     * Initializes your code for a further execution into the jail.
     *
     * @public
     * @param _code The code which will execute by 'run' method.
     */
    function init(_code) {

        code = LoopStopInjector.inject(_code);

        code = tryToCoverWindow(code);

        environment.add({LoopStopManager});

    }

    /**
     * Runs your code into the JS-jail.
     *
     * @public
     * @param additionalEnvironment
     */
    function run(additionalEnvironment) {

        if (!code) {

            throw new Error('At first the code to execute must initialize by init method!');

        }

        environment.add(additionalEnvironment);

        let values = environment.getValues();
        let names = environment.getNames();

        // Add code as the last parameter of function for an apply call.
        names.push(code);

        const f = Function.apply(this, names);

        f.apply(this, values);

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
