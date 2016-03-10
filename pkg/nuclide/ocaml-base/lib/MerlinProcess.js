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
 *   https://github.com/the-lambda-church/merlin/blob/master/doc/dev/PROTOCOL.md
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
    key: 'enclosingType',
    value: _asyncToGenerator(function* (path, line, col) {
      var _this5 = this;

      return yield this._promiseQueue.submit(function (resolve, reject) {
        _this5.runSingleCommand(['type', 'enclosing', 'at', { line: line + 1, col: col }]).then(resolve)['catch'](reject);
      });
    })
  }, {
    key: 'complete',
    value: _asyncToGenerator(function* (path, line, col, prefix) {
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
  return global.atom && global.atom.config.get('nuclide.nuclide-ocaml.pathToMerlin') || 'ocamlmerlin';
}

var isInstalledCache = null;
//# sourceMappingURL=data:application/json;base64,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TSxDQUFDLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0FBQzlELGtCQUFNLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxtQkFBTztXQUNSOztBQUVELGNBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixjQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTVCLGNBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMvQixrQkFBTSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNyRCxrQkFBTSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7QUFDL0MsbUJBQU87V0FDUjs7QUFFRCxpQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2xCLENBQUMsQ0FBQzs7QUFFSCxhQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO09BQzVCLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDbkI7OztTQTdMVSxhQUFhOzs7OztBQWdNMUIsSUFBSSxxQkFBcUMsWUFBQSxDQUFDOztBQXFDMUMsU0FBUyxlQUFlLEdBQVc7QUFDakMsU0FBTyxNQUFNLENBQUMsSUFBSSxJQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLGFBQWEsQ0FBQztDQUNwRjs7QUFFRCxJQUFJLGdCQUEwQixHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJNZXJsaW5Qcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge01lcmxpbkVycm9yLCBNZXJsaW5UeXBlfSBmcm9tICcuL0xvY2FsTWVybGluU2VydmljZSc7XG5cbmltcG9ydCB7XG4gIGNoZWNrT3V0cHV0LFxuICBmaW5kTmVhcmVzdEZpbGUsXG4gIHNhZmVTcGF3bixcbiAgUHJvbWlzZVF1ZXVlLFxufSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuXG5jb25zdCBFUlJPUl9SRVNQT05TRVMgPSBuZXcgU2V0KFtcbiAgJ2ZhaWx1cmUnLFxuICAnZXJyb3InLFxuICAnZXhjZXB0aW9uJyxcbl0pO1xuXG4vKipcbiAqIFdyYXBzIGFuIG9jYW1sbWVybGluIHByb2Nlc3M7IHByb3ZpZGVzIGFwaSBhY2Nlc3MgdG9cbiAqIG9jYW1sbWVybGluJ3MganNvbi1vdmVyLXN0ZGluL3N0ZG91dCBwcm90b2NvbC5cbiAqXG4gKiBUaGlzIGlzIGJhc2VkIG9uIHRoZSBwcm90b2NvbCBkZXNjcmlwdGlvbiBhdDpcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL3RoZS1sYW1iZGEtY2h1cmNoL21lcmxpbi9ibG9iL21hc3Rlci9kb2MvZGV2L1BST1RPQ09MLm1kXG4gKiAgIGh0dHBzOi8vZ2l0aHViLmNvbS90aGUtbGFtYmRhLWNodXJjaC9tZXJsaW4vdHJlZS9tYXN0ZXIvc3JjL2Zyb250ZW5kXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXJsaW5Qcm9jZXNzIHtcbiAgX3Byb2M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICBfcHJvbWlzZVF1ZXVlOiBQcm9taXNlUXVldWU7XG4gIF9ydW5uaW5nOiBib29sO1xuXG4gIGNvbnN0cnVjdG9yKHByb2M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKSB7XG4gICAgdGhpcy5fcHJvYyA9IHByb2M7XG4gICAgdGhpcy5fcHJvbWlzZVF1ZXVlID0gbmV3IFByb21pc2VRdWV1ZSgpO1xuICAgIHRoaXMuX3J1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuX3Byb2Mub24oJ2V4aXQnLCAoY29kZSwgc2lnbmFsKSA9PiB7IHRoaXMuX3J1bm5pbmcgPSBmYWxzZTsgfSk7XG4gIH1cblxuICBpc1J1bm5pbmcoKTogYm9vbCB7XG4gICAgcmV0dXJuIHRoaXMuX3J1bm5pbmc7XG4gIH1cblxuICAvKipcbiAgICogVGVsbCBtZXJsaW4gd2hlcmUgdG8gZmluZCBpdHMgcGVyLXJlcG8gLm1lcmxpbiBjb25maWcgZmlsZS5cbiAgICpcbiAgICogQ29uZmlndXJhdGlvbiBmaWxlIGZvcm1hdCBkZXNjcmlwdGlvbjpcbiAgICogICBodHRwczovL2dpdGh1Yi5jb20vdGhlLWxhbWJkYS1jaHVyY2gvbWVybGluL3dpa2kvcHJvamVjdC1jb25maWd1cmF0aW9uXG4gICAqXG4gICAqIEByZXR1cm4gYSBkdW1teSBjdXJzb3IgcG9zaXRpb24gb24gc3VjY2Vzc1xuICAgKi9cbiAgYXN5bmMgcHVzaERvdE1lcmxpblBhdGgocGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcHJvbWlzZVF1ZXVlLnN1Ym1pdChhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAncmVzZXQnLFxuICAgICAgICAnZG90X21lcmxpbicsXG4gICAgICAgIFtwYXRoXSxcbiAgICAgICAgJ2F1dG8nLFxuICAgICAgXSk7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBidWZmZXIgY29udGVudCB0byBxdWVyeSBhZ2FpbnN0LiBNZXJsaW4gdXNlcyBhbiBpbnRlcm5hbFxuICAgKiBidWZmZXIgKG5hbWUgKyBjb250ZW50KSB0aGF0IGlzIGluZGVwZW5kZW50IGZyb20gZmlsZSBjb250ZW50IG9uXG4gICAqIGRpc2suXG4gICAqXG4gICAqIEByZXR1cm4gb24gc3VjY2VzczogYSBjdXJzb3IgcG9zaXRpb24gcG9pbnRlZCBhdCB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgICovXG4gIGFzeW5jIHB1c2hOZXdCdWZmZXIobmFtZTogTnVjbGlkZVVyaSwgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxtaXhlZD4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9wcm9taXNlUXVldWUuc3VibWl0KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbXG4gICAgICAgICdyZXNldCcsXG4gICAgICAgICdhdXRvJywgLy8gb25lIG9mIHttbCwgbWxpLCBhdXRvfVxuICAgICAgICBuYW1lLFxuICAgICAgXSk7XG5cbiAgICAgIC8vIENsZWFyIHRoZSBidWZmZXIuXG4gICAgICBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAnc2VlaycsXG4gICAgICAgICdleGFjdCcsXG4gICAgICAgIHtsaW5lOiAxLCBjb2w6IDB9LFxuICAgICAgXSk7XG4gICAgICBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoWydkcm9wJ10pO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAndGVsbCcsXG4gICAgICAgICdzb3VyY2UtZW9mJyxcbiAgICAgICAgY29udGVudCxcbiAgICAgIF0pO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgZGVmaW5pdGlvblxuICAgKlxuICAgKiBga2luZGAgaXMgb25lIG9mICdtbCcgb3IgJ21saSdcbiAgICpcbiAgICogTm90ZTogb2NhbWxtZXJsaW4gbGluZSBudW1iZXJzIGFyZSAxLWJhc2VkLlxuICAgKiBAcmV0dXJuIG51bGwgaWYgbm90aGluZyB3YXMgZm91bmQ7IGEgcG9zaXRpb24gb2YgdGhlIGZvcm1cbiAgICogICB7XCJmaWxlXCI6IFwic29tZXBhdGhcIiwgXCJwb3NcIjoge1wibGluZVwiOiA0MSwgXCJjb2xcIjogNX19LlxuICAgKi9cbiAgYXN5bmMgbG9jYXRlKFxuICAgIHBhdGg6IE51Y2xpZGVVcmksXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbDogbnVtYmVyLFxuICAgIGtpbmQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTw/e2ZpbGU6IHN0cmluZzsgcG9zOiB7bGluZTogbnVtYmVyOyBjb2w6IG51bWJlcn19PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Byb21pc2VRdWV1ZS5zdWJtaXQoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAnbG9jYXRlJyxcbiAgICAgICAgLyogaWRlbnRpZmllciBuYW1lICovICcnLFxuICAgICAgICBraW5kLFxuICAgICAgICAnYXQnLFxuICAgICAgICB7bGluZTogbGluZSArIDEsIGNvbH0sXG4gICAgICBdKTtcblxuXG4gICAgICBpZiAodHlwZW9mIGxvY2F0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gcmVqZWN0KEVycm9yKGxvY2F0aW9uKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE9jYW1sbWVybGluIGRvZXNuJ3QgaW5jbHVkZSBhIGBmaWxlYCBmaWVsZCBhdCBhbGwgaWYgdGhlIGRlc3RpbmF0aW9uIGlzXG4gICAgICAvLyBpbiB0aGUgc2FtZSBmaWxlLlxuICAgICAgaWYgKCFsb2NhdGlvbi5maWxlKSB7XG4gICAgICAgIGxvY2F0aW9uLmZpbGUgPSBwYXRoO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlKGxvY2F0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGVuY2xvc2luZ1R5cGUoXG4gICAgcGF0aDogTnVjbGlkZVVyaSxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sOiBudW1iZXIsXG4gICk6IFByb21pc2U8QXJyYXk8TWVybGluVHlwZT4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcHJvbWlzZVF1ZXVlLnN1Ym1pdCgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoWyd0eXBlJywgJ2VuY2xvc2luZycsICdhdCcsIHtsaW5lOiBsaW5lICsgMSwgY29sfV0pXG4gICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgIC5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgY29tcGxldGUocGF0aDogTnVjbGlkZVVyaSwgbGluZTogbnVtYmVyLCBjb2w6IG51bWJlciwgcHJlZml4OiBzdHJpbmcpOiBQcm9taXNlPG1peGVkPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Byb21pc2VRdWV1ZS5zdWJtaXQoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5ydW5TaW5nbGVDb21tYW5kKFtcbiAgICAgICAgJ2NvbXBsZXRlJyxcbiAgICAgICAgJ3ByZWZpeCcsXG4gICAgICAgIHByZWZpeCxcbiAgICAgICAgJ2F0JyxcbiAgICAgICAge2xpbmU6IGxpbmUgKyAxLCBjb2w6IGNvbCArIDF9LFxuICAgICAgXSkudGhlbihyZXNvbHZlKVxuICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGVycm9ycygpOiBQcm9taXNlPEFycmF5PE1lcmxpbkVycm9yPj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9wcm9taXNlUXVldWUuc3VibWl0KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMucnVuU2luZ2xlQ29tbWFuZChbJ2Vycm9ycyddKVxuICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYSBjb21tYW5kOyBwYXJzZSB0aGUganNvbiBvdXRwdXQsIHJldHVybiBhbiBvYmplY3QuIFRoaXMgYXNzdW1lc1xuICAgKiB0aGF0IG1lcmxpbidzIHByb3RvY29sIGlzIGxpbmUtYmFzZWQgKHJlc3VsdHMgYXJlIGpzb24gb2JqZWN0cyByZW5kZXJlZFxuICAgKiBvbiBhIHNpbmdsZSBsaW5lKS5cbiAgICovXG4gIHJ1blNpbmdsZUNvbW1hbmQoY29tbWFuZDogbWl4ZWQpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIGNvbnN0IGNvbW1hbmRTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShjb21tYW5kKTtcbiAgICBjb25zdCBzdGRpbiA9IHRoaXMuX3Byb2Muc3RkaW47XG4gICAgY29uc3Qgc3Rkb3V0ID0gdGhpcy5fcHJvYy5zdGRvdXQ7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qge2NyZWF0ZUludGVyZmFjZX0gPSByZXF1aXJlKCdyZWFkbGluZScpO1xuICAgICAgY29uc3QgcmVhZGVyID0gY3JlYXRlSW50ZXJmYWNlKHtcbiAgICAgICAgaW5wdXQ6IHN0ZG91dCxcbiAgICAgICAgdGVybWluYWw6IGZhbHNlLFxuICAgICAgfSk7XG5cbiAgICAgIHJlYWRlci5vbignbGluZScsIGxpbmUgPT4ge1xuICAgICAgICByZWFkZXIuY2xvc2UoKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShsaW5lKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcmVzcG9uc2UgfHwgIUFycmF5LmlzQXJyYXkocmVzcG9uc2UpIHx8IHJlc3BvbnNlLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignVW5leHBlY3RlZCByZXNwb25zZSBmcm9tIG9jYW1sbWVybGluOiAke2xpbmV9Jyk7XG4gICAgICAgICAgcmVqZWN0KEVycm9yKCdVbmV4cGVjdGVkIG9jYW1sbWVybGluIG91dHB1dCBmb3JtYXQnKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdHVzID0gcmVzcG9uc2VbMF07XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZXNwb25zZVsxXTtcblxuICAgICAgICBpZiAoRVJST1JfUkVTUE9OU0VTLmhhcyhzdGF0dXMpKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdPY2FtbG1lcmxpbiByYWlzZWQgYW4gZXJyb3I6ICcgKyBsaW5lKTtcbiAgICAgICAgICByZWplY3QoRXJyb3IoJ09jYW1sbWVybGluIHJldHVybmVkIGFuIGVycm9yJykpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUoY29udGVudCk7XG4gICAgICB9KTtcblxuICAgICAgc3RkaW4ud3JpdGUoY29tbWFuZFN0cmluZyk7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb2Mua2lsbCgpO1xuICB9XG59XG5cbmxldCBtZXJsaW5Qcm9jZXNzSW5zdGFuY2U6ID9NZXJsaW5Qcm9jZXNzO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SW5zdGFuY2UoZmlsZTogTnVjbGlkZVVyaSk6IFByb21pc2U8P01lcmxpblByb2Nlc3M+IHtcbiAgaWYgKG1lcmxpblByb2Nlc3NJbnN0YW5jZSAmJiBtZXJsaW5Qcm9jZXNzSW5zdGFuY2UuaXNSdW5uaW5nKCkpIHtcbiAgICByZXR1cm4gbWVybGluUHJvY2Vzc0luc3RhbmNlO1xuICB9XG5cbiAgY29uc3QgbWVybGluUGF0aCA9IGdldFBhdGhUb01lcmxpbigpO1xuXG4gIGlmICghYXdhaXQgaXNJbnN0YWxsZWQobWVybGluUGF0aCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGRvdE1lcmxpblBhdGggPSBhd2FpdCBmaW5kTmVhcmVzdEZpbGUoJy5tZXJsaW4nLCBmaWxlKTtcblxuICBjb25zdCBvcHRpb25zID0ge1xuICAgIGN3ZDogKGRvdE1lcmxpblBhdGggPyByZXF1aXJlKCdwYXRoJykuZGlybmFtZShkb3RNZXJsaW5QYXRoKSA6ICcuJyksXG4gIH07XG5cbiAgbG9nZ2VyLmluZm8oJ1NwYXduaW5nIG5ldyBvY2FtbG1lcmxpbiBwcm9jZXNzJyk7XG4gIGNvbnN0IHByb2Nlc3MgPSBhd2FpdCBzYWZlU3Bhd24obWVybGluUGF0aCwgW10sIG9wdGlvbnMpO1xuICBtZXJsaW5Qcm9jZXNzSW5zdGFuY2UgPSBuZXcgTWVybGluUHJvY2Vzcyhwcm9jZXNzKTtcblxuICBpZiAoZG90TWVybGluUGF0aCkge1xuICAgIC8vIFRPRE8ocGlldGVyKSBhZGQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgLmRvdG1lcmxpbiBmaWxlc1xuICAgIGF3YWl0IG1lcmxpblByb2Nlc3NJbnN0YW5jZS5wdXNoRG90TWVybGluUGF0aChkb3RNZXJsaW5QYXRoKTtcbiAgICBsb2dnZXIuZGVidWcoJ0FkZGVkIC5tZXJsaW4gcGF0aDogJyArIGRvdE1lcmxpblBhdGgpO1xuICB9XG5cbiAgcmV0dXJuIG1lcmxpblByb2Nlc3NJbnN0YW5jZTtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFRoZSBwYXRoIHRvIG9jYW1sbWVybGluIG9uIHRoZSB1c2VyJ3MgbWFjaGluZS4gSXQgaXMgcmVjb21tZW5kZWQgbm90IHRvIGNhY2hlIHRoZSByZXN1bHRcbiAqICAgb2YgdGhpcyBmdW5jdGlvbiBpbiBjYXNlIHRoZSB1c2VyIHVwZGF0ZXMgaGlzIG9yIGhlciBwcmVmZXJlbmNlcyBpbiBBdG9tLCBpbiB3aGljaCBjYXNlIHRoZVxuICogICByZXR1cm4gdmFsdWUgd2lsbCBiZSBzdGFsZS5cbiAqL1xuZnVuY3Rpb24gZ2V0UGF0aFRvTWVybGluKCk6IHN0cmluZyB7XG4gIHJldHVybiBnbG9iYWwuYXRvbVxuICAgICYmIGdsb2JhbC5hdG9tLmNvbmZpZy5nZXQoJ251Y2xpZGUubnVjbGlkZS1vY2FtbC5wYXRoVG9NZXJsaW4nKSB8fCAnb2NhbWxtZXJsaW4nO1xufVxuXG5sZXQgaXNJbnN0YWxsZWRDYWNoZTogP2Jvb2xlYW4gPSBudWxsO1xuYXN5bmMgZnVuY3Rpb24gaXNJbnN0YWxsZWQobWVybGluUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGlmIChpc0luc3RhbGxlZENhY2hlID09IG51bGwpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dCgnd2hpY2gnLCBbbWVybGluUGF0aF0pO1xuICAgIGlzSW5zdGFsbGVkQ2FjaGUgPSByZXN1bHQuZXhpdENvZGUgPT09IDA7XG4gICAgaWYgKCFpc0luc3RhbGxlZENhY2hlKSB7XG4gICAgICBsb2dnZXIuaW5mbygnb2NhbWxtZXJsaW4gbm90IGluc3RhbGxlZCcpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXNJbnN0YWxsZWRDYWNoZTtcbn1cbiJdfQ==