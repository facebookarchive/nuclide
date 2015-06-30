'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type Processor = (path: string) => void;

type ProcessorJob = {
  processor: Processor;
  paths: {[key: string]: boolean};
  canceled: boolean;
  startTime: number;
  chunkSize: number;
  chunkCount: number;
};

type ForEachCallback = (key: string, value: string, set: PathSet) => void;

var INITIAL_CHUNK_SIZE = 200;

/**
 * Value of the `.errorCode` property on the `Error` for a rejected Promise
 * returned by `PathSet.submit()`.
 */
var ERROR_CODE_CANCELED = 21;

// TODO(mikeo): Replace this with nuclide-logging once #6378527 is fixed.
var logger = {
  debug(...args) {
    // Uncomment for debugging.
    // console.log.apply(console, args);
  },
};

/**
 * A set of paths to iterate over. This set may be extremely large (more than
 * 500,000 items), so processing is performed in chunks as to not lock up the
 * event loop.
 *
 * Because processing is performed in chunks, it is possible that mutations to
 * the set could be interleaved with chunk processing, so special care is
 * taken to ensure that each Processor sees a consistent view of the contents
 * of the set.
 */
class PathSet {
  _initialChunkSize: number;
  _paths: {[key: string]: boolean};
  _latestPaths: ?{[key: string]: boolean};
  _jobs: Array<ProcessorJob>;

  constructor(options = {}) {
    // An ordinary JavaScript object is used instead of an ES6 Map or Set
    // because this code may also be run on Node 0.10.x, which would require the
    // use of an ES6 polyfill, which may not be performant enough for an
    // extremely large collection.
    // Each key in this object is a file path; each value is the boolean `true`.
    this._paths = options.paths || {};

    this._initialChunkSize = options.initialChunkSize || INITIAL_CHUNK_SIZE;

    // If non-null, this is an object with `this._paths` in its prototype chain.
    // For this object, and every object in its prototype chain up to, but not
    // including, `this._paths`, each key in this object is a file path while
    // each value is either `true` or `false`.
    //
    // Each link in the prototype chain represents a set of modifications to the
    // members of this PathSet where `true`/`false` corresponds to
    // presence/absence in the PathSet. Because of the way prototypes work in
    // JavaScript, checking for the presence of a path in this PathSet in the
    // context of the aggregate changes can be achieved via:
    //
    //     (this._latestPaths || this._paths)[path] === true
    //
    // Each Processor will operate on a link in the prototype chain. Once a link
    // is created (except for the root, this._paths), it is never modified, so
    // the Processor is guaranteed to see a consistent view of the set from the
    // time it starts processing.
    this._latestPaths = null;

    // This array has the invariant that every element corresponds to a job
    // that is running.
    this._jobs = [];
  }

  // TODO(mbolin): If the list of paths passed to addPaths() and removePaths()
  // is very large, then those methods could block the event loop. Consider
  // dividing things up to do the processing in batches, though that would
  // require changing those methods to be async. If that happens, care must be
  // taken to ensure that all class invariants are maintained. In practice,
  // providing the option to specify this._paths via the constructor might be
  // sufficient because the initial call to addPaths() is likely to require a
  // lot of processing, but subsequent updates are expected to be considerably
  // smaller.

  addPaths(paths: Array<string>) {
    if (this._jobs.length === 0) {
      // No jobs in process: update this._paths directly.
      paths.forEach(path => { this._paths[path] = true; });
    } else {
      // Otherwise, add a new head to the this._latestPaths chain.
      var proto = this._latestPaths || this._paths;
      var props = {};
      paths.forEach(path => { props[path] = {value: true, enumerable: true}; });
      this._latestPaths = Object.freeze(Object.create(proto, props));
    }
  }

  removePaths(paths: Array<string>) {
    if (this._jobs.length === 0) {
      // No jobs in process: update this._paths directly.
      paths.forEach(path => { delete this._paths[path]; });
    } else {
      // Otherwise, add a new head to the this._latestPaths chain.
      var proto = this._latestPaths || this._paths;
      var props = {};
      paths.forEach(path => { props[path] = {value: false, enumerable: true}; });
      this._latestPaths = Object.freeze(Object.create(proto, props));
    }
  }

  /**
   * Helper function to iterate over all the elements in this set.
   * Compatible with https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach.
   */
  forEach(callback: ForEachCallback): void {
    for(var path in this._paths) {
      callback(path, path, this);
    }
  }

  /**
   * Helper function to obtain a list of all of the paths in this set.
   */
  values(): Array<string> {
    var values = [];
    for(var path in this._paths) {
      values.push(path);
    }
    return values;
  }

  /**
   * Submits a processor and returns a special `Promise` that has a
   * `cancelJob()` method that can be used to cancel this job, which will reject
   * the `Promise`.
   *
   * If the returned `Promise` is canceled because `cancelJob()` was invoked (as
   * opposed to some sort of internal error), the `errorCode` property of the
   * `Error` will be `PathSet.ERROR_CODE_CANCELED`.
   */
  submit(processor: Processor): Promise<void> {
    // Because the paths for the job is iterated via for/in, it is imperative
    // that the paths object is not modified while it is being iterated.
    var job = {
      processor,
      paths: this._latestPaths || this._paths,
      canceled: false,
      startTime: Date.now(),
      chunkCount: 0,
    };
    this._jobs.push(job);
    var promise = this._runJob(job);
    promise.cancelJob = () => {
      job.canceled = true;
    };
    return promise;
  }

  _runJob(job: ProcessorJob): Promise<void> {
    var {paths, processor} = job;
    var count = 0;
    var chunkSize = this._initialChunkSize;

    var doCleanup = (err: ?Error) => {
      logger.debug(
          `${err ? 'Canceled ' : ''}ProcessorJob for ${processor} ` +
          `processed ${job.chunkCount} items in ${Date.now() - job.startTime}ms.`);

      // Now that the Promise has been determined, remove the job from the list.
      var index = this._jobs.indexOf(job);
      this._jobs.splice(index, 1);

      // Clean up the modification history to this PathSet, if appropriate.
      this._squashHistory();

      if (err) {
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      var generator;
      function* run() {
        for (var path in paths) {
          // Make sure the entry for `path` corresponds to `true`, as the
          // original entry could be shadowed by a nearer property in the
          // prototype chain whose value corresponds to `false`.
          if (paths[path] === true) {
            processor(path);
          }

          ++count;
          if (count === chunkSize) {
            job.chunkCount += chunkSize;
            process.nextTick(function() {
              generator.next();
            });
            yield;

            // Upon resuming, check whether this job has been canceled.
            if (job.canceled) {
              logger.debug(`canceling ${processor}`);
              var error = Error(`canceled ${processor}`);
              error.errorCode = ERROR_CODE_CANCELED;
              reject(error);
              return;
            }

            logger.debug(`resuming ${processor}`);

            // Otherwise, reset the count and process the next chunk.
            count = 0;
            // For each iteration, we double the chunk size under the assumption
            // that the more iterations we have gone through processing this
            // job, the more likely it is that the user is waiting on this job
            // and is not going to preempt it with another job. (Earlier in the
            // iteration cycle, the user is likely still typing,
            // creating/canceling jobs repeatedly.)
            chunkSize *= 2;
          }
        }
        job.chunkCount += count;
        resolve();
      }
      generator = run();
      generator.next();
    }).then(doCleanup, doCleanup);
  }

  _squashHistory() {
    // If the job list is now empty, collapse this._latestPaths, if non-null.
    if (this._latestPaths === null || this._jobs.length !== 0) {
      return;
    }

    var chain = findPrototypeChain(this._paths, this._latestPaths);
    chain.forEach(link => {
      for (var path in link) {
        if (link[path] === true) {
          this._paths[path] = true;
        } else {
          delete this._paths[path];
        }
      }
    });
    this._latestPaths = null;
  }
}

PathSet.ERROR_CODE_CANCELED = ERROR_CODE_CANCELED;

/**
 * Given two objects where one is a descendant of the other in the prototype
 * chain, return an array that corresponds to the chain of prototype objects.
 *
 * @return an Array ordered by "distance in the prototype chain from ancestor"
 *     in ascending order. The ancestor argument will not be in the Array.
 */
function findPrototypeChain(ancestor, descendant): Array {
  var chain = [];
  while (ancestor !== descendant) {
    chain.push(descendant);
    descendant = Object.getPrototypeOf(descendant);
  }
  return chain.reverse();
}

module.exports = PathSet;
