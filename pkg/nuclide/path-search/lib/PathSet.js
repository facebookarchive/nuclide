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

// Can't do `declare class` since this isn't a library definition file

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
//# sourceMappingURL=data:application/json;base64,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QVUsQ0FBQyxDQUFDO0FBQ3ZCLGNBQVUsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ2hEO0FBQ0QsU0FBTyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDeEIiLCJmaWxlIjoiUGF0aFNldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgUHJvY2Vzc29yID0gKHBhdGg6IHN0cmluZykgPT4gdm9pZDtcblxudHlwZSBQcm9jZXNzb3JKb2IgPSB7XG4gIHByb2Nlc3NvcjogUHJvY2Vzc29yLFxuICBwYXRoczoge1trZXk6IHN0cmluZ106IGJvb2xlYW59LFxuICBjYW5jZWxlZDogYm9vbGVhbixcbiAgc3RhcnRUaW1lOiBudW1iZXIsXG4gIGNodW5rU2l6ZT86IG51bWJlcixcbiAgY2h1bmtDb3VudDogbnVtYmVyLFxufTtcblxudHlwZSBGb3JFYWNoQ2FsbGJhY2sgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNldDogUGF0aFNldCkgPT4gdm9pZDtcblxuY29uc3QgSU5JVElBTF9DSFVOS19TSVpFID0gMjAwO1xuXG4vKipcbiAqIFZhbHVlIG9mIHRoZSBgLmVycm9yQ29kZWAgcHJvcGVydHkgb24gdGhlIGBFcnJvcmAgZm9yIGEgcmVqZWN0ZWQgUHJvbWlzZVxuICogcmV0dXJuZWQgYnkgYFBhdGhTZXQuc3VibWl0KClgLlxuICovXG5jb25zdCBFUlJPUl9DT0RFX0NBTkNFTEVEID0gMjE7XG5cbi8vIENhbid0IGRvIGBkZWNsYXJlIGNsYXNzYCBzaW5jZSB0aGlzIGlzbid0IGEgbGlicmFyeSBkZWZpbml0aW9uIGZpbGVcbmV4cG9ydCB0eXBlIFBhdGhTZXRFcnJvciA9IEVycm9yICYge2Vycm9yQ29kZT86IG51bWJlcn07XG5cbi8vIFRPRE8obWlrZW8pOiBSZXBsYWNlIHRoaXMgd2l0aCBudWNsaWRlLWxvZ2dpbmcgb25jZSAjNjM3ODUyNyBpcyBmaXhlZC5cbmNvbnN0IGxvZ2dlciA9IHtcbiAgZGVidWcoLi4uYXJncykge1xuICAgIC8vIFVuY29tbWVudCBmb3IgZGVidWdnaW5nLlxuICAgIC8vIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xuICB9LFxufTtcblxuLyoqXG4gKiBBIHNldCBvZiBwYXRocyB0byBpdGVyYXRlIG92ZXIuIFRoaXMgc2V0IG1heSBiZSBleHRyZW1lbHkgbGFyZ2UgKG1vcmUgdGhhblxuICogNTAwLDAwMCBpdGVtcyksIHNvIHByb2Nlc3NpbmcgaXMgcGVyZm9ybWVkIGluIGNodW5rcyBhcyB0byBub3QgbG9jayB1cCB0aGVcbiAqIGV2ZW50IGxvb3AuXG4gKlxuICogQmVjYXVzZSBwcm9jZXNzaW5nIGlzIHBlcmZvcm1lZCBpbiBjaHVua3MsIGl0IGlzIHBvc3NpYmxlIHRoYXQgbXV0YXRpb25zIHRvXG4gKiB0aGUgc2V0IGNvdWxkIGJlIGludGVybGVhdmVkIHdpdGggY2h1bmsgcHJvY2Vzc2luZywgc28gc3BlY2lhbCBjYXJlIGlzXG4gKiB0YWtlbiB0byBlbnN1cmUgdGhhdCBlYWNoIFByb2Nlc3NvciBzZWVzIGEgY29uc2lzdGVudCB2aWV3IG9mIHRoZSBjb250ZW50c1xuICogb2YgdGhlIHNldC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0aFNldCB7XG4gIF9pbml0aWFsQ2h1bmtTaXplOiBudW1iZXI7XG4gIF9wYXRoczoge1trZXk6IHN0cmluZ106IGJvb2xlYW59O1xuICBfbGF0ZXN0UGF0aHM6ID97W2tleTogc3RyaW5nXTogYm9vbGVhbn07XG4gIF9qb2JzOiBBcnJheTxQcm9jZXNzb3JKb2I+O1xuXG4gIHN0YXRpYyBFUlJPUl9DT0RFX0NBTkNFTEVEID0gRVJST1JfQ09ERV9DQU5DRUxFRDtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBPYmplY3QgPSB7fSkge1xuICAgIC8vIEFuIG9yZGluYXJ5IEphdmFTY3JpcHQgb2JqZWN0IGlzIHVzZWQgaW5zdGVhZCBvZiBhbiBFUzYgTWFwIG9yIFNldFxuICAgIC8vIGJlY2F1c2UgdGhpcyBjb2RlIG1heSBhbHNvIGJlIHJ1biBvbiBOb2RlIDAuMTAueCwgd2hpY2ggd291bGQgcmVxdWlyZSB0aGVcbiAgICAvLyB1c2Ugb2YgYW4gRVM2IHBvbHlmaWxsLCB3aGljaCBtYXkgbm90IGJlIHBlcmZvcm1hbnQgZW5vdWdoIGZvciBhblxuICAgIC8vIGV4dHJlbWVseSBsYXJnZSBjb2xsZWN0aW9uLlxuICAgIC8vIEVhY2gga2V5IGluIHRoaXMgb2JqZWN0IGlzIGEgZmlsZSBwYXRoOyBlYWNoIHZhbHVlIGlzIHRoZSBib29sZWFuIGB0cnVlYC5cbiAgICB0aGlzLl9wYXRocyA9IG9wdGlvbnMucGF0aHMgfHwge307XG5cbiAgICB0aGlzLl9pbml0aWFsQ2h1bmtTaXplID0gb3B0aW9ucy5pbml0aWFsQ2h1bmtTaXplIHx8IElOSVRJQUxfQ0hVTktfU0laRTtcblxuICAgIC8vIElmIG5vbi1udWxsLCB0aGlzIGlzIGFuIG9iamVjdCB3aXRoIGB0aGlzLl9wYXRoc2AgaW4gaXRzIHByb3RvdHlwZSBjaGFpbi5cbiAgICAvLyBGb3IgdGhpcyBvYmplY3QsIGFuZCBldmVyeSBvYmplY3QgaW4gaXRzIHByb3RvdHlwZSBjaGFpbiB1cCB0bywgYnV0IG5vdFxuICAgIC8vIGluY2x1ZGluZywgYHRoaXMuX3BhdGhzYCwgZWFjaCBrZXkgaW4gdGhpcyBvYmplY3QgaXMgYSBmaWxlIHBhdGggd2hpbGVcbiAgICAvLyBlYWNoIHZhbHVlIGlzIGVpdGhlciBgdHJ1ZWAgb3IgYGZhbHNlYC5cbiAgICAvL1xuICAgIC8vIEVhY2ggbGluayBpbiB0aGUgcHJvdG90eXBlIGNoYWluIHJlcHJlc2VudHMgYSBzZXQgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGVcbiAgICAvLyBtZW1iZXJzIG9mIHRoaXMgUGF0aFNldCB3aGVyZSBgdHJ1ZWAvYGZhbHNlYCBjb3JyZXNwb25kcyB0b1xuICAgIC8vIHByZXNlbmNlL2Fic2VuY2UgaW4gdGhlIFBhdGhTZXQuIEJlY2F1c2Ugb2YgdGhlIHdheSBwcm90b3R5cGVzIHdvcmsgaW5cbiAgICAvLyBKYXZhU2NyaXB0LCBjaGVja2luZyBmb3IgdGhlIHByZXNlbmNlIG9mIGEgcGF0aCBpbiB0aGlzIFBhdGhTZXQgaW4gdGhlXG4gICAgLy8gY29udGV4dCBvZiB0aGUgYWdncmVnYXRlIGNoYW5nZXMgY2FuIGJlIGFjaGlldmVkIHZpYTpcbiAgICAvL1xuICAgIC8vICAgICAodGhpcy5fbGF0ZXN0UGF0aHMgfHwgdGhpcy5fcGF0aHMpW3BhdGhdID09PSB0cnVlXG4gICAgLy9cbiAgICAvLyBFYWNoIFByb2Nlc3NvciB3aWxsIG9wZXJhdGUgb24gYSBsaW5rIGluIHRoZSBwcm90b3R5cGUgY2hhaW4uIE9uY2UgYSBsaW5rXG4gICAgLy8gaXMgY3JlYXRlZCAoZXhjZXB0IGZvciB0aGUgcm9vdCwgdGhpcy5fcGF0aHMpLCBpdCBpcyBuZXZlciBtb2RpZmllZCwgc29cbiAgICAvLyB0aGUgUHJvY2Vzc29yIGlzIGd1YXJhbnRlZWQgdG8gc2VlIGEgY29uc2lzdGVudCB2aWV3IG9mIHRoZSBzZXQgZnJvbSB0aGVcbiAgICAvLyB0aW1lIGl0IHN0YXJ0cyBwcm9jZXNzaW5nLlxuICAgIHRoaXMuX2xhdGVzdFBhdGhzID0gbnVsbDtcblxuICAgIC8vIFRoaXMgYXJyYXkgaGFzIHRoZSBpbnZhcmlhbnQgdGhhdCBldmVyeSBlbGVtZW50IGNvcnJlc3BvbmRzIHRvIGEgam9iXG4gICAgLy8gdGhhdCBpcyBydW5uaW5nLlxuICAgIHRoaXMuX2pvYnMgPSBbXTtcbiAgfVxuXG4gIC8vIFRPRE8obWJvbGluKTogSWYgdGhlIGxpc3Qgb2YgcGF0aHMgcGFzc2VkIHRvIGFkZFBhdGhzKCkgYW5kIHJlbW92ZVBhdGhzKClcbiAgLy8gaXMgdmVyeSBsYXJnZSwgdGhlbiB0aG9zZSBtZXRob2RzIGNvdWxkIGJsb2NrIHRoZSBldmVudCBsb29wLiBDb25zaWRlclxuICAvLyBkaXZpZGluZyB0aGluZ3MgdXAgdG8gZG8gdGhlIHByb2Nlc3NpbmcgaW4gYmF0Y2hlcywgdGhvdWdoIHRoYXQgd291bGRcbiAgLy8gcmVxdWlyZSBjaGFuZ2luZyB0aG9zZSBtZXRob2RzIHRvIGJlIGFzeW5jLiBJZiB0aGF0IGhhcHBlbnMsIGNhcmUgbXVzdCBiZVxuICAvLyB0YWtlbiB0byBlbnN1cmUgdGhhdCBhbGwgY2xhc3MgaW52YXJpYW50cyBhcmUgbWFpbnRhaW5lZC4gSW4gcHJhY3RpY2UsXG4gIC8vIHByb3ZpZGluZyB0aGUgb3B0aW9uIHRvIHNwZWNpZnkgdGhpcy5fcGF0aHMgdmlhIHRoZSBjb25zdHJ1Y3RvciBtaWdodCBiZVxuICAvLyBzdWZmaWNpZW50IGJlY2F1c2UgdGhlIGluaXRpYWwgY2FsbCB0byBhZGRQYXRocygpIGlzIGxpa2VseSB0byByZXF1aXJlIGFcbiAgLy8gbG90IG9mIHByb2Nlc3NpbmcsIGJ1dCBzdWJzZXF1ZW50IHVwZGF0ZXMgYXJlIGV4cGVjdGVkIHRvIGJlIGNvbnNpZGVyYWJseVxuICAvLyBzbWFsbGVyLlxuXG4gIGFkZFBhdGhzKHBhdGhzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgaWYgKHRoaXMuX2pvYnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBObyBqb2JzIGluIHByb2Nlc3M6IHVwZGF0ZSB0aGlzLl9wYXRocyBkaXJlY3RseS5cbiAgICAgIHBhdGhzLmZvckVhY2gocGF0aCA9PiB7IHRoaXMuX3BhdGhzW3BhdGhdID0gdHJ1ZTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE90aGVyd2lzZSwgYWRkIGEgbmV3IGhlYWQgdG8gdGhlIHRoaXMuX2xhdGVzdFBhdGhzIGNoYWluLlxuICAgICAgY29uc3QgcHJvdG8gPSB0aGlzLl9sYXRlc3RQYXRocyB8fCB0aGlzLl9wYXRocztcbiAgICAgIGNvbnN0IHByb3BzID0ge307XG4gICAgICBwYXRocy5mb3JFYWNoKHBhdGggPT4geyBwcm9wc1twYXRoXSA9IHt2YWx1ZTogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZX07IH0pO1xuICAgICAgdGhpcy5fbGF0ZXN0UGF0aHMgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUocHJvdG8sIHByb3BzKSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlUGF0aHMocGF0aHM6IEFycmF5PHN0cmluZz4pIHtcbiAgICBpZiAodGhpcy5fam9icy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIE5vIGpvYnMgaW4gcHJvY2VzczogdXBkYXRlIHRoaXMuX3BhdGhzIGRpcmVjdGx5LlxuICAgICAgcGF0aHMuZm9yRWFjaChwYXRoID0+IHsgZGVsZXRlIHRoaXMuX3BhdGhzW3BhdGhdOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT3RoZXJ3aXNlLCBhZGQgYSBuZXcgaGVhZCB0byB0aGUgdGhpcy5fbGF0ZXN0UGF0aHMgY2hhaW4uXG4gICAgICBjb25zdCBwcm90byA9IHRoaXMuX2xhdGVzdFBhdGhzIHx8IHRoaXMuX3BhdGhzO1xuICAgICAgY29uc3QgcHJvcHMgPSB7fTtcbiAgICAgIHBhdGhzLmZvckVhY2gocGF0aCA9PiB7IHByb3BzW3BhdGhdID0ge3ZhbHVlOiBmYWxzZSwgZW51bWVyYWJsZTogdHJ1ZX07IH0pO1xuICAgICAgdGhpcy5fbGF0ZXN0UGF0aHMgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUocHJvdG8sIHByb3BzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYWxsIHRoZSBlbGVtZW50cyBpbiB0aGlzIHNldC5cbiAgICogQ29tcGF0aWJsZSB3aXRoIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1NldC9mb3JFYWNoLlxuICAgKi9cbiAgZm9yRWFjaChjYWxsYmFjazogRm9yRWFjaENhbGxiYWNrKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBwYXRoIGluIHRoaXMuX3BhdGhzKSB7XG4gICAgICBjYWxsYmFjayhwYXRoLCBwYXRoLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRvIG9idGFpbiBhIGxpc3Qgb2YgYWxsIG9mIHRoZSBwYXRocyBpbiB0aGlzIHNldC5cbiAgICovXG4gIHZhbHVlcygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICBjb25zdCB2YWx1ZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHBhdGggaW4gdGhpcy5fcGF0aHMpIHtcbiAgICAgIHZhbHVlcy5wdXNoKHBhdGgpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pdHMgYSBwcm9jZXNzb3IgYW5kIHJldHVybnMgYSBzcGVjaWFsIGBQcm9taXNlYCB0aGF0IGhhcyBhXG4gICAqIGBjYW5jZWxKb2IoKWAgbWV0aG9kIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2FuY2VsIHRoaXMgam9iLCB3aGljaCB3aWxsIHJlamVjdFxuICAgKiB0aGUgYFByb21pc2VgLlxuICAgKlxuICAgKiBJZiB0aGUgcmV0dXJuZWQgYFByb21pc2VgIGlzIGNhbmNlbGVkIGJlY2F1c2UgYGNhbmNlbEpvYigpYCB3YXMgaW52b2tlZCAoYXNcbiAgICogb3Bwb3NlZCB0byBzb21lIHNvcnQgb2YgaW50ZXJuYWwgZXJyb3IpLCB0aGUgYGVycm9yQ29kZWAgcHJvcGVydHkgb2YgdGhlXG4gICAqIGBFcnJvcmAgd2lsbCBiZSBgUGF0aFNldC5FUlJPUl9DT0RFX0NBTkNFTEVEYC5cbiAgICovXG4gIHN1Ym1pdChwcm9jZXNzb3I6IFByb2Nlc3Nvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIEJlY2F1c2UgdGhlIHBhdGhzIGZvciB0aGUgam9iIGlzIGl0ZXJhdGVkIHZpYSBmb3IvaW4sIGl0IGlzIGltcGVyYXRpdmVcbiAgICAvLyB0aGF0IHRoZSBwYXRocyBvYmplY3QgaXMgbm90IG1vZGlmaWVkIHdoaWxlIGl0IGlzIGJlaW5nIGl0ZXJhdGVkLlxuICAgIGNvbnN0IGpvYiA9IHtcbiAgICAgIHByb2Nlc3NvcixcbiAgICAgIHBhdGhzOiB0aGlzLl9sYXRlc3RQYXRocyB8fCB0aGlzLl9wYXRocyxcbiAgICAgIGNhbmNlbGVkOiBmYWxzZSxcbiAgICAgIHN0YXJ0VGltZTogRGF0ZS5ub3coKSxcbiAgICAgIGNodW5rQ291bnQ6IDAsXG4gICAgfTtcbiAgICB0aGlzLl9qb2JzLnB1c2goam9iKTtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5fcnVuSm9iKGpvYik7XG4gICAgLy8gJEZsb3dGaXhNZTogUmVtb3ZlIHRoZSBjYW5jZWxKb2IgZXhwYW5kbyBvZmYgdGhlIHByb21pc2UuXG4gICAgcHJvbWlzZS5jYW5jZWxKb2IgPSAoKSA9PiB7XG4gICAgICBqb2IuY2FuY2VsZWQgPSB0cnVlO1xuICAgIH07XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBfcnVuSm9iKGpvYjogUHJvY2Vzc29ySm9iKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qge3BhdGhzLCBwcm9jZXNzb3J9ID0gam9iO1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgbGV0IGNodW5rU2l6ZSA9IHRoaXMuX2luaXRpYWxDaHVua1NpemU7XG5cbiAgICBjb25zdCBkb0NsZWFudXAgPSAoZXJyOiA/RXJyb3IpID0+IHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICBgJHtlcnIgPyAnQ2FuY2VsZWQgJyA6ICcnfVByb2Nlc3NvckpvYiBmb3IgJHtwcm9jZXNzb3J9IGAgK1xuICAgICAgICAgIGBwcm9jZXNzZWQgJHtqb2IuY2h1bmtDb3VudH0gaXRlbXMgaW4gJHtEYXRlLm5vdygpIC0gam9iLnN0YXJ0VGltZX1tcy5gKTtcblxuICAgICAgLy8gTm93IHRoYXQgdGhlIFByb21pc2UgaGFzIGJlZW4gZGV0ZXJtaW5lZCwgcmVtb3ZlIHRoZSBqb2IgZnJvbSB0aGUgbGlzdC5cbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fam9icy5pbmRleE9mKGpvYik7XG4gICAgICB0aGlzLl9qb2JzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHRoZSBtb2RpZmljYXRpb24gaGlzdG9yeSB0byB0aGlzIFBhdGhTZXQsIGlmIGFwcHJvcHJpYXRlLlxuICAgICAgdGhpcy5fc3F1YXNoSGlzdG9yeSgpO1xuXG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCBnZW5lcmF0b3I7XG4gICAgICBmdW5jdGlvbiogcnVuKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggaW4gcGF0aHMpIHtcbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGVudHJ5IGZvciBgcGF0aGAgY29ycmVzcG9uZHMgdG8gYHRydWVgLCBhcyB0aGVcbiAgICAgICAgICAvLyBvcmlnaW5hbCBlbnRyeSBjb3VsZCBiZSBzaGFkb3dlZCBieSBhIG5lYXJlciBwcm9wZXJ0eSBpbiB0aGVcbiAgICAgICAgICAvLyBwcm90b3R5cGUgY2hhaW4gd2hvc2UgdmFsdWUgY29ycmVzcG9uZHMgdG8gYGZhbHNlYC5cbiAgICAgICAgICBpZiAocGF0aHNbcGF0aF0gPT09IHRydWUpIHtcbiAgICAgICAgICAgIHByb2Nlc3NvcihwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICArK2NvdW50O1xuICAgICAgICAgIGlmIChjb3VudCA9PT0gY2h1bmtTaXplKSB7XG4gICAgICAgICAgICBqb2IuY2h1bmtDb3VudCArPSBjaHVua1NpemU7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpZiAoZ2VuZXJhdG9yKSB7XG4gICAgICAgICAgICAgICAgZ2VuZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IGZpeCB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy85MTJcbiAgICAgICAgICAgIHlpZWxkIHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgLy8gVXBvbiByZXN1bWluZywgY2hlY2sgd2hldGhlciB0aGlzIGpvYiBoYXMgYmVlbiBjYW5jZWxlZC5cbiAgICAgICAgICAgIGlmIChqb2IuY2FuY2VsZWQpIHtcbiAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGBjYW5jZWxpbmcgJHtwcm9jZXNzb3J9YCk7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yOiBQYXRoU2V0RXJyb3IgPSBFcnJvcihgY2FuY2VsZWQgJHtwcm9jZXNzb3J9YCk7XG4gICAgICAgICAgICAgIGVycm9yLmVycm9yQ29kZSA9IEVSUk9SX0NPREVfQ0FOQ0VMRUQ7XG4gICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGByZXN1bWluZyAke3Byb2Nlc3Nvcn1gKTtcblxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCByZXNldCB0aGUgY291bnQgYW5kIHByb2Nlc3MgdGhlIG5leHQgY2h1bmsuXG4gICAgICAgICAgICBjb3VudCA9IDA7XG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBpdGVyYXRpb24sIHdlIGRvdWJsZSB0aGUgY2h1bmsgc2l6ZSB1bmRlciB0aGUgYXNzdW1wdGlvblxuICAgICAgICAgICAgLy8gdGhhdCB0aGUgbW9yZSBpdGVyYXRpb25zIHdlIGhhdmUgZ29uZSB0aHJvdWdoIHByb2Nlc3NpbmcgdGhpc1xuICAgICAgICAgICAgLy8gam9iLCB0aGUgbW9yZSBsaWtlbHkgaXQgaXMgdGhhdCB0aGUgdXNlciBpcyB3YWl0aW5nIG9uIHRoaXMgam9iXG4gICAgICAgICAgICAvLyBhbmQgaXMgbm90IGdvaW5nIHRvIHByZWVtcHQgaXQgd2l0aCBhbm90aGVyIGpvYi4gKEVhcmxpZXIgaW4gdGhlXG4gICAgICAgICAgICAvLyBpdGVyYXRpb24gY3ljbGUsIHRoZSB1c2VyIGlzIGxpa2VseSBzdGlsbCB0eXBpbmcsXG4gICAgICAgICAgICAvLyBjcmVhdGluZy9jYW5jZWxpbmcgam9icyByZXBlYXRlZGx5LilcbiAgICAgICAgICAgIGNodW5rU2l6ZSAqPSAyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBqb2IuY2h1bmtDb3VudCArPSBjb3VudDtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgICAgZ2VuZXJhdG9yID0gcnVuKCk7XG4gICAgICBnZW5lcmF0b3IubmV4dCgpO1xuICAgIH0pLnRoZW4oZG9DbGVhbnVwLCBkb0NsZWFudXApO1xuICB9XG5cbiAgX3NxdWFzaEhpc3RvcnkoKSB7XG4gICAgLy8gSWYgdGhlIGpvYiBsaXN0IGlzIG5vdyBlbXB0eSwgY29sbGFwc2UgdGhpcy5fbGF0ZXN0UGF0aHMsIGlmIG5vdCBudWxsIG9yIHVuZGVmaW5lZC5cbiAgICBpZiAodGhpcy5fbGF0ZXN0UGF0aHMgPT0gbnVsbCB8fCB0aGlzLl9qb2JzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNoYWluID0gZmluZFByb3RvdHlwZUNoYWluKHRoaXMuX3BhdGhzLCB0aGlzLl9sYXRlc3RQYXRocyk7XG4gICAgY2hhaW4uZm9yRWFjaChsaW5rID0+IHtcbiAgICAgIGZvciAoY29uc3QgcGF0aCBpbiBsaW5rKSB7XG4gICAgICAgIGlmIChsaW5rW3BhdGhdID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5fcGF0aHNbcGF0aF0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wYXRoc1twYXRoXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX2xhdGVzdFBhdGhzID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEdpdmVuIHR3byBvYmplY3RzIHdoZXJlIG9uZSBpcyBhIGRlc2NlbmRhbnQgb2YgdGhlIG90aGVyIGluIHRoZSBwcm90b3R5cGVcbiAqIGNoYWluLCByZXR1cm4gYW4gYXJyYXkgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgY2hhaW4gb2YgcHJvdG90eXBlIG9iamVjdHMuXG4gKlxuICogQHJldHVybiBhbiBBcnJheSBvcmRlcmVkIGJ5IFwiZGlzdGFuY2UgaW4gdGhlIHByb3RvdHlwZSBjaGFpbiBmcm9tIGFuY2VzdG9yXCJcbiAqICAgICBpbiBhc2NlbmRpbmcgb3JkZXIuIFRoZSBhbmNlc3RvciBhcmd1bWVudCB3aWxsIG5vdCBiZSBpbiB0aGUgQXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGZpbmRQcm90b3R5cGVDaGFpbihhbmNlc3RvcjogT2JqZWN0LCBkZXNjZW5kYW50OiBPYmplY3QpOiBBcnJheTxPYmplY3Q+IHtcbiAgY29uc3QgY2hhaW4gPSBbXTtcbiAgd2hpbGUgKGFuY2VzdG9yICE9PSBkZXNjZW5kYW50KSB7XG4gICAgY2hhaW4ucHVzaChkZXNjZW5kYW50KTtcbiAgICBkZXNjZW5kYW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGRlc2NlbmRhbnQpO1xuICB9XG4gIHJldHVybiBjaGFpbi5yZXZlcnNlKCk7XG59XG4iXX0=