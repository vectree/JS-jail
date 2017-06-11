const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const walk = require( 'esprima-walk' ).walkAddParent;
const escodegen = require('escodegen');

/**
 * This method is for struggle with some possible infinite loops.
 *
 * @private
 * @param {Object} ast The AST of source code.
 */
function wrapAllLoops(ast) {

    const loopStatements = ['ForInStatement', 'WhileStatement', 'DoWhileStatement'];
    const beforeLoopBody = fs.readFileSync(path.join(__dirname, '/injection/loop/body/before'), 'utf8');
    const innerLoopBody = fs.readFileSync(path.join(__dirname, '/injection/loop/body/inner'), 'utf8');

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

const sourceCode = fs.readFileSync(path.join(__dirname, '/injection/example'), 'utf8');
const ast = esprima.parse(sourceCode);

makeStubDeclarations(ast, ['b','c','d']);
wrapAllLoops(ast);

const outputCode = escodegen.generate(ast);

console.log(outputCode);