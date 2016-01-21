var Queue = function () {
    var isProcessing = false;
    var fnQueue = [];

    var processSnapshot = function (snapshot, processCompleteCallback) {
        doAsyncStuff(snapshot, function() {
            processCompleteCallback();
        });
    };

    var processNext = function () {
        if (!isProcessing && fnQueue.length) {

            var nextCall = fnQueue.shift();
            if (nextCall !== undefined) {

                // Check again before assigning to be sure no race condition
                if (!isProcessing) {
                    isProcessing = true;

                    nextCall(function () {
                        isProcessing = false;
                        processNext();
                    });

                    return;
                };
            };
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
