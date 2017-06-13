'use strict';

const version = '0.0.0';

const infiniteLoopStopper = require('./infinite-loop-stopper');
const infiniteLoopStopperInjector = require('./infinite-loop-stopper/injector');
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

        code = infiniteLoopStopperInjector.inject(_code);

        code = tryToCoverWindow(code);
    
        environment.add({infiniteLoopStopper});

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
     * @private
     * @param {String} code The source code.
     */
    function tryToCoverWindow(code) {

        if (window) {

            const variables = Object.getOwnPropertyNames(window);

            variables.forEach(function(name) {

                let stub = 'var ' + name + ';';
                code = stub + '\n' + code;

            });

        }

        return code;

    }

}