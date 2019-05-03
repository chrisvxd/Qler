# Qler

[![NPM](https://img.shields.io/npm/v/qler.svg)](https://www.npmjs.com/package/qler) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

Excruciatingly simple synchronous queuing for node, with concurrency support.

Used in production at https://wellpaid.io.

## Installation

```sh
npm install qler
## or
yarn add qler
```

## API

- `queue(fn, key)` - queue a promise that returns a promise. Will never run two fns with the same key.
- `cancel()` - will cancel all remaining queue items and reject any remaining queue promises.
- `wait()` - wait for all previously queued promises to complete. Returns a promise.

## Usage

### Basic

Execute two functions in sequence, without blocking main thread.

```js
import Qler from "qler";

const myQueue = Qler();

myQueue
  .queue(async () => await sleep(2)) // Wait for 2 seconds
  .then(() => console.log(`Function 1 executed after 2 seconds!`));

myQueue
  .queue(async () => await sleep(2)) // Wait for 2 seconds
  .then(() => console.log(`Function 2 executed after 4 seconds!`));
```

### With concurrency

```js
import Qler from "qler";

const myQueue = Qler(2);

myQueue
  .queue(async () => await sleep(2)) // Wait for 2 seconds
  .then(() => console.log(`Function 1 executed after 2 seconds!`));

myQueue
  .queue(async () => await sleep(2)) // Wait for 2 seconds
  .then(() => console.log(`Function 2 executed after 2 seconds!`));

myQueue
  .queue(async () => await sleep(2)) // Wait for 2 seconds
  .then(() => console.log(`Function 3 executed after 4 seconds!`));
```

### With keyed concurrency

Keyed concurrency allows you to limit concurrency to certain function calls. If two or more queued function calls share the same key, they won't be run concurrently.

```js
import Qler from "qler";

const myQueue = Qler(2);

myQueue
  .queue(async () => await sleep(2), "foo") // Wait for 2 seconds and key on 'foo'
  .then(() => console.log(`Function 1 executed after 2 seconds!`));

myQueue
  .queue(async () => await sleep(2), "foo") // Wait for 2 seconds and key on 'foo'
  .then(() => console.log(`Function 2 executed after 4 seconds!`));

myQueue
  .queue(async () => await sleep(2), "bar") // Wait for 2 seconds and key on 'bar'
  .then(() => console.log(`Function 3 executed after 2 seconds!`));
```

## License

MIT © [Chris Villa](http://www.chrisvilla.co.uk)
