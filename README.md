# serial-async

[![Build Status](https://img.shields.io/travis/zbinlin/node-serial-async/master.svg?style=flat-square)](https://travis-ci.org/zbinlin/node-serial-async)
[![NPM version](https://img.shields.io/npm/v/serial-async.svg?style=flat-square)](https://www.npmjs.org/package/serial-async)

> Serialization async function(promise)

## Example

```javascript
const transaction = require(".")();

const asyncStorage = {
    storage: {
        foo: "bar",
    },
    get(key) {
        return new Promise((resolve, reject) => {
            if (key === undefined) {
                resolve(this.storage);
            } else {
                resolve(this.storage[key]);
            }
        });
    },
    set(key, val) {
        return new Promise((resolve, reject) => {
            this.storage[key] = val;
            resolve();
        });
    },
};

function upper() {
    return asyncStorage.get("foo").then(val => {
        // val === "bar"
        return new Promise((resolve, reject) => {
            // looooog time
            setTimeout(() => {
                // if that is normal call, now asyncStorage.storage.foo is `biz`,
                // but val still is `bar`.
                resolve(asyncStorage.set("foo", String(val).toUpperCase()));
            }, 100);
        });
    });
}
function setBiz() {
    return asyncStorage.get("foo").then(val => {
        return asyncStorage.set("foo", "biz");
    });
}

// normal
Promise.all([
    upper(),
    setBiz(),
]).then(() => {
    console.log("normal:", asyncStorage.storage); // result: { foo: "BAR" }
});

// use transaction
Promise.all([
    transaction(upper),
    transaction(setBiz),
]).then(() => {
    console.log("transaction:", asyncStorage.storage); // result: { foo: "biz" }
});
```


## NOTE

```javascript
// You must not use the code like:
const foo = transaction(function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(foo);
        });
    });
});
transaction(function () {
    // It will never run here
    console.log("bar");
});

// The above is equal:
const foo = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(foo);
    });
});
foo.then(() => {
    // It will never run here
    console.log("bar");
});
```
