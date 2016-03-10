Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var INITIAL_CHUNK_SIZE = 200;

/**
 * Value of the `.errorCode` property on the `Error` for a rejected Promise
 * returned by `PathSet.submit()`.
 */
var ERROR_CODE_CANCELED = 21;

// TODO(mikeo): Replace this with nuclide-logging once #6378527 is fixed.
var logger = {
  debug: function debug() {
    // Uncomment for debugging.
    // console.log.apply(console, args);
  }
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

var PathSet = (function () {
  _createClass(PathSet, null, [{
    key: 'ERROR_CODE_CANCELED',
    value: ERROR_CODE_CANCELED,
    enumerable: true
  }]);

  function PathSet() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PathSet);

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

  /**
   * Given two objects where one is a descendant of the other in the prototype
   * chain, return an array that corresponds to the chain of prototype objects.
   *
   * @return an Array ordered by "distance in the prototype chain from ancestor"
   *     in ascending order. The ancestor argument will not be in the Array.
   */

  // TODO(mbolin): If the list of paths passed to addPaths() and removePaths()
  // is very large, then those methods could block the event loop. Consider
  // dividing things up to do the processing in batches, though that would
  // require changing those methods to be async. If that happens, care must be
  // taken to ensure that all class invariants are maintained. In practice,
  // providing the option to specify this._paths via the constructor might be
  // sufficient because the initial call to addPaths() is likely to require a
  // lot of processing, but subsequent updates are expected to be considerably
  // smaller.

  _createClass(PathSet, [{
    key: 'addPaths',
    value: function addPaths(paths) {
      var _this = this;

      if (this._jobs.length === 0) {
        // No jobs in process: update this._paths directly.
        paths.forEach(function (path) {
          _this._paths[path] = true;
        });
      } else {
        (function () {
          // Otherwise, add a new head to the this._latestPaths chain.
          var proto = _this._latestPaths || _this._paths;
          var props = {};
          paths.forEach(function (path) {
            props[path] = { value: true, enumerable: true };
          });
          _this._latestPaths = Object.freeze(Object.create(proto, props));
        })();
      }
    }
  }, {
    key: 'removePaths',
    value: function removePaths(paths) {
      var _this2 = this;

      if (this._jobs.length === 0) {
        // No jobs in process: update this._paths directly.
        paths.forEach(function (path) {
          delete _this2._paths[path];
        });
      } else {
        (function () {
          // Otherwise, add a new head to the this._latestPaths chain.
          var proto = _this2._latestPaths || _this2._paths;
          var props = {};
          paths.forEach(function (path) {
            props[path] = { value: false, enumerable: true };
          });
          _this2._latestPaths = Object.freeze(Object.create(proto, props));
        })();
      }
    }

    /**
     * Helper function to iterate over all the elements in this set.
     * Compatible with https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach.
     */
  }, {
    key: 'forEach',
    value: function forEach(callback) {
      for (var _path in this._paths) {
        callback(_path, _path, this);
      }
    }

    /**
     * Helper function to obtain a list of all of the paths in this set.
     */
  }, {
    key: 'values',
    value: function values() {
      var values = [];
      for (var _path2 in this._paths) {
        values.push(_path2);
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
  }, {
    key: 'submit',
    value: function submit(processor) {
      // Because the paths for the job is iterated via for/in, it is imperative
      // that the paths object is not modified while it is being iterated.
      var job = {
        processor: processor,
        paths: this._latestPaths || this._paths,
        canceled: false,
        startTime: Date.now(),
        chunkCount: 0
      };
      this._jobs.push(job);
      var promise = this._runJob(job);
      // $FlowFixMe: Remove the cancelJob expando off the promise.
      promise.cancelJob = function () {
        job.canceled = true;
      };
      return promise;
    }
  }, {
    key: '_runJob',
    value: function _runJob(job) {
      var _this3 = this;

      var paths = job.paths;
      var processor = job.processor;

      var count = 0;
      var chunkSize = this._initialChunkSize;

      var doCleanup = function doCleanup(err) {
        logger.debug((err ? 'Canceled ' : '') + 'ProcessorJob for ' + processor + ' ' + ('processed ' + job.chunkCount + ' items in ' + (Date.now() - job.startTime) + 'ms.'));

        // Now that the Promise has been determined, remove the job from the list.
        var index = _this3._jobs.indexOf(job);
        _this3._jobs.splice(index, 1);

        // Clean up the modification history to this PathSet, if appropriate.
        _this3._squashHistory();

        if (err) {
          throw err;
        }
      };

      return new Promise(function (resolve, reject) {
        var generator = undefined;
        function* run() {
          for (var _path3 in paths) {
            // Make sure the entry for `path` corresponds to `true`, as the
            // original entry could be shadowed by a nearer property in the
            // prototype chain whose value corresponds to `false`.
            if (paths[_path3] === true) {
              processor(_path3);
            }

            ++count;
            if (count === chunkSize) {
              job.chunkCount += chunkSize;
              process.nextTick(function () {
                if (generator) {
                  generator.next();
                }
              });

              // TODO: fix with https://github.com/facebook/flow/issues/912
              yield undefined;

              // Upon resuming, check whether this job has been canceled.
              if (job.canceled) {
                logger.debug('canceling ' + processor);
                var error = Error('canceled ' + processor);
                // $FlowFixMe: Remove the errorCode expando off the error.
                error.errorCode = ERROR_CODE_CANCELED;
                reject(error);
                return;
              }

              logger.debug('resuming ' + processor);

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
  }, {
    key: '_squashHistory',
    value: function _squashHistory() {
      var _this4 = this;

      // If the job list is now empty, collapse this._latestPaths, if not null or undefined.
      if (this._latestPaths == null || this._jobs.length !== 0) {
        return;
      }

      var chain = findPrototypeChain(this._paths, this._latestPaths);
      chain.forEach(function (link) {
        for (var _path4 in link) {
          if (link[_path4] === true) {
            _this4._paths[_path4] = true;
          } else {
            delete _this4._paths[_path4];
          }
        }
      });
      this._latestPaths = null;
    }
  }]);

  return PathSet;
})();

exports['default'] = PathSet;
function findPrototypeChain(ancestor, descendant) {
  var chain = [];
  while (ancestor !== descendant) {
    chain.push(descendant);
    descendant = Object.getPrototypeOf(descendant);
  }
  return chain.reverse();
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQztBQUN2QixjQUFVLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUNoRDtBQUNELFNBQU8sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQ3hCIiwiZmlsZSI6IlBhdGhTZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG50eXBlIFByb2Nlc3NvciA9IChwYXRoOiBzdHJpbmcpID0+IHZvaWQ7XG5cbnR5cGUgUHJvY2Vzc29ySm9iID0ge1xuICBwcm9jZXNzb3I6IFByb2Nlc3NvcjtcbiAgcGF0aHM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufTtcbiAgY2FuY2VsZWQ6IGJvb2xlYW47XG4gIHN0YXJ0VGltZTogbnVtYmVyO1xuICBjaHVua1NpemU/OiBudW1iZXI7XG4gIGNodW5rQ291bnQ6IG51bWJlcjtcbn07XG5cbnR5cGUgRm9yRWFjaENhbGxiYWNrID0gKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzZXQ6IFBhdGhTZXQpID0+IHZvaWQ7XG5cbmNvbnN0IElOSVRJQUxfQ0hVTktfU0laRSA9IDIwMDtcblxuLyoqXG4gKiBWYWx1ZSBvZiB0aGUgYC5lcnJvckNvZGVgIHByb3BlcnR5IG9uIHRoZSBgRXJyb3JgIGZvciBhIHJlamVjdGVkIFByb21pc2VcbiAqIHJldHVybmVkIGJ5IGBQYXRoU2V0LnN1Ym1pdCgpYC5cbiAqL1xuY29uc3QgRVJST1JfQ09ERV9DQU5DRUxFRCA9IDIxO1xuXG4vLyBUT0RPKG1pa2VvKTogUmVwbGFjZSB0aGlzIHdpdGggbnVjbGlkZS1sb2dnaW5nIG9uY2UgIzYzNzg1MjcgaXMgZml4ZWQuXG5jb25zdCBsb2dnZXIgPSB7XG4gIGRlYnVnKC4uLmFyZ3MpIHtcbiAgICAvLyBVbmNvbW1lbnQgZm9yIGRlYnVnZ2luZy5cbiAgICAvLyBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgfSxcbn07XG5cbi8qKlxuICogQSBzZXQgb2YgcGF0aHMgdG8gaXRlcmF0ZSBvdmVyLiBUaGlzIHNldCBtYXkgYmUgZXh0cmVtZWx5IGxhcmdlIChtb3JlIHRoYW5cbiAqIDUwMCwwMDAgaXRlbXMpLCBzbyBwcm9jZXNzaW5nIGlzIHBlcmZvcm1lZCBpbiBjaHVua3MgYXMgdG8gbm90IGxvY2sgdXAgdGhlXG4gKiBldmVudCBsb29wLlxuICpcbiAqIEJlY2F1c2UgcHJvY2Vzc2luZyBpcyBwZXJmb3JtZWQgaW4gY2h1bmtzLCBpdCBpcyBwb3NzaWJsZSB0aGF0IG11dGF0aW9ucyB0b1xuICogdGhlIHNldCBjb3VsZCBiZSBpbnRlcmxlYXZlZCB3aXRoIGNodW5rIHByb2Nlc3NpbmcsIHNvIHNwZWNpYWwgY2FyZSBpc1xuICogdGFrZW4gdG8gZW5zdXJlIHRoYXQgZWFjaCBQcm9jZXNzb3Igc2VlcyBhIGNvbnNpc3RlbnQgdmlldyBvZiB0aGUgY29udGVudHNcbiAqIG9mIHRoZSBzZXQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhTZXQge1xuICBfaW5pdGlhbENodW5rU2l6ZTogbnVtYmVyO1xuICBfcGF0aHM6IHtba2V5OiBzdHJpbmddOiBib29sZWFufTtcbiAgX2xhdGVzdFBhdGhzOiA/e1trZXk6IHN0cmluZ106IGJvb2xlYW59O1xuICBfam9iczogQXJyYXk8UHJvY2Vzc29ySm9iPjtcblxuICBzdGF0aWMgRVJST1JfQ09ERV9DQU5DRUxFRCA9IEVSUk9SX0NPREVfQ0FOQ0VMRUQ7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogT2JqZWN0ID0ge30pIHtcbiAgICAvLyBBbiBvcmRpbmFyeSBKYXZhU2NyaXB0IG9iamVjdCBpcyB1c2VkIGluc3RlYWQgb2YgYW4gRVM2IE1hcCBvciBTZXRcbiAgICAvLyBiZWNhdXNlIHRoaXMgY29kZSBtYXkgYWxzbyBiZSBydW4gb24gTm9kZSAwLjEwLngsIHdoaWNoIHdvdWxkIHJlcXVpcmUgdGhlXG4gICAgLy8gdXNlIG9mIGFuIEVTNiBwb2x5ZmlsbCwgd2hpY2ggbWF5IG5vdCBiZSBwZXJmb3JtYW50IGVub3VnaCBmb3IgYW5cbiAgICAvLyBleHRyZW1lbHkgbGFyZ2UgY29sbGVjdGlvbi5cbiAgICAvLyBFYWNoIGtleSBpbiB0aGlzIG9iamVjdCBpcyBhIGZpbGUgcGF0aDsgZWFjaCB2YWx1ZSBpcyB0aGUgYm9vbGVhbiBgdHJ1ZWAuXG4gICAgdGhpcy5fcGF0aHMgPSBvcHRpb25zLnBhdGhzIHx8IHt9O1xuXG4gICAgdGhpcy5faW5pdGlhbENodW5rU2l6ZSA9IG9wdGlvbnMuaW5pdGlhbENodW5rU2l6ZSB8fCBJTklUSUFMX0NIVU5LX1NJWkU7XG5cbiAgICAvLyBJZiBub24tbnVsbCwgdGhpcyBpcyBhbiBvYmplY3Qgd2l0aCBgdGhpcy5fcGF0aHNgIGluIGl0cyBwcm90b3R5cGUgY2hhaW4uXG4gICAgLy8gRm9yIHRoaXMgb2JqZWN0LCBhbmQgZXZlcnkgb2JqZWN0IGluIGl0cyBwcm90b3R5cGUgY2hhaW4gdXAgdG8sIGJ1dCBub3RcbiAgICAvLyBpbmNsdWRpbmcsIGB0aGlzLl9wYXRoc2AsIGVhY2gga2V5IGluIHRoaXMgb2JqZWN0IGlzIGEgZmlsZSBwYXRoIHdoaWxlXG4gICAgLy8gZWFjaCB2YWx1ZSBpcyBlaXRoZXIgYHRydWVgIG9yIGBmYWxzZWAuXG4gICAgLy9cbiAgICAvLyBFYWNoIGxpbmsgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiByZXByZXNlbnRzIGEgc2V0IG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlXG4gICAgLy8gbWVtYmVycyBvZiB0aGlzIFBhdGhTZXQgd2hlcmUgYHRydWVgL2BmYWxzZWAgY29ycmVzcG9uZHMgdG9cbiAgICAvLyBwcmVzZW5jZS9hYnNlbmNlIGluIHRoZSBQYXRoU2V0LiBCZWNhdXNlIG9mIHRoZSB3YXkgcHJvdG90eXBlcyB3b3JrIGluXG4gICAgLy8gSmF2YVNjcmlwdCwgY2hlY2tpbmcgZm9yIHRoZSBwcmVzZW5jZSBvZiBhIHBhdGggaW4gdGhpcyBQYXRoU2V0IGluIHRoZVxuICAgIC8vIGNvbnRleHQgb2YgdGhlIGFnZ3JlZ2F0ZSBjaGFuZ2VzIGNhbiBiZSBhY2hpZXZlZCB2aWE6XG4gICAgLy9cbiAgICAvLyAgICAgKHRoaXMuX2xhdGVzdFBhdGhzIHx8IHRoaXMuX3BhdGhzKVtwYXRoXSA9PT0gdHJ1ZVxuICAgIC8vXG4gICAgLy8gRWFjaCBQcm9jZXNzb3Igd2lsbCBvcGVyYXRlIG9uIGEgbGluayBpbiB0aGUgcHJvdG90eXBlIGNoYWluLiBPbmNlIGEgbGlua1xuICAgIC8vIGlzIGNyZWF0ZWQgKGV4Y2VwdCBmb3IgdGhlIHJvb3QsIHRoaXMuX3BhdGhzKSwgaXQgaXMgbmV2ZXIgbW9kaWZpZWQsIHNvXG4gICAgLy8gdGhlIFByb2Nlc3NvciBpcyBndWFyYW50ZWVkIHRvIHNlZSBhIGNvbnNpc3RlbnQgdmlldyBvZiB0aGUgc2V0IGZyb20gdGhlXG4gICAgLy8gdGltZSBpdCBzdGFydHMgcHJvY2Vzc2luZy5cbiAgICB0aGlzLl9sYXRlc3RQYXRocyA9IG51bGw7XG5cbiAgICAvLyBUaGlzIGFycmF5IGhhcyB0aGUgaW52YXJpYW50IHRoYXQgZXZlcnkgZWxlbWVudCBjb3JyZXNwb25kcyB0byBhIGpvYlxuICAgIC8vIHRoYXQgaXMgcnVubmluZy5cbiAgICB0aGlzLl9qb2JzID0gW107XG4gIH1cblxuICAvLyBUT0RPKG1ib2xpbik6IElmIHRoZSBsaXN0IG9mIHBhdGhzIHBhc3NlZCB0byBhZGRQYXRocygpIGFuZCByZW1vdmVQYXRocygpXG4gIC8vIGlzIHZlcnkgbGFyZ2UsIHRoZW4gdGhvc2UgbWV0aG9kcyBjb3VsZCBibG9jayB0aGUgZXZlbnQgbG9vcC4gQ29uc2lkZXJcbiAgLy8gZGl2aWRpbmcgdGhpbmdzIHVwIHRvIGRvIHRoZSBwcm9jZXNzaW5nIGluIGJhdGNoZXMsIHRob3VnaCB0aGF0IHdvdWxkXG4gIC8vIHJlcXVpcmUgY2hhbmdpbmcgdGhvc2UgbWV0aG9kcyB0byBiZSBhc3luYy4gSWYgdGhhdCBoYXBwZW5zLCBjYXJlIG11c3QgYmVcbiAgLy8gdGFrZW4gdG8gZW5zdXJlIHRoYXQgYWxsIGNsYXNzIGludmFyaWFudHMgYXJlIG1haW50YWluZWQuIEluIHByYWN0aWNlLFxuICAvLyBwcm92aWRpbmcgdGhlIG9wdGlvbiB0byBzcGVjaWZ5IHRoaXMuX3BhdGhzIHZpYSB0aGUgY29uc3RydWN0b3IgbWlnaHQgYmVcbiAgLy8gc3VmZmljaWVudCBiZWNhdXNlIHRoZSBpbml0aWFsIGNhbGwgdG8gYWRkUGF0aHMoKSBpcyBsaWtlbHkgdG8gcmVxdWlyZSBhXG4gIC8vIGxvdCBvZiBwcm9jZXNzaW5nLCBidXQgc3Vic2VxdWVudCB1cGRhdGVzIGFyZSBleHBlY3RlZCB0byBiZSBjb25zaWRlcmFibHlcbiAgLy8gc21hbGxlci5cblxuICBhZGRQYXRocyhwYXRoczogQXJyYXk8c3RyaW5nPikge1xuICAgIGlmICh0aGlzLl9qb2JzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gTm8gam9icyBpbiBwcm9jZXNzOiB1cGRhdGUgdGhpcy5fcGF0aHMgZGlyZWN0bHkuXG4gICAgICBwYXRocy5mb3JFYWNoKHBhdGggPT4geyB0aGlzLl9wYXRoc1twYXRoXSA9IHRydWU7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBPdGhlcndpc2UsIGFkZCBhIG5ldyBoZWFkIHRvIHRoZSB0aGlzLl9sYXRlc3RQYXRocyBjaGFpbi5cbiAgICAgIGNvbnN0IHByb3RvID0gdGhpcy5fbGF0ZXN0UGF0aHMgfHwgdGhpcy5fcGF0aHM7XG4gICAgICBjb25zdCBwcm9wcyA9IHt9O1xuICAgICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHsgcHJvcHNbcGF0aF0gPSB7dmFsdWU6IHRydWUsIGVudW1lcmFibGU6IHRydWV9OyB9KTtcbiAgICAgIHRoaXMuX2xhdGVzdFBhdGhzID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKHByb3RvLCBwcm9wcykpO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZVBhdGhzKHBhdGhzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgaWYgKHRoaXMuX2pvYnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBObyBqb2JzIGluIHByb2Nlc3M6IHVwZGF0ZSB0aGlzLl9wYXRocyBkaXJlY3RseS5cbiAgICAgIHBhdGhzLmZvckVhY2gocGF0aCA9PiB7IGRlbGV0ZSB0aGlzLl9wYXRoc1twYXRoXTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE90aGVyd2lzZSwgYWRkIGEgbmV3IGhlYWQgdG8gdGhlIHRoaXMuX2xhdGVzdFBhdGhzIGNoYWluLlxuICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLl9sYXRlc3RQYXRocyB8fCB0aGlzLl9wYXRocztcbiAgICAgIGNvbnN0IHByb3BzID0ge307XG4gICAgICBwYXRocy5mb3JFYWNoKHBhdGggPT4geyBwcm9wc1twYXRoXSA9IHt2YWx1ZTogZmFsc2UsIGVudW1lcmFibGU6IHRydWV9OyB9KTtcbiAgICAgIHRoaXMuX2xhdGVzdFBhdGhzID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKHByb3RvLCBwcm9wcykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gaXRlcmF0ZSBvdmVyIGFsbCB0aGUgZWxlbWVudHMgaW4gdGhpcyBzZXQuXG4gICAqIENvbXBhdGlibGUgd2l0aCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TZXQvZm9yRWFjaC5cbiAgICovXG4gIGZvckVhY2goY2FsbGJhY2s6IEZvckVhY2hDYWxsYmFjayk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgcGF0aCBpbiB0aGlzLl9wYXRocykge1xuICAgICAgY2FsbGJhY2socGF0aCwgcGF0aCwgdGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBvYnRhaW4gYSBsaXN0IG9mIGFsbCBvZiB0aGUgcGF0aHMgaW4gdGhpcyBzZXQuXG4gICAqL1xuICB2YWx1ZXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgZm9yIChjb25zdCBwYXRoIGluIHRoaXMuX3BhdGhzKSB7XG4gICAgICB2YWx1ZXMucHVzaChwYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXRzIGEgcHJvY2Vzc29yIGFuZCByZXR1cm5zIGEgc3BlY2lhbCBgUHJvbWlzZWAgdGhhdCBoYXMgYVxuICAgKiBgY2FuY2VsSm9iKClgIG1ldGhvZCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNhbmNlbCB0aGlzIGpvYiwgd2hpY2ggd2lsbCByZWplY3RcbiAgICogdGhlIGBQcm9taXNlYC5cbiAgICpcbiAgICogSWYgdGhlIHJldHVybmVkIGBQcm9taXNlYCBpcyBjYW5jZWxlZCBiZWNhdXNlIGBjYW5jZWxKb2IoKWAgd2FzIGludm9rZWQgKGFzXG4gICAqIG9wcG9zZWQgdG8gc29tZSBzb3J0IG9mIGludGVybmFsIGVycm9yKSwgdGhlIGBlcnJvckNvZGVgIHByb3BlcnR5IG9mIHRoZVxuICAgKiBgRXJyb3JgIHdpbGwgYmUgYFBhdGhTZXQuRVJST1JfQ09ERV9DQU5DRUxFRGAuXG4gICAqL1xuICBzdWJtaXQocHJvY2Vzc29yOiBQcm9jZXNzb3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBCZWNhdXNlIHRoZSBwYXRocyBmb3IgdGhlIGpvYiBpcyBpdGVyYXRlZCB2aWEgZm9yL2luLCBpdCBpcyBpbXBlcmF0aXZlXG4gICAgLy8gdGhhdCB0aGUgcGF0aHMgb2JqZWN0IGlzIG5vdCBtb2RpZmllZCB3aGlsZSBpdCBpcyBiZWluZyBpdGVyYXRlZC5cbiAgICBjb25zdCBqb2IgPSB7XG4gICAgICBwcm9jZXNzb3IsXG4gICAgICBwYXRoczogdGhpcy5fbGF0ZXN0UGF0aHMgfHwgdGhpcy5fcGF0aHMsXG4gICAgICBjYW5jZWxlZDogZmFsc2UsXG4gICAgICBzdGFydFRpbWU6IERhdGUubm93KCksXG4gICAgICBjaHVua0NvdW50OiAwLFxuICAgIH07XG4gICAgdGhpcy5fam9icy5wdXNoKGpvYik7XG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX3J1bkpvYihqb2IpO1xuICAgIC8vICRGbG93Rml4TWU6IFJlbW92ZSB0aGUgY2FuY2VsSm9iIGV4cGFuZG8gb2ZmIHRoZSBwcm9taXNlLlxuICAgIHByb21pc2UuY2FuY2VsSm9iID0gKCkgPT4ge1xuICAgICAgam9iLmNhbmNlbGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgX3J1bkpvYihqb2I6IFByb2Nlc3NvckpvYik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHtwYXRocywgcHJvY2Vzc29yfSA9IGpvYjtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGxldCBjaHVua1NpemUgPSB0aGlzLl9pbml0aWFsQ2h1bmtTaXplO1xuXG4gICAgY29uc3QgZG9DbGVhbnVwID0gKGVycjogP0Vycm9yKSA9PiB7XG4gICAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgICAgYCR7ZXJyID8gJ0NhbmNlbGVkICcgOiAnJ31Qcm9jZXNzb3JKb2IgZm9yICR7cHJvY2Vzc29yfSBgICtcbiAgICAgICAgICBgcHJvY2Vzc2VkICR7am9iLmNodW5rQ291bnR9IGl0ZW1zIGluICR7RGF0ZS5ub3coKSAtIGpvYi5zdGFydFRpbWV9bXMuYCk7XG5cbiAgICAgIC8vIE5vdyB0aGF0IHRoZSBQcm9taXNlIGhhcyBiZWVuIGRldGVybWluZWQsIHJlbW92ZSB0aGUgam9iIGZyb20gdGhlIGxpc3QuXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2pvYnMuaW5kZXhPZihqb2IpO1xuICAgICAgdGhpcy5fam9icy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAvLyBDbGVhbiB1cCB0aGUgbW9kaWZpY2F0aW9uIGhpc3RvcnkgdG8gdGhpcyBQYXRoU2V0LCBpZiBhcHByb3ByaWF0ZS5cbiAgICAgIHRoaXMuX3NxdWFzaEhpc3RvcnkoKTtcblxuICAgICAgaWYgKGVycikge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgZ2VuZXJhdG9yO1xuICAgICAgZnVuY3Rpb24qIHJ1bigpIHtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIGluIHBhdGhzKSB7XG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBlbnRyeSBmb3IgYHBhdGhgIGNvcnJlc3BvbmRzIHRvIGB0cnVlYCwgYXMgdGhlXG4gICAgICAgICAgLy8gb3JpZ2luYWwgZW50cnkgY291bGQgYmUgc2hhZG93ZWQgYnkgYSBuZWFyZXIgcHJvcGVydHkgaW4gdGhlXG4gICAgICAgICAgLy8gcHJvdG90eXBlIGNoYWluIHdob3NlIHZhbHVlIGNvcnJlc3BvbmRzIHRvIGBmYWxzZWAuXG4gICAgICAgICAgaWYgKHBhdGhzW3BhdGhdID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwcm9jZXNzb3IocGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgKytjb3VudDtcbiAgICAgICAgICBpZiAoY291bnQgPT09IGNodW5rU2l6ZSkge1xuICAgICAgICAgICAgam9iLmNodW5rQ291bnQgKz0gY2h1bmtTaXplO1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKGdlbmVyYXRvcikge1xuICAgICAgICAgICAgICAgIGdlbmVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBmaXggd2l0aCBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvOTEyXG4gICAgICAgICAgICB5aWVsZCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIC8vIFVwb24gcmVzdW1pbmcsIGNoZWNrIHdoZXRoZXIgdGhpcyBqb2IgaGFzIGJlZW4gY2FuY2VsZWQuXG4gICAgICAgICAgICBpZiAoam9iLmNhbmNlbGVkKSB7XG4gICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgY2FuY2VsaW5nICR7cHJvY2Vzc29yfWApO1xuICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IEVycm9yKGBjYW5jZWxlZCAke3Byb2Nlc3Nvcn1gKTtcbiAgICAgICAgICAgICAgLy8gJEZsb3dGaXhNZTogUmVtb3ZlIHRoZSBlcnJvckNvZGUgZXhwYW5kbyBvZmYgdGhlIGVycm9yLlxuICAgICAgICAgICAgICBlcnJvci5lcnJvckNvZGUgPSBFUlJPUl9DT0RFX0NBTkNFTEVEO1xuICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgcmVzdW1pbmcgJHtwcm9jZXNzb3J9YCk7XG5cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgcmVzZXQgdGhlIGNvdW50IGFuZCBwcm9jZXNzIHRoZSBuZXh0IGNodW5rLlxuICAgICAgICAgICAgY291bnQgPSAwO1xuICAgICAgICAgICAgLy8gRm9yIGVhY2ggaXRlcmF0aW9uLCB3ZSBkb3VibGUgdGhlIGNodW5rIHNpemUgdW5kZXIgdGhlIGFzc3VtcHRpb25cbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIG1vcmUgaXRlcmF0aW9ucyB3ZSBoYXZlIGdvbmUgdGhyb3VnaCBwcm9jZXNzaW5nIHRoaXNcbiAgICAgICAgICAgIC8vIGpvYiwgdGhlIG1vcmUgbGlrZWx5IGl0IGlzIHRoYXQgdGhlIHVzZXIgaXMgd2FpdGluZyBvbiB0aGlzIGpvYlxuICAgICAgICAgICAgLy8gYW5kIGlzIG5vdCBnb2luZyB0byBwcmVlbXB0IGl0IHdpdGggYW5vdGhlciBqb2IuIChFYXJsaWVyIGluIHRoZVxuICAgICAgICAgICAgLy8gaXRlcmF0aW9uIGN5Y2xlLCB0aGUgdXNlciBpcyBsaWtlbHkgc3RpbGwgdHlwaW5nLFxuICAgICAgICAgICAgLy8gY3JlYXRpbmcvY2FuY2VsaW5nIGpvYnMgcmVwZWF0ZWRseS4pXG4gICAgICAgICAgICBjaHVua1NpemUgKj0gMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgam9iLmNodW5rQ291bnQgKz0gY291bnQ7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICAgIGdlbmVyYXRvciA9IHJ1bigpO1xuICAgICAgZ2VuZXJhdG9yLm5leHQoKTtcbiAgICB9KS50aGVuKGRvQ2xlYW51cCwgZG9DbGVhbnVwKTtcbiAgfVxuXG4gIF9zcXVhc2hIaXN0b3J5KCkge1xuICAgIC8vIElmIHRoZSBqb2IgbGlzdCBpcyBub3cgZW1wdHksIGNvbGxhcHNlIHRoaXMuX2xhdGVzdFBhdGhzLCBpZiBub3QgbnVsbCBvciB1bmRlZmluZWQuXG4gICAgaWYgKHRoaXMuX2xhdGVzdFBhdGhzID09IG51bGwgfHwgdGhpcy5fam9icy5sZW5ndGggIT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjaGFpbiA9IGZpbmRQcm90b3R5cGVDaGFpbih0aGlzLl9wYXRocywgdGhpcy5fbGF0ZXN0UGF0aHMpO1xuICAgIGNoYWluLmZvckVhY2gobGluayA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHBhdGggaW4gbGluaykge1xuICAgICAgICBpZiAobGlua1twYXRoXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuX3BhdGhzW3BhdGhdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5fcGF0aHNbcGF0aF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9sYXRlc3RQYXRocyA9IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBHaXZlbiB0d28gb2JqZWN0cyB3aGVyZSBvbmUgaXMgYSBkZXNjZW5kYW50IG9mIHRoZSBvdGhlciBpbiB0aGUgcHJvdG90eXBlXG4gKiBjaGFpbiwgcmV0dXJuIGFuIGFycmF5IHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGNoYWluIG9mIHByb3RvdHlwZSBvYmplY3RzLlxuICpcbiAqIEByZXR1cm4gYW4gQXJyYXkgb3JkZXJlZCBieSBcImRpc3RhbmNlIGluIHRoZSBwcm90b3R5cGUgY2hhaW4gZnJvbSBhbmNlc3RvclwiXG4gKiAgICAgaW4gYXNjZW5kaW5nIG9yZGVyLiBUaGUgYW5jZXN0b3IgYXJndW1lbnQgd2lsbCBub3QgYmUgaW4gdGhlIEFycmF5LlxuICovXG5mdW5jdGlvbiBmaW5kUHJvdG90eXBlQ2hhaW4oYW5jZXN0b3I6IE9iamVjdCwgZGVzY2VuZGFudDogT2JqZWN0KTogQXJyYXk8T2JqZWN0PiB7XG4gIGNvbnN0IGNoYWluID0gW107XG4gIHdoaWxlIChhbmNlc3RvciAhPT0gZGVzY2VuZGFudCkge1xuICAgIGNoYWluLnB1c2goZGVzY2VuZGFudCk7XG4gICAgZGVzY2VuZGFudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihkZXNjZW5kYW50KTtcbiAgfVxuICByZXR1cm4gY2hhaW4ucmV2ZXJzZSgpO1xufVxuIl19