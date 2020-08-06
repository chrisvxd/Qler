var uuidv1 = require("uuid/v1");

var Queue = function (concurrency) {
  var concurrency = concurrency || 1;

  var lockedKeys = [];
  var queueOfQueues = [];
  var processing = [];

  var uuid = uuidv1();

  var getNextQueueItem = function (index) {
    var index = index || 0;
    var chunk = queueOfQueues[index];

    if (chunk === undefined) {
      return undefined;
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
      if (queueItem.key !== "") {
        lockedKeys.push(queueItem.key);
      }

      return queueItem;
    } else {
      return getNextQueueItem(index + 1);
    }
  };

  var processNext = function () {
    if (processing.length < concurrency && queueOfQueues.length) {
      var queueItem = getNextQueueItem();

      if (queueItem !== undefined) {
        var isCancelled = queueItem.uuid !== uuid;
        var nextFn = queueItem.fn;
        var nextKey = queueItem.key;

        isProcessing = true;

        var nextFnCallback = function () {
          if (lockedKeys.indexOf(nextKey) >= 0) {
            lockedKeys.splice(lockedKeys.indexOf(nextKey));
          }

          processNext();
        };

        if (isCancelled) {
          nextFn(null, nextFnCallback);
        } else {
          nextFn(nextFnCallback);
        }

        return;
      }
    }
  };

  var queue = function (fn, key) {
    var key = key || "";

    var queueItem = {
      fn: fn,
      key: key,
      uuid: uuid,
    };

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

  var queuePromise = function (fn, key) {
    return new Promise(function (resolve, reject) {
      queue((finishedQueue, cancelledQueue) => {
        if (cancelledQueue) {
          cancelledQueue();
          return reject();
        }

        const promise = fn().then(function () {
          processing.splice(processing.indexOf(promise), 1);

          finishedQueue();
          resolve.apply(this, arguments); // Pass over all arguments
        });

        processing.push(promise);
      }, key);
    });
  };

  var cancel = function () {
    uuid = uuidv1();
  };

  var wait = function () {
    let promises = [];

    // Flush currently processing items by adding a promise onto the end of each one
    for (let i = 0; i < processing.length; i++) {
      var promise = processing[i];

      promises.push(
        queuePromise(
          () =>
            new Promise((resolve) => {
              promise.then(resolve);
            })
        )
      );
    }

    // Flush the queue by maxing adding as many items as concurrency allows
    for (let i = 0; i < concurrency; i++) {
      promises.push(queuePromise(() => new Promise((resolve) => resolve())));
    }

    return Promise.all(promises);
  };

  return { queue: queuePromise, cancel, wait };
};

module.exports = Queue;
