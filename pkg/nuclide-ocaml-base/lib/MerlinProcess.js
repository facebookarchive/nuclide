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
  var flags = getMerlinFlags();

  if (!(yield isInstalled(merlinPath))) {
    return null;
  }

  var dotMerlinPath = yield _nuclideCommons.fsPromise.findNearestFile('.merlin', file);

  var options = {
    cwd: dotMerlinPath ? _path2['default'].dirname(dotMerlinPath) : '.'
  };

  logger.info('Spawning new ocamlmerlin process');
  var process = yield (0, _nuclideCommons.safeSpawn)(merlinPath, flags, options);
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
    var result = yield (0, _nuclideCommons.checkOutput)('which', [merlinPath]);
    isInstalledCache = result.exitCode === 0;
    if (!isInstalledCache) {
      logger.info('ocamlmerlin not installed');
    }
  }
  return isInstalledCache;
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _nuclideCommons = require('../../nuclide-commons');

var logger = require('../../nuclide-logging').getLogger();

var ERROR_RESPONSES = new Set(['failure', 'error', 'exception']);

/**
 * Wraps an ocamlmerlin process; provides api access to
 * ocamlmerlin's json-over-stdin/stdout protocol.
 *
 * This is based on the protocol description at:
 *   https://github.com/the-lambda-church/merlin/blob/master/doc/dev/PROTOCOL.md
 *   https://github.com/the-lambda-church/merlin/tree/master/src/frontend
 */

var MerlinProcess = (function () {
  function MerlinProcess(proc) {
    var _this = this;

    _classCallCheck(this, MerlinProcess);

    this._proc = proc;
    this._promiseQueue = new _nuclideCommons.PromiseQueue();
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
    value: _asyncToGenerator(function* (file) {
      var _this2 = this;

      return yield this._promiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
        var result = yield _this2.runSingleCommand(['reset', 'dot_merlin', [file], 'auto']);
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

        // Clear the buffer.
        yield _this3.runSingleCommand(['seek', 'exact', { line: 1, col: 0 }]);
        yield _this3.runSingleCommand(['drop']);

        var result = yield _this3.runSingleCommand(['tell', 'source-eof', content]);
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
    value: _asyncToGenerator(function* (file, line, col, kind) {
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
          location.file = file;
        }

        resolve(location);
      }));
    })
  }, {
    key: 'enclosingType',
    value: _asyncToGenerator(function* (file, line, col) {
      var _this5 = this;

      return yield this._promiseQueue.submit(function (resolve, reject) {
        _this5.runSingleCommand(['type', 'enclosing', 'at', { line: line + 1, col: col }]).then(resolve)['catch'](reject);
      });
    })
  }, {
    key: 'complete',
    value: _asyncToGenerator(function* (file, line, col, prefix) {
      var _this6 = this;

      return yield this._promiseQueue.submit(function (resolve, reject) {
        _this6.runSingleCommand(['complete', 'prefix', prefix, 'at', { line: line + 1, col: col + 1 }]).then(resolve)['catch'](reject);
      });
    })
  }, {
    key: 'errors',
    value: _asyncToGenerator(function* () {
      var _this7 = this;

      return yield this._promiseQueue.submit(function (resolve, reject) {
        _this7.runSingleCommand(['errors']).then(resolve)['catch'](reject);
      });
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
        var reader = _readline2['default'].createInterface({
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
  return global.atom && global.atom.config.get('nuclide.nuclide-ocaml.pathToMerlin') || 'ocamlmerlin';
}

/**
 * @return The set of arguments to pass to ocamlmerlin.
 */
function getMerlinFlags() {
  var configVal = global.atom && global.atom.config.get('nuclide.nuclide-ocaml.merlinFlags');
  // To split while stripping out any leading/trailing space, we match on all
  // *non*-whitespace.
  var configItems = configVal && configVal.match(/\S+/g);
  return configItems || [];
}

var isInstalledCache = null;
//# sourceMappingURL=data:application/json;base64,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QU0sQ0FBQyxDQUFDO0FBQ3pELFNBQU8sV0FBVyxJQUFJLEVBQUUsQ0FBQztDQUMxQjs7QUFFRCxJQUFJLGdCQUEwQixHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJNZXJsaW5Qcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7TWVybGluRXJyb3IsIE1lcmxpblR5cGV9IGZyb20gJy4uJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVhZGxpbmUgZnJvbSAncmVhZGxpbmUnO1xuXG5pbXBvcnQge1xuICBjaGVja091dHB1dCxcbiAgZnNQcm9taXNlLFxuICBzYWZlU3Bhd24sXG4gIFByb21pc2VRdWV1ZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IEVSUk9SX1JFU1BPTlNFUyA9IG5ldyBTZXQoW1xuICAnZmFpbHVyZScsXG4gICdlcnJvcicsXG4gICdleGNlcHRpb24nLFxuXSk7XG5cbi8qKlxuICogV3JhcHMgYW4gb2NhbWxtZXJsaW4gcHJvY2VzczsgcHJvdmlkZXMgYXBpIGFjY2VzcyB0b1xuICogb2NhbWxtZXJsaW4ncyBqc29uLW92ZXItc3RkaW4vc3Rkb3V0IHByb3RvY29sLlxuICpcbiAqIFRoaXMgaXMgYmFzZWQgb24gdGhlIHByb3RvY29sIGRlc2NyaXB0aW9uIGF0OlxuICogICBodHRwczovL2dpdGh1Yi5jb20vdGhlLWxhbWJkYS1jaHVyY2gvbWVybGluL2Jsb2IvbWFzdGVyL2RvYy9kZXYvUFJPVE9DT0wubWRcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL3RoZS1sYW1iZGEtY2h1cmNoL21lcmxpbi90cmVlL21hc3Rlci9zcmMvZnJvbnRlbmRcbiAqL1xuZXhwb3J0IGNsYXNzIE1lcmxpblByb2Nlc3Mge1xuICBfcHJvYzogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIF9wcm9taXNlUXVldWU6IFByb21pc2VRdWV1ZTtcbiAgX3J1bm5pbmc6IGJvb2w7XG5cbiAgY29uc3RydWN0b3IocHJvYzogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MpIHtcbiAgICB0aGlzLl9wcm9jID0gcHJvYztcbiAgICB0aGlzLl9wcm9taXNlUXVldWUgPSBuZXcgUHJvbWlzZVF1ZXVlKCk7XG4gICAgdGhpcy5fcnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5fcHJvYy5vbignZXhpdCcsIChjb2RlLCBzaWduYWwpID0+IHsgdGhpcy5fcnVubmluZyA9IGZhbHNlOyB9KTtcbiAgfVxuXG4gIGlzUnVubmluZygpOiBib29sIHtcbiAgICByZXR1cm4gdGhpcy5fcnVubmluZztcbiAgfVxuXG4gIC8qKlxuICAgKiBUZWxsIG1lcmxpbiB3aGVyZSB0byBmaW5kIGl0cyBwZXItcmVwbyAubWVybGluIGNvbmZpZyBmaWxlLlxuICAgKlxuICAgKiBDb25maWd1cmF0aW9uIGZpbGUgZm9ybWF0IGRlc2NyaXB0aW9uOlxuICAgKiAgIGh0dHBzOi8vZ2l0aHViLmNvbS90aGUtbGFtYmRhLWNodXJjaC9tZXJsaW4vd2lraS9wcm9qZWN0LWNvbmZpZ3VyYXRpb25cbiAgICpcbiAgICogQHJldHVybiBhIGR1bW15IGN1cnNvciBwb3NpdGlvbiBvbiBzdWNjZXNzXG4gICAqL1xuICBhc3luYyBwdXNoRG90TWVybGluUGF0aChmaWxlOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxtaXhlZD4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9wcm9taXNlUXVldWUuc3VibWl0KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbXG4gICAgICAgICdyZXNldCcsXG4gICAgICAgICdkb3RfbWVybGluJyxcbiAgICAgICAgW2ZpbGVdLFxuICAgICAgICAnYXV0bycsXG4gICAgICBdKTtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGJ1ZmZlciBjb250ZW50IHRvIHF1ZXJ5IGFnYWluc3QuIE1lcmxpbiB1c2VzIGFuIGludGVybmFsXG4gICAqIGJ1ZmZlciAobmFtZSArIGNvbnRlbnQpIHRoYXQgaXMgaW5kZXBlbmRlbnQgZnJvbSBmaWxlIGNvbnRlbnQgb25cbiAgICogZGlzay5cbiAgICpcbiAgICogQHJldHVybiBvbiBzdWNjZXNzOiBhIGN1cnNvciBwb3NpdGlvbiBwb2ludGVkIGF0IHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICAgKi9cbiAgYXN5bmMgcHVzaE5ld0J1ZmZlcihuYW1lOiBOdWNsaWRlVXJpLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPG1peGVkPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Byb21pc2VRdWV1ZS5zdWJtaXQoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5ydW5TaW5nbGVDb21tYW5kKFtcbiAgICAgICAgJ3Jlc2V0JyxcbiAgICAgICAgJ2F1dG8nLCAvLyBvbmUgb2Yge21sLCBtbGksIGF1dG99XG4gICAgICAgIG5hbWUsXG4gICAgICBdKTtcblxuICAgICAgLy8gQ2xlYXIgdGhlIGJ1ZmZlci5cbiAgICAgIGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbXG4gICAgICAgICdzZWVrJyxcbiAgICAgICAgJ2V4YWN0JyxcbiAgICAgICAge2xpbmU6IDEsIGNvbDogMH0sXG4gICAgICBdKTtcbiAgICAgIGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbJ2Ryb3AnXSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbXG4gICAgICAgICd0ZWxsJyxcbiAgICAgICAgJ3NvdXJjZS1lb2YnLFxuICAgICAgICBjb250ZW50LFxuICAgICAgXSk7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBkZWZpbml0aW9uXG4gICAqXG4gICAqIGBraW5kYCBpcyBvbmUgb2YgJ21sJyBvciAnbWxpJ1xuICAgKlxuICAgKiBOb3RlOiBvY2FtbG1lcmxpbiBsaW5lIG51bWJlcnMgYXJlIDEtYmFzZWQuXG4gICAqIEByZXR1cm4gbnVsbCBpZiBub3RoaW5nIHdhcyBmb3VuZDsgYSBwb3NpdGlvbiBvZiB0aGUgZm9ybVxuICAgKiAgIHtcImZpbGVcIjogXCJzb21lcGF0aFwiLCBcInBvc1wiOiB7XCJsaW5lXCI6IDQxLCBcImNvbFwiOiA1fX0uXG4gICAqL1xuICBhc3luYyBsb2NhdGUoXG4gICAgZmlsZTogTnVjbGlkZVVyaSxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sOiBudW1iZXIsXG4gICAga2luZDogc3RyaW5nLFxuICApOiBQcm9taXNlPD97ZmlsZTogc3RyaW5nOyBwb3M6IHtsaW5lOiBudW1iZXI7IGNvbDogbnVtYmVyfX0+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcHJvbWlzZVF1ZXVlLnN1Ym1pdChhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBsb2NhdGlvbiA9IGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbXG4gICAgICAgICdsb2NhdGUnLFxuICAgICAgICAvKiBpZGVudGlmaWVyIG5hbWUgKi8gJycsXG4gICAgICAgIGtpbmQsXG4gICAgICAgICdhdCcsXG4gICAgICAgIHtsaW5lOiBsaW5lICsgMSwgY29sfSxcbiAgICAgIF0pO1xuXG5cbiAgICAgIGlmICh0eXBlb2YgbG9jYXRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiByZWplY3QoRXJyb3IobG9jYXRpb24pKTtcbiAgICAgIH1cblxuICAgICAgLy8gT2NhbWxtZXJsaW4gZG9lc24ndCBpbmNsdWRlIGEgYGZpbGVgIGZpZWxkIGF0IGFsbCBpZiB0aGUgZGVzdGluYXRpb24gaXNcbiAgICAgIC8vIGluIHRoZSBzYW1lIGZpbGUuXG4gICAgICBpZiAoIWxvY2F0aW9uLmZpbGUpIHtcbiAgICAgICAgbG9jYXRpb24uZmlsZSA9IGZpbGU7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUobG9jYXRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZW5jbG9zaW5nVHlwZShcbiAgICBmaWxlOiBOdWNsaWRlVXJpLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2w6IG51bWJlcixcbiAgKTogUHJvbWlzZTxBcnJheTxNZXJsaW5UeXBlPj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9wcm9taXNlUXVldWUuc3VibWl0KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMucnVuU2luZ2xlQ29tbWFuZChbJ3R5cGUnLCAnZW5jbG9zaW5nJywgJ2F0Jywge2xpbmU6IGxpbmUgKyAxLCBjb2x9XSlcbiAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgLmNhdGNoKHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBjb21wbGV0ZShmaWxlOiBOdWNsaWRlVXJpLCBsaW5lOiBudW1iZXIsIGNvbDogbnVtYmVyLCBwcmVmaXg6IHN0cmluZyk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcHJvbWlzZVF1ZXVlLnN1Ym1pdCgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAnY29tcGxldGUnLFxuICAgICAgICAncHJlZml4JyxcbiAgICAgICAgcHJlZml4LFxuICAgICAgICAnYXQnLFxuICAgICAgICB7bGluZTogbGluZSArIDEsIGNvbDogY29sICsgMX0sXG4gICAgICBdKS50aGVuKHJlc29sdmUpXG4gICAgICAgIC5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZXJyb3JzKCk6IFByb21pc2U8QXJyYXk8TWVybGluRXJyb3I+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Byb21pc2VRdWV1ZS5zdWJtaXQoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5ydW5TaW5nbGVDb21tYW5kKFsnZXJyb3JzJ10pXG4gICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgIC5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biBhIGNvbW1hbmQ7IHBhcnNlIHRoZSBqc29uIG91dHB1dCwgcmV0dXJuIGFuIG9iamVjdC4gVGhpcyBhc3N1bWVzXG4gICAqIHRoYXQgbWVybGluJ3MgcHJvdG9jb2wgaXMgbGluZS1iYXNlZCAocmVzdWx0cyBhcmUganNvbiBvYmplY3RzIHJlbmRlcmVkXG4gICAqIG9uIGEgc2luZ2xlIGxpbmUpLlxuICAgKi9cbiAgcnVuU2luZ2xlQ29tbWFuZChjb21tYW5kOiBtaXhlZCk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgY29uc3QgY29tbWFuZFN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGNvbW1hbmQpO1xuICAgIGNvbnN0IHN0ZGluID0gdGhpcy5fcHJvYy5zdGRpbjtcbiAgICBjb25zdCBzdGRvdXQgPSB0aGlzLl9wcm9jLnN0ZG91dDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByZWFkZXIgPSByZWFkbGluZS5jcmVhdGVJbnRlcmZhY2Uoe1xuICAgICAgICBpbnB1dDogc3Rkb3V0LFxuICAgICAgICB0ZXJtaW5hbDogZmFsc2UsXG4gICAgICB9KTtcblxuICAgICAgcmVhZGVyLm9uKCdsaW5lJywgbGluZSA9PiB7XG4gICAgICAgIHJlYWRlci5jbG9zZSgpO1xuICAgICAgICBsZXQgcmVzcG9uc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGxpbmUpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICByZXNwb25zZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXNwb25zZSB8fCAhQXJyYXkuaXNBcnJheShyZXNwb25zZSkgfHwgcmVzcG9uc2UubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdVbmV4cGVjdGVkIHJlc3BvbnNlIGZyb20gb2NhbWxtZXJsaW46ICR7bGluZX0nKTtcbiAgICAgICAgICByZWplY3QoRXJyb3IoJ1VuZXhwZWN0ZWQgb2NhbWxtZXJsaW4gb3V0cHV0IGZvcm1hdCcpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdGF0dXMgPSByZXNwb25zZVswXTtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHJlc3BvbnNlWzFdO1xuXG4gICAgICAgIGlmIChFUlJPUl9SRVNQT05TRVMuaGFzKHN0YXR1cykpIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ09jYW1sbWVybGluIHJhaXNlZCBhbiBlcnJvcjogJyArIGxpbmUpO1xuICAgICAgICAgIHJlamVjdChFcnJvcignT2NhbWxtZXJsaW4gcmV0dXJuZWQgYW4gZXJyb3InKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZShjb250ZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICBzdGRpbi53cml0ZShjb21tYW5kU3RyaW5nKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcHJvYy5raWxsKCk7XG4gIH1cbn1cblxubGV0IG1lcmxpblByb2Nlc3NJbnN0YW5jZTogP01lcmxpblByb2Nlc3M7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRJbnN0YW5jZShmaWxlOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/TWVybGluUHJvY2Vzcz4ge1xuICBpZiAobWVybGluUHJvY2Vzc0luc3RhbmNlICYmIG1lcmxpblByb2Nlc3NJbnN0YW5jZS5pc1J1bm5pbmcoKSkge1xuICAgIHJldHVybiBtZXJsaW5Qcm9jZXNzSW5zdGFuY2U7XG4gIH1cblxuICBjb25zdCBtZXJsaW5QYXRoID0gZ2V0UGF0aFRvTWVybGluKCk7XG4gIGNvbnN0IGZsYWdzID0gZ2V0TWVybGluRmxhZ3MoKTtcblxuICBpZiAoIWF3YWl0IGlzSW5zdGFsbGVkKG1lcmxpblBhdGgpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBkb3RNZXJsaW5QYXRoID0gYXdhaXQgZnNQcm9taXNlLmZpbmROZWFyZXN0RmlsZSgnLm1lcmxpbicsIGZpbGUpO1xuXG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgY3dkOiAoZG90TWVybGluUGF0aCA/IHBhdGguZGlybmFtZShkb3RNZXJsaW5QYXRoKSA6ICcuJyksXG4gIH07XG5cbiAgbG9nZ2VyLmluZm8oJ1NwYXduaW5nIG5ldyBvY2FtbG1lcmxpbiBwcm9jZXNzJyk7XG4gIGNvbnN0IHByb2Nlc3MgPSBhd2FpdCBzYWZlU3Bhd24obWVybGluUGF0aCwgZmxhZ3MsIG9wdGlvbnMpO1xuICBtZXJsaW5Qcm9jZXNzSW5zdGFuY2UgPSBuZXcgTWVybGluUHJvY2Vzcyhwcm9jZXNzKTtcblxuICBpZiAoZG90TWVybGluUGF0aCkge1xuICAgIC8vIFRPRE8ocGlldGVyKSBhZGQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgLmRvdG1lcmxpbiBmaWxlc1xuICAgIGF3YWl0IG1lcmxpblByb2Nlc3NJbnN0YW5jZS5wdXNoRG90TWVybGluUGF0aChkb3RNZXJsaW5QYXRoKTtcbiAgICBsb2dnZXIuZGVidWcoJ0FkZGVkIC5tZXJsaW4gcGF0aDogJyArIGRvdE1lcmxpblBhdGgpO1xuICB9XG5cbiAgcmV0dXJuIG1lcmxpblByb2Nlc3NJbnN0YW5jZTtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFRoZSBwYXRoIHRvIG9jYW1sbWVybGluIG9uIHRoZSB1c2VyJ3MgbWFjaGluZS4gSXQgaXMgcmVjb21tZW5kZWQgbm90IHRvIGNhY2hlIHRoZSByZXN1bHRcbiAqICAgb2YgdGhpcyBmdW5jdGlvbiBpbiBjYXNlIHRoZSB1c2VyIHVwZGF0ZXMgaGlzIG9yIGhlciBwcmVmZXJlbmNlcyBpbiBBdG9tLCBpbiB3aGljaCBjYXNlIHRoZVxuICogICByZXR1cm4gdmFsdWUgd2lsbCBiZSBzdGFsZS5cbiAqL1xuZnVuY3Rpb24gZ2V0UGF0aFRvTWVybGluKCk6IHN0cmluZyB7XG4gIHJldHVybiBnbG9iYWwuYXRvbVxuICAgICYmIGdsb2JhbC5hdG9tLmNvbmZpZy5nZXQoJ251Y2xpZGUubnVjbGlkZS1vY2FtbC5wYXRoVG9NZXJsaW4nKSB8fCAnb2NhbWxtZXJsaW4nO1xufVxuXG4vKipcbiAqIEByZXR1cm4gVGhlIHNldCBvZiBhcmd1bWVudHMgdG8gcGFzcyB0byBvY2FtbG1lcmxpbi5cbiAqL1xuZnVuY3Rpb24gZ2V0TWVybGluRmxhZ3MoKTogQXJyYXk8c3RyaW5nPiB7XG4gIGNvbnN0IGNvbmZpZ1ZhbCA9IGdsb2JhbC5hdG9tXG4gICAgJiYgZ2xvYmFsLmF0b20uY29uZmlnLmdldCgnbnVjbGlkZS5udWNsaWRlLW9jYW1sLm1lcmxpbkZsYWdzJyk7XG4gIC8vIFRvIHNwbGl0IHdoaWxlIHN0cmlwcGluZyBvdXQgYW55IGxlYWRpbmcvdHJhaWxpbmcgc3BhY2UsIHdlIG1hdGNoIG9uIGFsbFxuICAvLyAqbm9uKi13aGl0ZXNwYWNlLlxuICBjb25zdCBjb25maWdJdGVtcyA9IGNvbmZpZ1ZhbCAmJiBjb25maWdWYWwubWF0Y2goL1xcUysvZyk7XG4gIHJldHVybiBjb25maWdJdGVtcyB8fCBbXTtcbn1cblxubGV0IGlzSW5zdGFsbGVkQ2FjaGU6ID9ib29sZWFuID0gbnVsbDtcbmFzeW5jIGZ1bmN0aW9uIGlzSW5zdGFsbGVkKG1lcmxpblBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBpZiAoaXNJbnN0YWxsZWRDYWNoZSA9PSBudWxsKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3doaWNoJywgW21lcmxpblBhdGhdKTtcbiAgICBpc0luc3RhbGxlZENhY2hlID0gcmVzdWx0LmV4aXRDb2RlID09PSAwO1xuICAgIGlmICghaXNJbnN0YWxsZWRDYWNoZSkge1xuICAgICAgbG9nZ2VyLmluZm8oJ29jYW1sbWVybGluIG5vdCBpbnN0YWxsZWQnKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGlzSW5zdGFsbGVkQ2FjaGU7XG59XG4iXX0=