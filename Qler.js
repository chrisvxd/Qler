const { default: PQueue } = require("p-queue");

var Queue = function (concurrency = 1) {
  const masterQueue = new PQueue({ concurrency });

  const subqueues = {};

  const add = async (fn, key) => {
    if (key) {
      subqueues[key] = subqueues[key] || new PQueue({ concurrency: 1 });

      const fnAndDelete = async () => {
        const result = await masterQueue.add(fn);

        // subqueue might have been deleted by now if cancelled
        if (subqueues[key] && subqueues[key].size === 0) {
          delete subqueues[key];
        }

        return result;
      };

      return subqueues[key].add(fnAndDelete);
    } else {
      return masterQueue.add(fn);
    }
  };

  const wait = async () => {
    if (Object.keys(subqueues).length > 0) {
      await Promise.all(
        Object.values(subqueues).map(async (subqueue, i) => subqueue.onIdle())
      );
    }

    await masterQueue.onIdle();
  };

  const cancel = async () => {
    if (Object.keys(subqueues).length > 0) {
      await Promise.all(
        Object.keys(subqueues).map(async (key) => {
          const subqueue = subqueues[key];

          await subqueue.clear();

          delete subqueues[key];
        })
      );
    }

    await masterQueue.clear();
  };

  return {
    queue: add,
    cancel,
    wait,
    _masterQueue: masterQueue,
    _subqueues: subqueues,
  };
};

module.exports = Queue;
