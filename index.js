"use strict";

function noop() {}

module.exports = function createTransaction() {
    let current = Promise.resolve();
    return function serial(asyncFunc, thisArgs) {
        var args = [].slice.call(arguments, 2);
        return new Promise(function (resolve, reject) {
            current = current.then(function () {
                return asyncFunc.apply(thisArgs, args);
            })
            .then(resolve, reject)
            .then(noop, noop);
        });
    };
};
