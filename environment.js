"use strict";

/**
 * THE COMMENTS WILL BE HERE AS SOON AS POSSIBLE :)
 *
 * @since 13.06.17
 * @author iretd
 */

module.exports = Environment();

function Environment() {

    let environment = {};

    let names = [];
    let values = [];

    let t = {};

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

            Object.assign(environment, value);

            names = Object.keys(environment);

            var _values = [];
            names.forEach(function (key) {

                _values.push(environment[key]);

            });

            values = _values;

        }

    }

    function clear() {

        environment = {};

        names = [];
        values = [];

    }

}