const test = require("ava");
const Qler = require("./Qler");
const delay = require("delay");

const fixture = Symbol("fixture");

test(".queue() with default concurrency", async (t) => {
  const queue = Qler();
  let invocationOrder = [];

  const promise1 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("1");
    return fixture;
  });
  const promise2 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("2");
    return fixture;
  });
  const promise3 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("3");
    return fixture;
  });

  t.is(queue._masterQueue.size, 2);
  t.is(queue._masterQueue.pending, 1);
  t.is(await promise1, fixture);

  t.is(queue._masterQueue.size, 1);
  t.is(queue._masterQueue.pending, 1);

  t.is(await promise2, fixture);

  t.is(queue._masterQueue.size, 0);
  t.is(queue._masterQueue.pending, 1);

  t.is(await promise3, fixture);

  t.is(queue._masterQueue.size, 0);
  t.is(queue._masterQueue.pending, 0);

  t.deepEqual(invocationOrder, ["1", "2", "3"]);
});

test(".queue() with custom concurrency", async (t) => {
  const queue = Qler(2);
  let invocationOrder = [];

  const promise1 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("1");
    return fixture;
  });
  const promise2 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("2");
    return fixture;
  });
  const promise3 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("3");
    return fixture;
  });

  t.is(queue._masterQueue.size, 1);
  t.is(queue._masterQueue.pending, 2);
  t.is(await promise1, fixture);
  t.is(await promise2, fixture);

  t.is(queue._masterQueue.size, 0);
  t.is(queue._masterQueue.pending, 1);

  t.is(await promise3, fixture);

  t.is(queue._masterQueue.size, 0);
  t.is(queue._masterQueue.pending, 0);

  t.deepEqual(invocationOrder, ["1", "2", "3"]);
});

test(".queue() with keys", async (t) => {
  const queue = Qler();

  let invocationOrder = [];

  const promise1 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("1");
    return fixture;
  }, "a");
  const promise2 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("2");
    return fixture;
  }, "a");
  const promise3 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("3");
    return fixture;
  }, "b");
  const promise4 = queue.queue(async () => {
    await delay(100);
    invocationOrder.push("4");
    return fixture;
  }, "c");

  t.is(await promise1, fixture);
  t.is(await promise2, fixture);
  t.is(await promise3, fixture);
  t.is(await promise4, fixture);

  t.deepEqual(invocationOrder, ["1", "3", "4", "2"]);
  t.deepEqual(queue._subqueues, {});
});

test(".queue() with keys and concurrency", async (t) => {
  const queue = Qler(2);

  let invocationOrder = [];

  const promise1 = queue.queue(async () => {
    await delay(100);
    // console.log("1 complete"); // For debugging, increase delay to 1000
    invocationOrder.push("1");
    return fixture;
  }, "a");
  const promise2 = queue.queue(async () => {
    await delay(100);
    // console.log("2 complete"); // For debugging, increase delay to 1000
    invocationOrder.push("2");
    return fixture;
  }, "a");
  const promise3 = queue.queue(async () => {
    await delay(100);
    // console.log("3 complete"); // For debugging, increase delay to 1000
    invocationOrder.push("3");
    return fixture;
  }, "b");
  const promise4 = queue.queue(async () => {
    await delay(100);
    // console.log("4 complete"); // For debugging, increase delay to 1000
    invocationOrder.push("4");
    return fixture;
  }, "c");

  t.is(await promise1, fixture);
  t.is(await promise2, fixture);
  t.is(await promise3, fixture);
  t.is(await promise4, fixture);

  t.deepEqual(invocationOrder, ["1", "3", "4", "2"]);
  t.deepEqual(queue._subqueues, {});
});

test(".wait()", async (t) => {
  const queue = Qler(2);

  let invocationOrder = [];

  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("1");
    return fixture;
  });
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("2");
    return fixture;
  });
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("3");
    return fixture;
  });

  await queue.wait();

  t.deepEqual(invocationOrder, ["1", "2", "3"]);
});

test(".wait() with keys", async (t) => {
  const queue = Qler(1);

  let invocationOrder = [];

  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("1");
    return fixture;
  }, "a");
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("2");
    return fixture;
  }, "a");
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("3");
    return fixture;
  }, "b");

  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("4");
    return fixture;
  }, "c");

  await queue.wait();

  t.deepEqual(invocationOrder, ["1", "3", "4", "2"]);
});

test(".wait() with keys and concurrency", async (t) => {
  const queue = Qler(2);

  let invocationOrder = [];

  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("1");
    return fixture;
  }, "a");
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("2");
    return fixture;
  }, "a");
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("3");
    return fixture;
  }, "b");

  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("4");
    return fixture;
  }, "c");

  await queue.wait();

  t.deepEqual(invocationOrder, ["1", "3", "4", "2"]);
});

test(".cancel()", async (t) => {
  const queue = Qler();

  let invocationOrder = [];

  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("1");
    return fixture;
  });
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("2");
    return fixture;
  });
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("3");
    return fixture;
  });

  await queue.cancel();
  await queue.wait(); // Wait for pending

  t.deepEqual(invocationOrder, ["1"]);
  t.deepEqual(queue._masterQueue.size, 0);
  t.deepEqual(queue._masterQueue.pending, 0);
});

test(".cancel() with keys", async (t) => {
  const queue = Qler();

  let invocationOrder = [];

  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("1");
    return fixture;
  }, "a");
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("2");
    return fixture;
  }, "a");
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("3");
    return fixture;
  }, "b");
  queue.queue(async () => {
    await delay(100);
    invocationOrder.push("4");
    return fixture;
  }, "c");

  await queue.cancel();
  await queue.wait(); // Wait for pending

  t.deepEqual(invocationOrder, ["1"]);
  t.is(queue._masterQueue.size, 0);
  t.is(queue._masterQueue.pending, 0);
  t.deepEqual(queue._subqueues, {});
});
