"use strict";

var lodash = require('lodash');

module.exports = Environment();

/**
 * THE COMMENTS WILL BE HERE AS SOON AS POSSIBLE :)
 *
 * @since 13.06.17
 * @author iretd
 */
function Environment() {

    var environment = {};

    var names = [];
    var values = [];

    var t = {};

    t.getNames = getNames;
    t.getValues = getValues;
    t.add = add;
    t.clear = clear;

    return t;

    function getNames() {

        return names;

    }

    function getValues() {

        return values;

    }

    function add(value) {

        // Separates environment into two arrays: names and values to the following initialization of Function object.
        if (value) {

            lodash.assign(environment, value);

            names = lodash.keys(environment);
			// TODO ES-2017 - > values = Object.values(environment);
			values = lodash.keys(environment).map(function(k) { return environment[k]});

        }

    }

    function clear() {

        environment = {};

        names = [];
        values = [];

    }

}
