"use strict";

/* eslint-env mocha */

const expect = require("chai").expect;

const serial = require(".");

describe("test serial async creator function", function () {
    it("should called with normal function", function (done) {
        const testFunc = function () {
            done();
        };
        const t = serial();
        t(testFunc);
    });

    it("should return a promie object", function () {
        const testFunc = function () {
        };
        const t = serial();
        expect(t(testFunc)).to.be.instanceof(Promise);
    });

    it("reject when testFunc is not a Function", function (done) {
        const t = serial();
        t().then(function () {
            done(new Error());
        }, function (reason) {
            expect(reason).to.be.instanceof(Error);
            done();
        });
    });

    it("reject when testFunc throw a Error", function (done) {
        const err = new Error;
        const testFunc = function () {
            throw err;
        };
        const t = serial();
        t(testFunc).then(function () {
            done(new Error());
        }, function (reason) {
            try {
                expect(reason).to.be.equal(err);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it("return a promise with a value", function (done) {
        const val = "foo";
        const testFunc = function () {
            return val;
        };
        const t = serial();
        t(testFunc).then(function (ret) {
            try {
                expect(ret).to.be.equal(val);
                done();
            } catch (ex) {
                done(ex);
            }
        }, function (err) {
            done(err);
        });
    });

    it("return a resolved promise value", function (done) {
        const val = "foo";
        const testFunc = function () {
            return Promise.resolve(val);
        };
        const t = serial();
        t(testFunc).then(function (ret) {
            try {
                expect(ret).to.be.equal(val);
                done();
            } catch (ex) {
                done(ex);
            }
        }, function (err) {
            done(err);
        });
    });

    it("return a rejected promise reason", function (done) {
        const err = new Error;
        const testFunc = function () {
            return Promise.reject(err);
        };
        const t = serial();
        t(testFunc).then(function (ret) {
            done(new Error);
        }, function (reason) {
            try {
                expect(reason).to.be.equal(err);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it("should bind this to testFunc function", function (done) {
        const thisArg = {};
        const testFunc = function () {
            try {
                expect(this).to.be.equal(thisArg);
                done();
            } catch (ex) {
                done(ex);
            }
        };
        const t = serial();
        t(testFunc, thisArg);
    });

    it("should pass arguments to testFunc function", function (done) {
        const arg1 = "foo";
        const testFunc = function (a1) {
            return Promise.resolve(a1);
        };
        const t = serial();
        t(testFunc, null, arg1).then(function (value) {
            try {
                expect(value).to.be.equal(arg1);
                done();
            } catch (ex) {
                done(ex);
            }
        }, function (reason) {
            done(reason);
        });
    });

    it("appear correct order to call", function (done) {
        let a = 0;
        const testFunc1 = function () {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        expect(a).to.be.equal(0);
                    } catch (ex) {
                        done(ex);
                        reject(ex);
                        return;
                    }
                    a = 1;
                    resolve();
                }, 200);
            });
        };
        const testFunc2 = function () {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        expect(a).to.be.equal(1);
                    } catch (ex) {
                        done(ex);
                        reject(ex);
                        return;
                    }
                    a = 2;
                    resolve();
                }, 100);
            });
        };
        const testFunc3 = function () {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        expect(a).to.be.equal(2);
                    } catch (ex) {
                        done(ex);
                        reject(ex);
                        return;
                    }
                    resolve();
                }, 50);
            });
        };
        const t = serial();
        setImmediate(function () {
            t(testFunc3).then(done);
        });
        t(testFunc1);
        t(testFunc2);
    });

    it("return serial value with Promise.all", function (done) {
        const t = serial();
        let idx = 0;
        const delayToCall = function (delay) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve(++idx);
                }, delay);
            });
        };
        Promise.all([
            t(function () {
                return delayToCall(10);
            }),
            t(function () {
                return delayToCall(30);
            }),
            t(function () {
                return delayToCall(20);
            }),
        ]).then(function (ret) {
            try {
                expect(ret).to.be.eql([1, 2, 3]);
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
