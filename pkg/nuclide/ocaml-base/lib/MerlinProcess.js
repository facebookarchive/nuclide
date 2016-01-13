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

var getInstance = _asyncToGenerator(function* (file) {
  if (merlinProcessInstance && merlinProcessInstance.isRunning()) {
    return merlinProcessInstance;
  }

  var merlinPath = getPathToMerlin();

  if (!(yield isInstalled(merlinPath))) {
    return null;
  }

  var dotMerlinPath = yield (0, _commons.findNearestFile)('.merlin', file);

  var options = {
    cwd: dotMerlinPath ? require('path').dirname(dotMerlinPath) : '.'
  };

  logger.info('Spawning new ocamlmerlin process');
  var process = yield (0, _commons.safeSpawn)(merlinPath, [], options);
  merlinProcessInstance = new MerlinProcess(process);

  if (dotMerlinPath) {
    // TODO(pieter) add support for multiple .dotmerlin files
    yield merlinProcessInstance.pushDotMerlinPath(dotMerlinPath);
    logger.debug('Added .merlin path: ' + dotMerlinPath);
  }

  return merlinProcessInstance;
}

/**
 * @return The path to ocamlmerlin on the user's machine. It is recommended not to cache the result
 *   of this function in case the user updates his or her preferences in Atom, in which case the
 *   return value will be stale.
 */
);

exports.getInstance = getInstance;

var isInstalled = _asyncToGenerator(function* (merlinPath) {
  if (isInstalledCache == null) {
    var result = yield (0, _commons.checkOutput)('which', [merlinPath]);
    isInstalledCache = result.exitCode === 0;
    if (!isInstalledCache) {
      logger.info('ocamlmerlin not installed');
    }
  }
  return isInstalledCache;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _commons = require('../../commons');

var logger = require('../../logging').getLogger();

var ERROR_RESPONSES = new Set(['failure', 'error', 'exception']);

/**
 * Wraps an ocamlmerlin process; provides api access to
 * ocamlmerlin's json-over-stdin/stdout protocol.
 *
 * This is based on the protocol description at:
 *   https://github.com/the-lambda-church/merlin/blob/master/PROTOCOL.md
 *   https://github.com/the-lambda-church/merlin/tree/master/src/frontend
 */

var MerlinProcess = (function () {
  function MerlinProcess(proc) {
    var _this = this;

    _classCallCheck(this, MerlinProcess);

    this._proc = proc;
    this._promiseQueue = new _commons.PromiseQueue();
    this._running = true;
    this._proc.on('exit', function (code, signal) {
      _this._running = false;
    });
  }

  _createClass(MerlinProcess, [{
    key: 'isRunning',
    value: function isRunning() {
      return this._running;
    }

    /**
     * Tell merlin where to find its per-repo .merlin config file.
     *
     * Configuration file format description:
     *   https://github.com/the-lambda-church/merlin/wiki/project-configuration
     *
     * @return a dummy cursor position on success
     */
  }, {
    key: 'pushDotMerlinPath',
    value: _asyncToGenerator(function* (path) {
      var _this2 = this;

      return yield this._promiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
        var result = yield _this2.runSingleCommand(['reset', 'dot_merlin', [path], 'auto']);
        resolve(result);
      }));
    })

    /**
     * Set the buffer content to query against. Merlin uses an internal
     * buffer (name + content) that is independent from file content on
     * disk.
     *
     * @return on success: a cursor position pointed at the end of the buffer
     */
  }, {
    key: 'pushNewBuffer',
    value: _asyncToGenerator(function* (name, content) {
      var _this3 = this;

      return yield this._promiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
        yield _this3.runSingleCommand(['reset', 'auto', // one of {ml, mli, auto}
        name]);

        var result = yield _this3.runSingleCommand(['tell', 'source', content]);
        resolve(result);
      }));
    })

    /**
     * Find definition
     *
     * `kind` is one of 'ml' or 'mli'
     *
     * Note: ocamlmerlin line numbers are 1-based.
     * @return null if nothing was found; a position of the form
     *   {"file": "somepath", "pos": {"line": 41, "col": 5}}.
     */
  }, {
    key: 'locate',
    value: _asyncToGenerator(function* (path, line, col, kind) {
      var _this4 = this;

      return yield this._promiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
        var location = yield _this4.runSingleCommand(['locate',
        /* identifier name */'', kind, 'at', { line: line + 1, col: col }]);

        if (typeof location === 'string') {
          return reject(Error(location));
        }

        // Ocamlmerlin doesn't include a `file` field at all if the destination is
        // in the same file.
        if (!location.file) {
          location.file = path;
        }

        resolve(location);
      }));
    })
  }, {
    key: 'complete',
    value: _asyncToGenerator(function* (path, line, col, prefix) {
      var _this5 = this;

      return yield this._promiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
        var result = yield _this5.runSingleCommand(['complete', 'prefix', prefix, 'at', { line: line + 1, col: col + 1 }]);

        resolve(result);
      }));
    })

    /**
     * Run a command; parse the json output, return an object. This assumes
     * that merlin's protocol is line-based (results are json objects rendered
     * on a single line).
     */
  }, {
    key: 'runSingleCommand',
    value: function runSingleCommand(command) {
      var commandString = JSON.stringify(command);
      var stdin = this._proc.stdin;
      var stdout = this._proc.stdout;

      return new Promise(function (resolve, reject) {
        var _require = require('readline');

        var createInterface = _require.createInterface;

        var reader = createInterface({
          input: stdout,
          terminal: false
        });

        reader.on('line', function (line) {
          reader.close();
          var response = undefined;
          try {
            response = JSON.parse(line);
          } catch (err) {
            response = null;
          }
          if (!response || !Array.isArray(response) || response.length !== 2) {
            logger.error('Unexpected response from ocamlmerlin: ${line}');
            reject(Error('Unexpected ocamlmerlin output format'));
            return;
          }

          var status = response[0];
          var content = response[1];

          if (ERROR_RESPONSES.has(status)) {
            logger.error('Ocamlmerlin raised an error: ' + line);
            reject(Error('Ocamlmerlin returned an error'));
            return;
          }

          resolve(content);
        });

        stdin.write(commandString);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._proc.kill();
    }
  }]);

  return MerlinProcess;
})();

exports.MerlinProcess = MerlinProcess;

var merlinProcessInstance = undefined;

function getPathToMerlin() {
  // $UPFixMe: This should use nuclide-features-config
  return global.atom && global.atom.config.get('nuclide-ocaml.pathToMerlin') || 'ocamlmerlin';
}

var isInstalledCache = null;
//# sourceMappingURL=data:application/json;base64,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LElBQUksYUFBYSxDQUFDO0NBQzdGOztBQUVELElBQUksZ0JBQTBCLEdBQUcsSUFBSSxDQUFDIiwiZmlsZSI6Ik1lcmxpblByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7XG4gIGNoZWNrT3V0cHV0LFxuICBmaW5kTmVhcmVzdEZpbGUsXG4gIHNhZmVTcGF3bixcbiAgUHJvbWlzZVF1ZXVlLFxufSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuXG5jb25zdCBFUlJPUl9SRVNQT05TRVMgPSBuZXcgU2V0KFtcbiAgJ2ZhaWx1cmUnLFxuICAnZXJyb3InLFxuICAnZXhjZXB0aW9uJyxcbl0pO1xuXG4vKipcbiAqIFdyYXBzIGFuIG9jYW1sbWVybGluIHByb2Nlc3M7IHByb3ZpZGVzIGFwaSBhY2Nlc3MgdG9cbiAqIG9jYW1sbWVybGluJ3MganNvbi1vdmVyLXN0ZGluL3N0ZG91dCBwcm90b2NvbC5cbiAqXG4gKiBUaGlzIGlzIGJhc2VkIG9uIHRoZSBwcm90b2NvbCBkZXNjcmlwdGlvbiBhdDpcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL3RoZS1sYW1iZGEtY2h1cmNoL21lcmxpbi9ibG9iL21hc3Rlci9QUk9UT0NPTC5tZFxuICogICBodHRwczovL2dpdGh1Yi5jb20vdGhlLWxhbWJkYS1jaHVyY2gvbWVybGluL3RyZWUvbWFzdGVyL3NyYy9mcm9udGVuZFxuICovXG5leHBvcnQgY2xhc3MgTWVybGluUHJvY2VzcyB7XG4gIF9wcm9jOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcztcbiAgX3Byb21pc2VRdWV1ZTogUHJvbWlzZVF1ZXVlO1xuICBfcnVubmluZzogYm9vbDtcblxuICBjb25zdHJ1Y3Rvcihwcm9jOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xuICAgIHRoaXMuX3Byb2MgPSBwcm9jO1xuICAgIHRoaXMuX3Byb21pc2VRdWV1ZSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgICB0aGlzLl9ydW5uaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl9wcm9jLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4geyB0aGlzLl9ydW5uaW5nID0gZmFsc2U7IH0pO1xuICB9XG5cbiAgaXNSdW5uaW5nKCk6IGJvb2wge1xuICAgIHJldHVybiB0aGlzLl9ydW5uaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlbGwgbWVybGluIHdoZXJlIHRvIGZpbmQgaXRzIHBlci1yZXBvIC5tZXJsaW4gY29uZmlnIGZpbGUuXG4gICAqXG4gICAqIENvbmZpZ3VyYXRpb24gZmlsZSBmb3JtYXQgZGVzY3JpcHRpb246XG4gICAqICAgaHR0cHM6Ly9naXRodWIuY29tL3RoZS1sYW1iZGEtY2h1cmNoL21lcmxpbi93aWtpL3Byb2plY3QtY29uZmlndXJhdGlvblxuICAgKlxuICAgKiBAcmV0dXJuIGEgZHVtbXkgY3Vyc29yIHBvc2l0aW9uIG9uIHN1Y2Nlc3NcbiAgICovXG4gIGFzeW5jIHB1c2hEb3RNZXJsaW5QYXRoKHBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPG1peGVkPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Byb21pc2VRdWV1ZS5zdWJtaXQoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ydW5TaW5nbGVDb21tYW5kKFtcbiAgICAgICAgJ3Jlc2V0JyxcbiAgICAgICAgJ2RvdF9tZXJsaW4nLFxuICAgICAgICBbcGF0aF0sXG4gICAgICAgICdhdXRvJyxcbiAgICAgIF0pO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgYnVmZmVyIGNvbnRlbnQgdG8gcXVlcnkgYWdhaW5zdC4gTWVybGluIHVzZXMgYW4gaW50ZXJuYWxcbiAgICogYnVmZmVyIChuYW1lICsgY29udGVudCkgdGhhdCBpcyBpbmRlcGVuZGVudCBmcm9tIGZpbGUgY29udGVudCBvblxuICAgKiBkaXNrLlxuICAgKlxuICAgKiBAcmV0dXJuIG9uIHN1Y2Nlc3M6IGEgY3Vyc29yIHBvc2l0aW9uIHBvaW50ZWQgYXQgdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gICAqL1xuICBhc3luYyBwdXNoTmV3QnVmZmVyKG5hbWU6IE51Y2xpZGVVcmksIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcHJvbWlzZVF1ZXVlLnN1Ym1pdChhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAncmVzZXQnLFxuICAgICAgICAnYXV0bycsIC8vIG9uZSBvZiB7bWwsIG1saSwgYXV0b31cbiAgICAgICAgbmFtZSxcbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAndGVsbCcsXG4gICAgICAgICdzb3VyY2UnLFxuICAgICAgICBjb250ZW50LFxuICAgICAgXSk7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBkZWZpbml0aW9uXG4gICAqXG4gICAqIGBraW5kYCBpcyBvbmUgb2YgJ21sJyBvciAnbWxpJ1xuICAgKlxuICAgKiBOb3RlOiBvY2FtbG1lcmxpbiBsaW5lIG51bWJlcnMgYXJlIDEtYmFzZWQuXG4gICAqIEByZXR1cm4gbnVsbCBpZiBub3RoaW5nIHdhcyBmb3VuZDsgYSBwb3NpdGlvbiBvZiB0aGUgZm9ybVxuICAgKiAgIHtcImZpbGVcIjogXCJzb21lcGF0aFwiLCBcInBvc1wiOiB7XCJsaW5lXCI6IDQxLCBcImNvbFwiOiA1fX0uXG4gICAqL1xuICBhc3luYyBsb2NhdGUoXG4gICAgcGF0aDogTnVjbGlkZVVyaSxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sOiBudW1iZXIsXG4gICAga2luZDogc3RyaW5nLFxuICApOiBQcm9taXNlPD97ZmlsZTogc3RyaW5nLCBwb3M6IHtsaW5lOiBudW1iZXIsIGNvbDogbnVtYmVyfX0+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcHJvbWlzZVF1ZXVlLnN1Ym1pdChhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBsb2NhdGlvbiA9IGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbXG4gICAgICAgICdsb2NhdGUnLFxuICAgICAgICAvKiBpZGVudGlmaWVyIG5hbWUgKi8gJycsXG4gICAgICAgIGtpbmQsXG4gICAgICAgICdhdCcsXG4gICAgICAgIHtsaW5lOiBsaW5lICsgMSwgY29sfSxcbiAgICAgIF0pO1xuXG5cbiAgICAgIGlmICh0eXBlb2YgbG9jYXRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiByZWplY3QoRXJyb3IobG9jYXRpb24pKTtcbiAgICAgIH1cblxuICAgICAgLy8gT2NhbWxtZXJsaW4gZG9lc24ndCBpbmNsdWRlIGEgYGZpbGVgIGZpZWxkIGF0IGFsbCBpZiB0aGUgZGVzdGluYXRpb24gaXNcbiAgICAgIC8vIGluIHRoZSBzYW1lIGZpbGUuXG4gICAgICBpZiAoIWxvY2F0aW9uLmZpbGUpIHtcbiAgICAgICAgbG9jYXRpb24uZmlsZSA9IHBhdGg7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUobG9jYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgY29tcGxldGUocGF0aDogTnVjbGlkZVVyaSwgbGluZTogbnVtYmVyLCBjb2w6IG51bWJlciwgcHJlZml4OiBzdHJpbmcpOiBQcm9taXNlPG1peGVkPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Byb21pc2VRdWV1ZS5zdWJtaXQoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ydW5TaW5nbGVDb21tYW5kKFtcbiAgICAgICAgJ2NvbXBsZXRlJyxcbiAgICAgICAgJ3ByZWZpeCcsXG4gICAgICAgIHByZWZpeCxcbiAgICAgICAgJ2F0JyxcbiAgICAgICAge2xpbmU6IGxpbmUgKyAxLCBjb2w6IGNvbCArIDF9LFxuICAgICAgXSk7XG5cbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJ1biBhIGNvbW1hbmQ7IHBhcnNlIHRoZSBqc29uIG91dHB1dCwgcmV0dXJuIGFuIG9iamVjdC4gVGhpcyBhc3N1bWVzXG4gICAqIHRoYXQgbWVybGluJ3MgcHJvdG9jb2wgaXMgbGluZS1iYXNlZCAocmVzdWx0cyBhcmUganNvbiBvYmplY3RzIHJlbmRlcmVkXG4gICAqIG9uIGEgc2luZ2xlIGxpbmUpLlxuICAgKi9cbiAgcnVuU2luZ2xlQ29tbWFuZChjb21tYW5kOiBtaXhlZCk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgY29uc3QgY29tbWFuZFN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGNvbW1hbmQpO1xuICAgIGNvbnN0IHN0ZGluID0gdGhpcy5fcHJvYy5zdGRpbjtcbiAgICBjb25zdCBzdGRvdXQgPSB0aGlzLl9wcm9jLnN0ZG91dDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB7Y3JlYXRlSW50ZXJmYWNlfSA9IHJlcXVpcmUoJ3JlYWRsaW5lJyk7XG4gICAgICBjb25zdCByZWFkZXIgPSBjcmVhdGVJbnRlcmZhY2Uoe1xuICAgICAgICBpbnB1dDogc3Rkb3V0LFxuICAgICAgICB0ZXJtaW5hbDogZmFsc2UsXG4gICAgICB9KTtcblxuICAgICAgcmVhZGVyLm9uKCdsaW5lJywgKGxpbmUpID0+IHtcbiAgICAgICAgcmVhZGVyLmNsb3NlKCk7XG4gICAgICAgIGxldCByZXNwb25zZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UobGluZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFBcnJheS5pc0FycmF5KHJlc3BvbnNlKSB8fCByZXNwb25zZS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1VuZXhwZWN0ZWQgcmVzcG9uc2UgZnJvbSBvY2FtbG1lcmxpbjogJHtsaW5lfScpO1xuICAgICAgICAgIHJlamVjdChFcnJvcignVW5leHBlY3RlZCBvY2FtbG1lcmxpbiBvdXRwdXQgZm9ybWF0JykpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IHJlc3BvbnNlWzBdO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gcmVzcG9uc2VbMV07XG5cbiAgICAgICAgaWYgKEVSUk9SX1JFU1BPTlNFUy5oYXMoc3RhdHVzKSkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignT2NhbWxtZXJsaW4gcmFpc2VkIGFuIGVycm9yOiAnICsgbGluZSk7XG4gICAgICAgICAgcmVqZWN0KEVycm9yKCdPY2FtbG1lcmxpbiByZXR1cm5lZCBhbiBlcnJvcicpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKGNvbnRlbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIHN0ZGluLndyaXRlKGNvbW1hbmRTdHJpbmcpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9wcm9jLmtpbGwoKTtcbiAgfVxufVxuXG5sZXQgbWVybGluUHJvY2Vzc0luc3RhbmNlOiA/TWVybGluUHJvY2VzcztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEluc3RhbmNlKGZpbGU6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9NZXJsaW5Qcm9jZXNzPiB7XG4gIGlmIChtZXJsaW5Qcm9jZXNzSW5zdGFuY2UgJiYgbWVybGluUHJvY2Vzc0luc3RhbmNlLmlzUnVubmluZygpKSB7XG4gICAgcmV0dXJuIG1lcmxpblByb2Nlc3NJbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0IG1lcmxpblBhdGggPSBnZXRQYXRoVG9NZXJsaW4oKTtcblxuICBpZiAoIWF3YWl0IGlzSW5zdGFsbGVkKG1lcmxpblBhdGgpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBkb3RNZXJsaW5QYXRoID0gYXdhaXQgZmluZE5lYXJlc3RGaWxlKCcubWVybGluJywgZmlsZSk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBjd2Q6IChkb3RNZXJsaW5QYXRoID8gcmVxdWlyZSgncGF0aCcpLmRpcm5hbWUoZG90TWVybGluUGF0aCkgOiAnLicpLFxuICB9O1xuXG4gIGxvZ2dlci5pbmZvKCdTcGF3bmluZyBuZXcgb2NhbWxtZXJsaW4gcHJvY2VzcycpO1xuICBjb25zdCBwcm9jZXNzID0gYXdhaXQgc2FmZVNwYXduKG1lcmxpblBhdGgsIFtdLCBvcHRpb25zKTtcbiAgbWVybGluUHJvY2Vzc0luc3RhbmNlID0gbmV3IE1lcmxpblByb2Nlc3MocHJvY2Vzcyk7XG5cbiAgaWYgKGRvdE1lcmxpblBhdGgpIHtcbiAgICAvLyBUT0RPKHBpZXRlcikgYWRkIHN1cHBvcnQgZm9yIG11bHRpcGxlIC5kb3RtZXJsaW4gZmlsZXNcbiAgICBhd2FpdCBtZXJsaW5Qcm9jZXNzSW5zdGFuY2UucHVzaERvdE1lcmxpblBhdGgoZG90TWVybGluUGF0aCk7XG4gICAgbG9nZ2VyLmRlYnVnKCdBZGRlZCAubWVybGluIHBhdGg6ICcgKyBkb3RNZXJsaW5QYXRoKTtcbiAgfVxuXG4gIHJldHVybiBtZXJsaW5Qcm9jZXNzSW5zdGFuY2U7XG59XG5cbi8qKlxuICogQHJldHVybiBUaGUgcGF0aCB0byBvY2FtbG1lcmxpbiBvbiB0aGUgdXNlcidzIG1hY2hpbmUuIEl0IGlzIHJlY29tbWVuZGVkIG5vdCB0byBjYWNoZSB0aGUgcmVzdWx0XG4gKiAgIG9mIHRoaXMgZnVuY3Rpb24gaW4gY2FzZSB0aGUgdXNlciB1cGRhdGVzIGhpcyBvciBoZXIgcHJlZmVyZW5jZXMgaW4gQXRvbSwgaW4gd2hpY2ggY2FzZSB0aGVcbiAqICAgcmV0dXJuIHZhbHVlIHdpbGwgYmUgc3RhbGUuXG4gKi9cbmZ1bmN0aW9uIGdldFBhdGhUb01lcmxpbigpOiBzdHJpbmcge1xuICAvLyAkVVBGaXhNZTogVGhpcyBzaG91bGQgdXNlIG51Y2xpZGUtZmVhdHVyZXMtY29uZmlnXG4gIHJldHVybiBnbG9iYWwuYXRvbSAmJiBnbG9iYWwuYXRvbS5jb25maWcuZ2V0KCdudWNsaWRlLW9jYW1sLnBhdGhUb01lcmxpbicpIHx8ICdvY2FtbG1lcmxpbic7XG59XG5cbmxldCBpc0luc3RhbGxlZENhY2hlOiA/Ym9vbGVhbiA9IG51bGw7XG5hc3luYyBmdW5jdGlvbiBpc0luc3RhbGxlZChtZXJsaW5QYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgaWYgKGlzSW5zdGFsbGVkQ2FjaGUgPT0gbnVsbCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNoZWNrT3V0cHV0KCd3aGljaCcsIFttZXJsaW5QYXRoXSk7XG4gICAgaXNJbnN0YWxsZWRDYWNoZSA9IHJlc3VsdC5leGl0Q29kZSA9PT0gMDtcbiAgICBpZiAoIWlzSW5zdGFsbGVkQ2FjaGUpIHtcbiAgICAgIGxvZ2dlci5pbmZvKCdvY2FtbG1lcmxpbiBub3QgaW5zdGFsbGVkJyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpc0luc3RhbGxlZENhY2hlO1xufVxuIl19