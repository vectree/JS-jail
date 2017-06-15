'use strict';

const version = '0.0.0';

const LoopStopManager = require('./loop-stop/manager');
const LoopStopInjector = require('./loop-stop/injector');
const environment = require('./environment');

module.exports = JSJail();

function JSJail() {

    let jailInitializationCode;

    let t = {};

    t.version = version;

    t.init = init;
    t.make = make;

    return t;

    /**
     * Initializes your jail code for a further execution into the jail.
     *
     * @public
     * @param code The code which will initialize your jail.
     */
    function init(code) {

        jailInitializationCode = LoopStopInjector.inject(code);

        jailInitializationCode = tryToCoverWindow(jailInitializationCode);

        environment.add({LoopStopManager});

    }

    /**
     * Returns an object which represents the jail (separate environment to JS execution).
     *
     * @public
     */
    function make() {

        if (!jailInitializationCode) {

            throw new Error('At first the jail initialization code must initialize by init method!');

        }

        const values = environment.getValues();
        const names = environment.getNames();

        // Add code as the last parameter of function for an apply call.
        names.push(jailInitializationCode);

        const f = Function.apply(null, names);

        return new f(values);

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
