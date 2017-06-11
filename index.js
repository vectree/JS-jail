'use strict';

const version = '0.0.0';

const esprima = require('esprima');
const walk = require( 'esprima-walk' ).walkAddParent;
const escodegen = require('escodegen');

// Iterations count for detection the infinite loop.
const LOOP_ITERATIONS_COUNT = 300;
const INFINITE_LOOP_EXCEPTION_MESSAGE = 'Perhabs there is some infinite loop in the code';

module.exports = JSJail();

function JSJail() {
    
    let t = {};

    t.version = version;
    t.run = run;

    return t;

    /**
     * Runs your code into the JS-jail.
     *
     * @public
     * @param code
     * @param environment
     */
    function run(code, environment) {

        const ast = esprima.parse(code);

        if (window) {

            makeStubDeclarations(ast, Object.getOwnPropertyNames(window));

        }

        wrapAllLoops(ast);

        code = escodegen.generate(ast);

        let names = [];
        let values = [];

        if (environment) {

            names = Object.keys(environment);
            names.forEach(function (key) {

                values.push(environment[key]);

            });

        }

        // Add code as last parameter of function for apply call.
        names.push(code);

        const f = Function.apply(this, names);

        f.apply(this, values);

    }

    /**
     * This method is for struggle with some possible infinite loops.
     *
     * @private
     * @param {Object} ast The AST of source code.
     */
    function wrapAllLoops(ast) {

        const loopStatements = ["ForInStatement", "WhileStatement", "DoWhileStatement"];
        const beforeLoopBody = "var a = 0;";
        const innerLoopBody = "if (a === " + LOOP_ITERATIONS_COUNT +
                               ") { throw new Error('" + INFINITE_LOOP_EXCEPTION_MESSAGE + "') }; a++;";

        walk(ast, function (node) {

            var result = loopStatements.indexOf(node.type);

            if (result != -1) {

                node.parent.body.unshift(esprima.parse(beforeLoopBody));
                node.body.body.unshift(esprima.parse(innerLoopBody));

            }

        });

    }

    /**
     * Makes stubs of variables for avoid the changing of outside environment which has these variables too.
     *
     * @private
     * @param {Array} variables The name list of variables for stubs.
     * @param {Object} ast The AST of source code.
     */
    function makeStubDeclarations(ast, variables) {

        variables.forEach(function(name) {

            let stub = 'var ' + name + ';';
            ast.body.unshift(esprima.parse(stub));

        });

    }

}