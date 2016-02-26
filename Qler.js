var Queue = function (concurrency) {
    var numProcessing = 0;
    var fnQueue = [];
    var concurrency = concurrency || 1;

    var processSnapshot = function (snapshot, processCompleteCallback) {
        doAsyncStuff(snapshot, function() {
            processCompleteCallback();
        });
    };

    var processNext = function () {
        if (numProcessing < concurrency && fnQueue.length) {
            var nextCall = fnQueue.shift();
            if (nextCall !== undefined) {
                // Check again before assigning to be sure no race condition
                if (numProcessing <= concurrency) {
                    numProcessing++;

                    isProcessing = true;

                    nextCall(function () {
                        numProcessing--;
                        processNext();
                    });

                    return;
                };
            }
        };
    };

    var queue = function (fn) {
        fnQueue.push(fn);
        processNext();
    };

    return {
        queue: queue
    }
}

module.exports = Queue;
