# Qler
Excruciatingly simple synchronous queuing for node, with concurrency support.

## Installation

    npm install qler

## Usage

Pass your function as a callback to `queue`, and just run `callback()` when it's finished. The code blocks will run synchronously.

    var Qler = require('qler');

    var myQueue = Qler();

    myQueue.queue(function(callback) {
        console.log('Waiting 2s');
        setTimeout(function () {
            console.log('The Rabbit is in the hole!');
            callback()
        }, 2000);
    });

    myQueue.queue(function(callback) {
        console.log('Waiting another 2s');
        setTimeout(function () {
            console.log('The Badger is in the hole!');
            callback()
        }, 2000);
    });

Qler also supports concurrency. Just specify the number of concurrent queues when initialising. The default is 1, and you can go as high as you want.

    // Allow up to 5 concurrent operations
    var myQueue = Qler(5);

If you need to pass a variable, wrap in another closure.

    var x;

    x = 'Rabbit';

    myQueue.queue(function(x) {
        return function(callback) {
            console.log('Waiting 2s');
            setTimeout(function () {
                console.log('The %s is in the hole!', x);
                callback()
            }, 2000);
        };
    }(x));

    x = 'Badger';

    myQueue.queue(function(x) {
        return function(callback) {
            console.log('Waiting 2s');
            setTimeout(function () {
                console.log('The %s is in the hole!', x);
                callback()
            }, 2000);
        };
    }(x));

When using concurrency, you can make only certain functions concurrent. To do this, you must specify the second `key` parameter. A function with the `key` parameter will only execute after the last function with the same `key` parameter has finished, regardless of the `concurrency` setting. For example:

    // Allow up to 5 concurrent operations
    var myQueue = Qler(5);

    myQueue.queue(function(callback) {
        console.log('Waiting 2s');
        setTimeout(function () {
            console.log('The Rabbit is in the hole!');
            callback()
        }, 2000);
    }, 'animal');  // Specify key here

    // Won't execute until first `animal` method is finished
    myQueue.queue(function(callback) {
        console.log('Waiting another 2s');
        setTimeout(function () {
            console.log('The Badger is in the hole!');
            callback()
        }, 2000);
    }, 'animal');  // Specify key here

    // Will execute as normal
    myQueue.queue(function(callback) {
        console.log('Waiting another 2s');
        setTimeout(function () {
            console.log('The TV is in the hole!');
            callback()
        }, 2000);
    }); // No key by default. This will use concurrency
