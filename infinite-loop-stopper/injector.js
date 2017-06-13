"use strict";

/**
 * THE COMMENTS WILL BE HERE AS SOON AS POSSIBLE :)
 *
 * @since 13.06.17
 * @author iretd
 */

const esprima = require('esprima');

module.exports = InfiniteLoopStopperInjector();

function InfiniteLoopStopperInjector() {

    let t = {};

    t.inject = inject;

    return t;

    /**
     * This method is for struggle with some possible infinite loops.
     *
     * @public
     * @param {String} code The source code.
     */
    function inject(code) {

        const LOOP_CHECK = 'if (infiniteLoopStopper.shouldStopExecution(%d)) break; ';
        const LOOP_EXIT = '\ninfiniteLoopStopper.exitedLoop(%d);\n';

        var loopId = 1;
        var patches = [];

        const loopStatements = ["ForOfStatement",
                                "ForStatement",
                                "ForInStatement",
                                "WhileStatement",
                                "DoWhileStatement"];

        esprima.parse(code, { range: true }, function (node) {

            var isItLoopStatement = loopStatements.indexOf(node.type) != -1;

            if (isItLoopStatement) {

                var start = 1 + node.body.range[0];
                var end = node.body.range[1];
                var prolog = LOOP_CHECK.replace('%d', loopId);
                var epilog = '';

                if (node.body.type !== 'BlockStatement') {

                    // `while(1) doThat()` becomes `while(1) {doThat()}`
                    prolog = '{' + prolog;
                    epilog = '}';
                    --start;

                }

                patches.push({ pos: start, str: prolog });
                patches.push({ pos: end, str: epilog });
                patches.push({ pos: node.range[1] + 1, str: LOOP_EXIT.replace('%d', loopId) });
                ++loopId;

            }

        });

        patches.sort(function (a, b) { return b.pos - a.pos }).forEach(function (patch) {

            code = code.slice(0, patch.pos) + patch.str + code.slice(patch.pos);

        });

        return code;

    }

}