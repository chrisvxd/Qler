var Queue = function (concurrency) {
    var numProcessing = 0;
    var concurrency = concurrency || 1;

    var lockedKeys = [];
    var queueOfQueues = [];

    var getNextQueueItem = function (index) {
        var index = index || 0;
        var chunk = queueOfQueues[index];

        if (chunk === undefined) {
            return undefined
        } else if (chunk.length === 0) {
            // Remove chunk from queueOfQueues as empty and start again
            queueOfQueues.splice(index, 1);
            return getNextQueueItem();
        }

        var queueItem = chunk[0];

        if (lockedKeys.indexOf(queueItem.key) === -1) {
            // Remove queueItem from chunk return it
            chunk.splice(chunk.indexOf(queueItem), 1);

            // Ensure we lock this key, unless default key
            if (queueItem.key !== '') {
                lockedKeys.push(queueItem.key)
            }

            return queueItem;
        }  else {
            return getNextQueueItem(index + 1);
        }
    }

    var processNext = function () {
        if (numProcessing < concurrency && queueOfQueues.length) {
            var queueItem = getNextQueueItem();

            if (queueItem !== undefined) {

                var nextFn = queueItem.fn;
                var nextKey = queueItem.key;

                numProcessing++;

                isProcessing = true;

                nextFn(function () {
                    numProcessing--;

                    if (lockedKeys.indexOf(nextKey) >= 0) {
                        lockedKeys.splice(lockedKeys.indexOf(nextKey));
                    };

                    processNext();
                });

                return;
            }
        };
    };

    var queue = function (fn, key) {
        var key = key || '';

        var queueItem = {
            fn: fn,
            key: key
        }

        var previousQueueChunk = queueOfQueues[queueOfQueues.length - 1];

        if (previousQueueChunk !== undefined) {
            var previousQueueItem = previousQueueChunk[0];
            if (previousQueueItem !== undefined) {
                if (previousQueueItem.key === queueItem.key) {
                    queueOfQueues[queueOfQueues.length - 1].push(queueItem);
                } else {
                    queueOfQueues.push([queueItem]);
                }
            } else {
                queueOfQueues.push([queueItem]);
            }
        } else {
            queueOfQueues.push([queueItem]);
        }

        processNext();
    };

    return {
        queue: queue
    }
}

module.exports = Queue;
