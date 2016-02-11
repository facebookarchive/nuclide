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
  return global.atom && global.atom.config.get('nuclide.nuclide-ocaml.pathToMerlin') || 'ocamlmerlin';
}

var isInstalledCache = null;
//# sourceMappingURL=data:application/json;base64,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SUFBSSxhQUFhLENBQUM7Q0FDcEY7O0FBRUQsSUFBSSxnQkFBMEIsR0FBRyxJQUFJLENBQUMiLCJmaWxlIjoiTWVybGluUHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtcbiAgY2hlY2tPdXRwdXQsXG4gIGZpbmROZWFyZXN0RmlsZSxcbiAgc2FmZVNwYXduLFxuICBQcm9taXNlUXVldWUsXG59IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IEVSUk9SX1JFU1BPTlNFUyA9IG5ldyBTZXQoW1xuICAnZmFpbHVyZScsXG4gICdlcnJvcicsXG4gICdleGNlcHRpb24nLFxuXSk7XG5cbi8qKlxuICogV3JhcHMgYW4gb2NhbWxtZXJsaW4gcHJvY2VzczsgcHJvdmlkZXMgYXBpIGFjY2VzcyB0b1xuICogb2NhbWxtZXJsaW4ncyBqc29uLW92ZXItc3RkaW4vc3Rkb3V0IHByb3RvY29sLlxuICpcbiAqIFRoaXMgaXMgYmFzZWQgb24gdGhlIHByb3RvY29sIGRlc2NyaXB0aW9uIGF0OlxuICogICBodHRwczovL2dpdGh1Yi5jb20vdGhlLWxhbWJkYS1jaHVyY2gvbWVybGluL2Jsb2IvbWFzdGVyL1BST1RPQ09MLm1kXG4gKiAgIGh0dHBzOi8vZ2l0aHViLmNvbS90aGUtbGFtYmRhLWNodXJjaC9tZXJsaW4vdHJlZS9tYXN0ZXIvc3JjL2Zyb250ZW5kXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXJsaW5Qcm9jZXNzIHtcbiAgX3Byb2M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICBfcHJvbWlzZVF1ZXVlOiBQcm9taXNlUXVldWU7XG4gIF9ydW5uaW5nOiBib29sO1xuXG4gIGNvbnN0cnVjdG9yKHByb2M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKSB7XG4gICAgdGhpcy5fcHJvYyA9IHByb2M7XG4gICAgdGhpcy5fcHJvbWlzZVF1ZXVlID0gbmV3IFByb21pc2VRdWV1ZSgpO1xuICAgIHRoaXMuX3J1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuX3Byb2Mub24oJ2V4aXQnLCAoY29kZSwgc2lnbmFsKSA9PiB7IHRoaXMuX3J1bm5pbmcgPSBmYWxzZTsgfSk7XG4gIH1cblxuICBpc1J1bm5pbmcoKTogYm9vbCB7XG4gICAgcmV0dXJuIHRoaXMuX3J1bm5pbmc7XG4gIH1cblxuICAvKipcbiAgICogVGVsbCBtZXJsaW4gd2hlcmUgdG8gZmluZCBpdHMgcGVyLXJlcG8gLm1lcmxpbiBjb25maWcgZmlsZS5cbiAgICpcbiAgICogQ29uZmlndXJhdGlvbiBmaWxlIGZvcm1hdCBkZXNjcmlwdGlvbjpcbiAgICogICBodHRwczovL2dpdGh1Yi5jb20vdGhlLWxhbWJkYS1jaHVyY2gvbWVybGluL3dpa2kvcHJvamVjdC1jb25maWd1cmF0aW9uXG4gICAqXG4gICAqIEByZXR1cm4gYSBkdW1teSBjdXJzb3IgcG9zaXRpb24gb24gc3VjY2Vzc1xuICAgKi9cbiAgYXN5bmMgcHVzaERvdE1lcmxpblBhdGgocGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcHJvbWlzZVF1ZXVlLnN1Ym1pdChhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAncmVzZXQnLFxuICAgICAgICAnZG90X21lcmxpbicsXG4gICAgICAgIFtwYXRoXSxcbiAgICAgICAgJ2F1dG8nLFxuICAgICAgXSk7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBidWZmZXIgY29udGVudCB0byBxdWVyeSBhZ2FpbnN0LiBNZXJsaW4gdXNlcyBhbiBpbnRlcm5hbFxuICAgKiBidWZmZXIgKG5hbWUgKyBjb250ZW50KSB0aGF0IGlzIGluZGVwZW5kZW50IGZyb20gZmlsZSBjb250ZW50IG9uXG4gICAqIGRpc2suXG4gICAqXG4gICAqIEByZXR1cm4gb24gc3VjY2VzczogYSBjdXJzb3IgcG9zaXRpb24gcG9pbnRlZCBhdCB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgICovXG4gIGFzeW5jIHB1c2hOZXdCdWZmZXIobmFtZTogTnVjbGlkZVVyaSwgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxtaXhlZD4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9wcm9taXNlUXVldWUuc3VibWl0KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbXG4gICAgICAgICdyZXNldCcsXG4gICAgICAgICdhdXRvJywgLy8gb25lIG9mIHttbCwgbWxpLCBhdXRvfVxuICAgICAgICBuYW1lLFxuICAgICAgXSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuU2luZ2xlQ29tbWFuZChbXG4gICAgICAgICd0ZWxsJyxcbiAgICAgICAgJ3NvdXJjZScsXG4gICAgICAgIGNvbnRlbnQsXG4gICAgICBdKTtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGRlZmluaXRpb25cbiAgICpcbiAgICogYGtpbmRgIGlzIG9uZSBvZiAnbWwnIG9yICdtbGknXG4gICAqXG4gICAqIE5vdGU6IG9jYW1sbWVybGluIGxpbmUgbnVtYmVycyBhcmUgMS1iYXNlZC5cbiAgICogQHJldHVybiBudWxsIGlmIG5vdGhpbmcgd2FzIGZvdW5kOyBhIHBvc2l0aW9uIG9mIHRoZSBmb3JtXG4gICAqICAge1wiZmlsZVwiOiBcInNvbWVwYXRoXCIsIFwicG9zXCI6IHtcImxpbmVcIjogNDEsIFwiY29sXCI6IDV9fS5cbiAgICovXG4gIGFzeW5jIGxvY2F0ZShcbiAgICBwYXRoOiBOdWNsaWRlVXJpLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2w6IG51bWJlcixcbiAgICBraW5kOiBzdHJpbmcsXG4gICk6IFByb21pc2U8P3tmaWxlOiBzdHJpbmcsIHBvczoge2xpbmU6IG51bWJlciwgY29sOiBudW1iZXJ9fT4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9wcm9taXNlUXVldWUuc3VibWl0KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGxvY2F0aW9uID0gYXdhaXQgdGhpcy5ydW5TaW5nbGVDb21tYW5kKFtcbiAgICAgICAgJ2xvY2F0ZScsXG4gICAgICAgIC8qIGlkZW50aWZpZXIgbmFtZSAqLyAnJyxcbiAgICAgICAga2luZCxcbiAgICAgICAgJ2F0JyxcbiAgICAgICAge2xpbmU6IGxpbmUgKyAxLCBjb2x9LFxuICAgICAgXSk7XG5cblxuICAgICAgaWYgKHR5cGVvZiBsb2NhdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdChFcnJvcihsb2NhdGlvbikpO1xuICAgICAgfVxuXG4gICAgICAvLyBPY2FtbG1lcmxpbiBkb2Vzbid0IGluY2x1ZGUgYSBgZmlsZWAgZmllbGQgYXQgYWxsIGlmIHRoZSBkZXN0aW5hdGlvbiBpc1xuICAgICAgLy8gaW4gdGhlIHNhbWUgZmlsZS5cbiAgICAgIGlmICghbG9jYXRpb24uZmlsZSkge1xuICAgICAgICBsb2NhdGlvbi5maWxlID0gcGF0aDtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZShsb2NhdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBjb21wbGV0ZShwYXRoOiBOdWNsaWRlVXJpLCBsaW5lOiBudW1iZXIsIGNvbDogbnVtYmVyLCBwcmVmaXg6IHN0cmluZyk6IFByb21pc2U8bWl4ZWQ+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcHJvbWlzZVF1ZXVlLnN1Ym1pdChhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJ1blNpbmdsZUNvbW1hbmQoW1xuICAgICAgICAnY29tcGxldGUnLFxuICAgICAgICAncHJlZml4JyxcbiAgICAgICAgcHJlZml4LFxuICAgICAgICAnYXQnLFxuICAgICAgICB7bGluZTogbGluZSArIDEsIGNvbDogY29sICsgMX0sXG4gICAgICBdKTtcblxuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogUnVuIGEgY29tbWFuZDsgcGFyc2UgdGhlIGpzb24gb3V0cHV0LCByZXR1cm4gYW4gb2JqZWN0LiBUaGlzIGFzc3VtZXNcbiAgICogdGhhdCBtZXJsaW4ncyBwcm90b2NvbCBpcyBsaW5lLWJhc2VkIChyZXN1bHRzIGFyZSBqc29uIG9iamVjdHMgcmVuZGVyZWRcbiAgICogb24gYSBzaW5nbGUgbGluZSkuXG4gICAqL1xuICBydW5TaW5nbGVDb21tYW5kKGNvbW1hbmQ6IG1peGVkKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBjb25zdCBjb21tYW5kU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoY29tbWFuZCk7XG4gICAgY29uc3Qgc3RkaW4gPSB0aGlzLl9wcm9jLnN0ZGluO1xuICAgIGNvbnN0IHN0ZG91dCA9IHRoaXMuX3Byb2Muc3Rkb3V0O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHtjcmVhdGVJbnRlcmZhY2V9ID0gcmVxdWlyZSgncmVhZGxpbmUnKTtcbiAgICAgIGNvbnN0IHJlYWRlciA9IGNyZWF0ZUludGVyZmFjZSh7XG4gICAgICAgIGlucHV0OiBzdGRvdXQsXG4gICAgICAgIHRlcm1pbmFsOiBmYWxzZSxcbiAgICAgIH0pO1xuXG4gICAgICByZWFkZXIub24oJ2xpbmUnLCBsaW5lID0+IHtcbiAgICAgICAgcmVhZGVyLmNsb3NlKCk7XG4gICAgICAgIGxldCByZXNwb25zZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UobGluZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3BvbnNlIHx8ICFBcnJheS5pc0FycmF5KHJlc3BvbnNlKSB8fCByZXNwb25zZS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1VuZXhwZWN0ZWQgcmVzcG9uc2UgZnJvbSBvY2FtbG1lcmxpbjogJHtsaW5lfScpO1xuICAgICAgICAgIHJlamVjdChFcnJvcignVW5leHBlY3RlZCBvY2FtbG1lcmxpbiBvdXRwdXQgZm9ybWF0JykpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IHJlc3BvbnNlWzBdO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gcmVzcG9uc2VbMV07XG5cbiAgICAgICAgaWYgKEVSUk9SX1JFU1BPTlNFUy5oYXMoc3RhdHVzKSkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignT2NhbWxtZXJsaW4gcmFpc2VkIGFuIGVycm9yOiAnICsgbGluZSk7XG4gICAgICAgICAgcmVqZWN0KEVycm9yKCdPY2FtbG1lcmxpbiByZXR1cm5lZCBhbiBlcnJvcicpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKGNvbnRlbnQpO1xuICAgICAgfSk7XG5cbiAgICAgIHN0ZGluLndyaXRlKGNvbW1hbmRTdHJpbmcpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9wcm9jLmtpbGwoKTtcbiAgfVxufVxuXG5sZXQgbWVybGluUHJvY2Vzc0luc3RhbmNlOiA/TWVybGluUHJvY2VzcztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEluc3RhbmNlKGZpbGU6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9NZXJsaW5Qcm9jZXNzPiB7XG4gIGlmIChtZXJsaW5Qcm9jZXNzSW5zdGFuY2UgJiYgbWVybGluUHJvY2Vzc0luc3RhbmNlLmlzUnVubmluZygpKSB7XG4gICAgcmV0dXJuIG1lcmxpblByb2Nlc3NJbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0IG1lcmxpblBhdGggPSBnZXRQYXRoVG9NZXJsaW4oKTtcblxuICBpZiAoIWF3YWl0IGlzSW5zdGFsbGVkKG1lcmxpblBhdGgpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBkb3RNZXJsaW5QYXRoID0gYXdhaXQgZmluZE5lYXJlc3RGaWxlKCcubWVybGluJywgZmlsZSk7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBjd2Q6IChkb3RNZXJsaW5QYXRoID8gcmVxdWlyZSgncGF0aCcpLmRpcm5hbWUoZG90TWVybGluUGF0aCkgOiAnLicpLFxuICB9O1xuXG4gIGxvZ2dlci5pbmZvKCdTcGF3bmluZyBuZXcgb2NhbWxtZXJsaW4gcHJvY2VzcycpO1xuICBjb25zdCBwcm9jZXNzID0gYXdhaXQgc2FmZVNwYXduKG1lcmxpblBhdGgsIFtdLCBvcHRpb25zKTtcbiAgbWVybGluUHJvY2Vzc0luc3RhbmNlID0gbmV3IE1lcmxpblByb2Nlc3MocHJvY2Vzcyk7XG5cbiAgaWYgKGRvdE1lcmxpblBhdGgpIHtcbiAgICAvLyBUT0RPKHBpZXRlcikgYWRkIHN1cHBvcnQgZm9yIG11bHRpcGxlIC5kb3RtZXJsaW4gZmlsZXNcbiAgICBhd2FpdCBtZXJsaW5Qcm9jZXNzSW5zdGFuY2UucHVzaERvdE1lcmxpblBhdGgoZG90TWVybGluUGF0aCk7XG4gICAgbG9nZ2VyLmRlYnVnKCdBZGRlZCAubWVybGluIHBhdGg6ICcgKyBkb3RNZXJsaW5QYXRoKTtcbiAgfVxuXG4gIHJldHVybiBtZXJsaW5Qcm9jZXNzSW5zdGFuY2U7XG59XG5cbi8qKlxuICogQHJldHVybiBUaGUgcGF0aCB0byBvY2FtbG1lcmxpbiBvbiB0aGUgdXNlcidzIG1hY2hpbmUuIEl0IGlzIHJlY29tbWVuZGVkIG5vdCB0byBjYWNoZSB0aGUgcmVzdWx0XG4gKiAgIG9mIHRoaXMgZnVuY3Rpb24gaW4gY2FzZSB0aGUgdXNlciB1cGRhdGVzIGhpcyBvciBoZXIgcHJlZmVyZW5jZXMgaW4gQXRvbSwgaW4gd2hpY2ggY2FzZSB0aGVcbiAqICAgcmV0dXJuIHZhbHVlIHdpbGwgYmUgc3RhbGUuXG4gKi9cbmZ1bmN0aW9uIGdldFBhdGhUb01lcmxpbigpOiBzdHJpbmcge1xuICByZXR1cm4gZ2xvYmFsLmF0b21cbiAgICAmJiBnbG9iYWwuYXRvbS5jb25maWcuZ2V0KCdudWNsaWRlLm51Y2xpZGUtb2NhbWwucGF0aFRvTWVybGluJykgfHwgJ29jYW1sbWVybGluJztcbn1cblxubGV0IGlzSW5zdGFsbGVkQ2FjaGU6ID9ib29sZWFuID0gbnVsbDtcbmFzeW5jIGZ1bmN0aW9uIGlzSW5zdGFsbGVkKG1lcmxpblBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBpZiAoaXNJbnN0YWxsZWRDYWNoZSA9PSBudWxsKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3doaWNoJywgW21lcmxpblBhdGhdKTtcbiAgICBpc0luc3RhbGxlZENhY2hlID0gcmVzdWx0LmV4aXRDb2RlID09PSAwO1xuICAgIGlmICghaXNJbnN0YWxsZWRDYWNoZSkge1xuICAgICAgbG9nZ2VyLmluZm8oJ29jYW1sbWVybGluIG5vdCBpbnN0YWxsZWQnKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGlzSW5zdGFsbGVkQ2FjaGU7XG59XG4iXX0=