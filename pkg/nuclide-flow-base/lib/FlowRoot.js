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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fuzzaldrin = require('fuzzaldrin');

var _nuclideLogging = require('../../nuclide-logging');

var _FlowHelpers = require('./FlowHelpers');

var _FlowProcess = require('./FlowProcess');

var _astToOutline = require('./astToOutline');

var _diagnosticsParser = require('./diagnosticsParser');

/** Encapsulates all of the state information we need about a specific Flow root */

var logger = (0, _nuclideLogging.getLogger)();

var FlowRoot = (function () {
  function FlowRoot(root) {
    _classCallCheck(this, FlowRoot);

    this._root = root;
    this._process = new _FlowProcess.FlowProcess(root);
  }

  _createClass(FlowRoot, [{
    key: 'dispose',
    value: function dispose() {
      this._process.dispose();
    }
  }, {
    key: 'allowServerRestart',
    value: function allowServerRestart() {
      this._process.allowServerRestart();
    }
  }, {
    key: 'getPathToRoot',
    value: function getPathToRoot() {
      return this._root;
    }
  }, {
    key: 'getServerStatusUpdates',
    value: function getServerStatusUpdates() {
      return this._process.getServerStatusUpdates();
    }
  }, {
    key: 'flowFindDefinition',
    value: _asyncToGenerator(function* (file, currentContents, line, column) {
      var options = {};
      // We pass the current contents of the buffer to Flow via stdin.
      // This makes it possible for get-def to operate on the unsaved content in
      // the user's editor rather than what is saved on disk. It would be annoying
      // if the user had to save before using the jump-to-definition feature to
      // ensure he or she got accurate results.
      options.stdin = currentContents;

      var args = ['get-def', '--json', '--path', file, line, column];
      try {
        var result = yield this._process.execFlow(args, options, file);
        if (!result) {
          return null;
        }
        var json = parseJSON(args, result.stdout);
        if (json['path']) {
          return {
            file: json['path'],
            point: {
              line: json['line'] - 1,
              column: json['start'] - 1
            }
          };
        } else {
          return null;
        }
      } catch (e) {
        return null;
      }
    })

    /**
     * If currentContents is null, it means that the file has not changed since
     * it has been saved, so we can avoid piping the whole contents to the Flow
     * process.
     */
  }, {
    key: 'flowFindDiagnostics',
    value: _asyncToGenerator(function* (file, currentContents) {
      var options = {};

      var args = undefined;
      if (currentContents) {
        options.stdin = currentContents;

        // Currently, `flow check-contents` returns all of the errors in the
        // project. It would be nice if it would use the path for filtering, as
        // currently the client has to do the filtering.
        args = ['check-contents', '--json', file];
      } else {
        // We can just use `flow status` if the contents are unchanged.
        args = ['status', '--json', file];
      }

      var result = undefined;

      try {
        // Don't log errors if the command returns a nonzero exit code, because status returns nonzero
        // if it is reporting any issues, even when it succeeds.
        result = yield this._process.execFlow(args, options, file, /* waitForServer */true);
        if (!result) {
          return null;
        }
      } catch (e) {
        // This codepath will be exercised when Flow finds type errors as the
        // exit code will be non-zero. Note this codepath could also be exercised
        // due to a logical error in Nuclide, so we try to differentiate.
        if (e.exitCode !== undefined) {
          result = e;
        } else {
          logger.error(e);
          return null;
        }
      }

      var json = undefined;
      try {
        json = parseJSON(args, result.stdout);
      } catch (e) {
        return null;
      }

      return (0, _diagnosticsParser.flowStatusOutputToDiagnostics)(this._root, json);
    })
  }, {
    key: 'flowGetAutocompleteSuggestions',
    value: _asyncToGenerator(function* (file, currentContents, line, column, prefix, activatedManually) {
      // We may want to make this configurable, but if it is ever higher than one we need to make sure
      // it works properly when the user manually activates it (e.g. with ctrl+space). See
      // https://github.com/atom/autocomplete-plus/issues/597
      //
      // If this is made configurable, consider using autocomplete-plus' minimumWordLength setting, as
      // per https://github.com/atom/autocomplete-plus/issues/594
      var minimumPrefixLength = 1;

      // Allows completions to immediately appear when we are completing off of object properties.
      // This also needs to be changed if minimumPrefixLength goes above 1, since after you type a
      // single alphanumeric character, autocomplete-plus no longer includes the dot in the prefix.
      var prefixHasDot = prefix.indexOf('.') !== -1;

      // If it is just whitespace and punctuation, ignore it (this keeps us
      // from eating leading dots).
      var replacementPrefix = /^[\s.]*$/.test(prefix) ? '' : prefix;

      if (!activatedManually && !prefixHasDot && replacementPrefix.length < minimumPrefixLength) {
        return [];
      }

      var options = {};

      var args = ['autocomplete', '--json', file];

      options.stdin = (0, _FlowHelpers.insertAutocompleteToken)(currentContents, line, column);
      try {
        var result = yield this._process.execFlow(args, options, file);
        if (!result) {
          return [];
        }
        var json = parseJSON(args, result.stdout);
        var resultsArray = undefined;
        if (Array.isArray(json)) {
          // Flow < v0.20.0
          resultsArray = json;
        } else {
          // Flow >= v0.20.0. The output format was changed to support more detailed failure
          // information.
          resultsArray = json.result;
        }
        var candidates = resultsArray.map(function (item) {
          return (0, _FlowHelpers.processAutocompleteItem)(replacementPrefix, item);
        });
        return (0, _fuzzaldrin.filter)(candidates, replacementPrefix, { key: 'displayText' });
      } catch (e) {
        return [];
      }
    })
  }, {
    key: 'flowGetType',
    value: _asyncToGenerator(function* (file, currentContents, line, column, includeRawType) {
      var options = {};

      options.stdin = currentContents;

      line = line + 1;
      column = column + 1;
      var args = ['type-at-pos', '--json', '--path', file, line, column];
      if (includeRawType) {
        args.push('--raw');
      }

      var output = undefined;
      try {
        var result = yield this._process.execFlow(args, options, file);
        if (!result) {
          return null;
        }
        output = result.stdout;
        if (output === '') {
          // if there is a syntax error, Flow returns the JSON on stderr while
          // still returning a 0 exit code (t8018595)
          output = result.stderr;
        }
      } catch (e) {
        return null;
      }
      var json = undefined;
      try {
        json = parseJSON(args, output);
      } catch (e) {
        return null;
      }
      var type = json['type'];
      var rawType = json['raw_type'];
      if (!type || type === '(unknown)' || type === '') {
        if (type === '') {
          // This should not happen. The Flow team believes it's an error in Flow
          // if it does. I'm leaving the condition here because it used to happen
          // before the switch to JSON and I'd rather log something than have the
          // user experience regress in case I'm wrong.
          logger.error('Received empty type hint from `flow type-at-pos`');
        }
        return null;
      }
      return { type: type, rawType: rawType };
    })
  }], [{
    key: 'flowGetOutline',
    value: _asyncToGenerator(function* (currentContents) {
      var options = {
        stdin: currentContents
      };

      var args = ['ast'];

      var json = undefined;
      try {
        var result = yield _FlowProcess.FlowProcess.execFlowClient(args, options);
        if (result == null) {
          return null;
        }
        json = parseJSON(args, result.stdout);
      } catch (e) {
        logger.warn(e);
        return null;
      }

      try {
        return (0, _astToOutline.astToOutline)(json);
      } catch (e) {
        // Traversing the AST is an error-prone process and it's hard to be sure we've handled all the
        // cases. Fail gracefully if it does not work.
        logger.error(e);
        return null;
      }
    })
  }]);

  return FlowRoot;
})();

exports.FlowRoot = FlowRoot;

function parseJSON(args, value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    logger.error('Invalid JSON result from flow ' + args.join(' ') + '. JSON:\n\'' + value + '\'.');
    throw e;
  }
}

// The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
//# sourceMappingURL=data:application/json;base64,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b3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7U2VydmVyU3RhdHVzVHlwZX0gZnJvbSAnLi4nO1xuXG5pbXBvcnQgdHlwZSB7XG4gIERpYWdub3N0aWNzLFxuICBMb2MsXG4gIEZsb3dPdXRsaW5lVHJlZSxcbn0gZnJvbSAnLi4nO1xuXG5pbXBvcnQge2ZpbHRlcn0gZnJvbSAnZnV6emFsZHJpbic7XG5cblxuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuaW1wb3J0IHtcbiAgaW5zZXJ0QXV0b2NvbXBsZXRlVG9rZW4sXG4gIHByb2Nlc3NBdXRvY29tcGxldGVJdGVtLFxufSBmcm9tICcuL0Zsb3dIZWxwZXJzJztcblxuaW1wb3J0IHtGbG93UHJvY2Vzc30gZnJvbSAnLi9GbG93UHJvY2Vzcyc7XG5cbmltcG9ydCB7YXN0VG9PdXRsaW5lfSBmcm9tICcuL2FzdFRvT3V0bGluZSc7XG5pbXBvcnQge2Zsb3dTdGF0dXNPdXRwdXRUb0RpYWdub3N0aWNzfSBmcm9tICcuL2RpYWdub3N0aWNzUGFyc2VyJztcblxuLyoqIEVuY2Fwc3VsYXRlcyBhbGwgb2YgdGhlIHN0YXRlIGluZm9ybWF0aW9uIHdlIG5lZWQgYWJvdXQgYSBzcGVjaWZpYyBGbG93IHJvb3QgKi9cbmV4cG9ydCBjbGFzcyBGbG93Um9vdCB7XG4gIC8vIFRoZSBwYXRoIHRvIHRoZSBkaXJlY3Rvcnkgd2hlcmUgdGhlIC5mbG93Y29uZmlnIGlzIC0tIGkuZS4gdGhlIHJvb3Qgb2YgdGhlIEZsb3cgcHJvamVjdC5cbiAgX3Jvb3Q6IHN0cmluZztcbiAgX3Byb2Nlc3M6IEZsb3dQcm9jZXNzO1xuXG4gIGNvbnN0cnVjdG9yKHJvb3Q6IHN0cmluZykge1xuICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIHRoaXMuX3Byb2Nlc3MgPSBuZXcgRmxvd1Byb2Nlc3Mocm9vdCk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3Byb2Nlc3MuZGlzcG9zZSgpO1xuICB9XG5cbiAgYWxsb3dTZXJ2ZXJSZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMuX3Byb2Nlc3MuYWxsb3dTZXJ2ZXJSZXN0YXJ0KCk7XG4gIH1cblxuICBnZXRQYXRoVG9Sb290KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3Jvb3Q7XG4gIH1cblxuICBnZXRTZXJ2ZXJTdGF0dXNVcGRhdGVzKCk6IE9ic2VydmFibGU8U2VydmVyU3RhdHVzVHlwZT4ge1xuICAgIHJldHVybiB0aGlzLl9wcm9jZXNzLmdldFNlcnZlclN0YXR1c1VwZGF0ZXMoKTtcbiAgfVxuXG4gIGFzeW5jIGZsb3dGaW5kRGVmaW5pdGlvbihcbiAgICBmaWxlOiBOdWNsaWRlVXJpLFxuICAgIGN1cnJlbnRDb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgKTogUHJvbWlzZTw/TG9jPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuICAgIC8vIFdlIHBhc3MgdGhlIGN1cnJlbnQgY29udGVudHMgb2YgdGhlIGJ1ZmZlciB0byBGbG93IHZpYSBzdGRpbi5cbiAgICAvLyBUaGlzIG1ha2VzIGl0IHBvc3NpYmxlIGZvciBnZXQtZGVmIHRvIG9wZXJhdGUgb24gdGhlIHVuc2F2ZWQgY29udGVudCBpblxuICAgIC8vIHRoZSB1c2VyJ3MgZWRpdG9yIHJhdGhlciB0aGFuIHdoYXQgaXMgc2F2ZWQgb24gZGlzay4gSXQgd291bGQgYmUgYW5ub3lpbmdcbiAgICAvLyBpZiB0aGUgdXNlciBoYWQgdG8gc2F2ZSBiZWZvcmUgdXNpbmcgdGhlIGp1bXAtdG8tZGVmaW5pdGlvbiBmZWF0dXJlIHRvXG4gICAgLy8gZW5zdXJlIGhlIG9yIHNoZSBnb3QgYWNjdXJhdGUgcmVzdWx0cy5cbiAgICBvcHRpb25zLnN0ZGluID0gY3VycmVudENvbnRlbnRzO1xuXG4gICAgY29uc3QgYXJncyA9IFsnZ2V0LWRlZicsICctLWpzb24nLCAnLS1wYXRoJywgZmlsZSwgbGluZSwgY29sdW1uXTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzcy5leGVjRmxvdyhhcmdzLCBvcHRpb25zLCBmaWxlKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY29uc3QganNvbiA9IHBhcnNlSlNPTihhcmdzLCByZXN1bHQuc3Rkb3V0KTtcbiAgICAgIGlmIChqc29uWydwYXRoJ10pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBmaWxlOiBqc29uWydwYXRoJ10sXG4gICAgICAgICAgcG9pbnQ6IHtcbiAgICAgICAgICAgIGxpbmU6IGpzb25bJ2xpbmUnXSAtIDEsXG4gICAgICAgICAgICBjb2x1bW46IGpzb25bJ3N0YXJ0J10gLSAxLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSWYgY3VycmVudENvbnRlbnRzIGlzIG51bGwsIGl0IG1lYW5zIHRoYXQgdGhlIGZpbGUgaGFzIG5vdCBjaGFuZ2VkIHNpbmNlXG4gICAqIGl0IGhhcyBiZWVuIHNhdmVkLCBzbyB3ZSBjYW4gYXZvaWQgcGlwaW5nIHRoZSB3aG9sZSBjb250ZW50cyB0byB0aGUgRmxvd1xuICAgKiBwcm9jZXNzLlxuICAgKi9cbiAgYXN5bmMgZmxvd0ZpbmREaWFnbm9zdGljcyhcbiAgICBmaWxlOiBOdWNsaWRlVXJpLFxuICAgIGN1cnJlbnRDb250ZW50czogP3N0cmluZyxcbiAgKTogUHJvbWlzZTw/RGlhZ25vc3RpY3M+IHtcbiAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICBsZXQgYXJncztcbiAgICBpZiAoY3VycmVudENvbnRlbnRzKSB7XG4gICAgICBvcHRpb25zLnN0ZGluID0gY3VycmVudENvbnRlbnRzO1xuXG4gICAgICAvLyBDdXJyZW50bHksIGBmbG93IGNoZWNrLWNvbnRlbnRzYCByZXR1cm5zIGFsbCBvZiB0aGUgZXJyb3JzIGluIHRoZVxuICAgICAgLy8gcHJvamVjdC4gSXQgd291bGQgYmUgbmljZSBpZiBpdCB3b3VsZCB1c2UgdGhlIHBhdGggZm9yIGZpbHRlcmluZywgYXNcbiAgICAgIC8vIGN1cnJlbnRseSB0aGUgY2xpZW50IGhhcyB0byBkbyB0aGUgZmlsdGVyaW5nLlxuICAgICAgYXJncyA9IFsnY2hlY2stY29udGVudHMnLCAnLS1qc29uJywgZmlsZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIGNhbiBqdXN0IHVzZSBgZmxvdyBzdGF0dXNgIGlmIHRoZSBjb250ZW50cyBhcmUgdW5jaGFuZ2VkLlxuICAgICAgYXJncyA9IFsnc3RhdHVzJywgJy0tanNvbicsIGZpbGVdO1xuICAgIH1cblxuICAgIGxldCByZXN1bHQ7XG5cbiAgICB0cnkge1xuICAgICAgLy8gRG9uJ3QgbG9nIGVycm9ycyBpZiB0aGUgY29tbWFuZCByZXR1cm5zIGEgbm9uemVybyBleGl0IGNvZGUsIGJlY2F1c2Ugc3RhdHVzIHJldHVybnMgbm9uemVyb1xuICAgICAgLy8gaWYgaXQgaXMgcmVwb3J0aW5nIGFueSBpc3N1ZXMsIGV2ZW4gd2hlbiBpdCBzdWNjZWVkcy5cbiAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3MuZXhlY0Zsb3coYXJncywgb3B0aW9ucywgZmlsZSwgLyogd2FpdEZvclNlcnZlciAqLyB0cnVlKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRoaXMgY29kZXBhdGggd2lsbCBiZSBleGVyY2lzZWQgd2hlbiBGbG93IGZpbmRzIHR5cGUgZXJyb3JzIGFzIHRoZVxuICAgICAgLy8gZXhpdCBjb2RlIHdpbGwgYmUgbm9uLXplcm8uIE5vdGUgdGhpcyBjb2RlcGF0aCBjb3VsZCBhbHNvIGJlIGV4ZXJjaXNlZFxuICAgICAgLy8gZHVlIHRvIGEgbG9naWNhbCBlcnJvciBpbiBOdWNsaWRlLCBzbyB3ZSB0cnkgdG8gZGlmZmVyZW50aWF0ZS5cbiAgICAgIGlmIChlLmV4aXRDb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVzdWx0ID0gZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGpzb247XG4gICAgdHJ5IHtcbiAgICAgIGpzb24gPSBwYXJzZUpTT04oYXJncywgcmVzdWx0LnN0ZG91dCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZsb3dTdGF0dXNPdXRwdXRUb0RpYWdub3N0aWNzKHRoaXMuX3Jvb3QsIGpzb24pO1xuICB9XG5cbiAgYXN5bmMgZmxvd0dldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zKFxuICAgIGZpbGU6IE51Y2xpZGVVcmksXG4gICAgY3VycmVudENvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICAgIHByZWZpeDogc3RyaW5nLFxuICAgIGFjdGl2YXRlZE1hbnVhbGx5OiBib29sZWFuLFxuICApOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIFdlIG1heSB3YW50IHRvIG1ha2UgdGhpcyBjb25maWd1cmFibGUsIGJ1dCBpZiBpdCBpcyBldmVyIGhpZ2hlciB0aGFuIG9uZSB3ZSBuZWVkIHRvIG1ha2Ugc3VyZVxuICAgIC8vIGl0IHdvcmtzIHByb3Blcmx5IHdoZW4gdGhlIHVzZXIgbWFudWFsbHkgYWN0aXZhdGVzIGl0IChlLmcuIHdpdGggY3RybCtzcGFjZSkuIFNlZVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL2lzc3Vlcy81OTdcbiAgICAvL1xuICAgIC8vIElmIHRoaXMgaXMgbWFkZSBjb25maWd1cmFibGUsIGNvbnNpZGVyIHVzaW5nIGF1dG9jb21wbGV0ZS1wbHVzJyBtaW5pbXVtV29yZExlbmd0aCBzZXR0aW5nLCBhc1xuICAgIC8vIHBlciBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy9pc3N1ZXMvNTk0XG4gICAgY29uc3QgbWluaW11bVByZWZpeExlbmd0aCA9IDE7XG5cbiAgICAvLyBBbGxvd3MgY29tcGxldGlvbnMgdG8gaW1tZWRpYXRlbHkgYXBwZWFyIHdoZW4gd2UgYXJlIGNvbXBsZXRpbmcgb2ZmIG9mIG9iamVjdCBwcm9wZXJ0aWVzLlxuICAgIC8vIFRoaXMgYWxzbyBuZWVkcyB0byBiZSBjaGFuZ2VkIGlmIG1pbmltdW1QcmVmaXhMZW5ndGggZ29lcyBhYm92ZSAxLCBzaW5jZSBhZnRlciB5b3UgdHlwZSBhXG4gICAgLy8gc2luZ2xlIGFscGhhbnVtZXJpYyBjaGFyYWN0ZXIsIGF1dG9jb21wbGV0ZS1wbHVzIG5vIGxvbmdlciBpbmNsdWRlcyB0aGUgZG90IGluIHRoZSBwcmVmaXguXG4gICAgY29uc3QgcHJlZml4SGFzRG90ID0gcHJlZml4LmluZGV4T2YoJy4nKSAhPT0gLTE7XG5cbiAgICAvLyBJZiBpdCBpcyBqdXN0IHdoaXRlc3BhY2UgYW5kIHB1bmN0dWF0aW9uLCBpZ25vcmUgaXQgKHRoaXMga2VlcHMgdXNcbiAgICAvLyBmcm9tIGVhdGluZyBsZWFkaW5nIGRvdHMpLlxuICAgIGNvbnN0IHJlcGxhY2VtZW50UHJlZml4ID0gL15bXFxzLl0qJC8udGVzdChwcmVmaXgpID8gJycgOiBwcmVmaXg7XG5cbiAgICBpZiAoIWFjdGl2YXRlZE1hbnVhbGx5ICYmICFwcmVmaXhIYXNEb3QgJiYgcmVwbGFjZW1lbnRQcmVmaXgubGVuZ3RoIDwgbWluaW11bVByZWZpeExlbmd0aCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICAgIGNvbnN0IGFyZ3MgPSBbJ2F1dG9jb21wbGV0ZScsICctLWpzb24nLCBmaWxlXTtcblxuICAgIG9wdGlvbnMuc3RkaW4gPSBpbnNlcnRBdXRvY29tcGxldGVUb2tlbihjdXJyZW50Q29udGVudHMsIGxpbmUsIGNvbHVtbik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3MuZXhlY0Zsb3coYXJncywgb3B0aW9ucywgZmlsZSk7XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICBjb25zdCBqc29uID0gcGFyc2VKU09OKGFyZ3MsIHJlc3VsdC5zdGRvdXQpO1xuICAgICAgbGV0IHJlc3VsdHNBcnJheTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGpzb24pKSB7XG4gICAgICAgIC8vIEZsb3cgPCB2MC4yMC4wXG4gICAgICAgIHJlc3VsdHNBcnJheSA9IGpzb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGbG93ID49IHYwLjIwLjAuIFRoZSBvdXRwdXQgZm9ybWF0IHdhcyBjaGFuZ2VkIHRvIHN1cHBvcnQgbW9yZSBkZXRhaWxlZCBmYWlsdXJlXG4gICAgICAgIC8vIGluZm9ybWF0aW9uLlxuICAgICAgICByZXN1bHRzQXJyYXkgPSBqc29uLnJlc3VsdDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSByZXN1bHRzQXJyYXkubWFwKGl0ZW0gPT4gcHJvY2Vzc0F1dG9jb21wbGV0ZUl0ZW0ocmVwbGFjZW1lbnRQcmVmaXgsIGl0ZW0pKTtcbiAgICAgIHJldHVybiBmaWx0ZXIoY2FuZGlkYXRlcywgcmVwbGFjZW1lbnRQcmVmaXgsIHsga2V5OiAnZGlzcGxheVRleHQnIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBmbG93R2V0VHlwZShcbiAgICBmaWxlOiBOdWNsaWRlVXJpLFxuICAgIGN1cnJlbnRDb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgICBpbmNsdWRlUmF3VHlwZTogYm9vbGVhbixcbiAgKTogUHJvbWlzZTw/e3R5cGU6IHN0cmluZzsgcmF3VHlwZTogP3N0cmluZ30+IHtcbiAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICBvcHRpb25zLnN0ZGluID0gY3VycmVudENvbnRlbnRzO1xuXG4gICAgbGluZSA9IGxpbmUgKyAxO1xuICAgIGNvbHVtbiA9IGNvbHVtbiArIDE7XG4gICAgY29uc3QgYXJncyA9XG4gICAgICBbJ3R5cGUtYXQtcG9zJywgJy0tanNvbicsICctLXBhdGgnLCBmaWxlLCBsaW5lLCBjb2x1bW5dO1xuICAgIGlmIChpbmNsdWRlUmF3VHlwZSkge1xuICAgICAgYXJncy5wdXNoKCctLXJhdycpO1xuICAgIH1cblxuICAgIGxldCBvdXRwdXQ7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3MuZXhlY0Zsb3coYXJncywgb3B0aW9ucywgZmlsZSk7XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIG91dHB1dCA9IHJlc3VsdC5zdGRvdXQ7XG4gICAgICBpZiAob3V0cHV0ID09PSAnJykge1xuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIHN5bnRheCBlcnJvciwgRmxvdyByZXR1cm5zIHRoZSBKU09OIG9uIHN0ZGVyciB3aGlsZVxuICAgICAgICAvLyBzdGlsbCByZXR1cm5pbmcgYSAwIGV4aXQgY29kZSAodDgwMTg1OTUpXG4gICAgICAgIG91dHB1dCA9IHJlc3VsdC5zdGRlcnI7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBqc29uO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gcGFyc2VKU09OKGFyZ3MsIG91dHB1dCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHR5cGUgPSBqc29uWyd0eXBlJ107XG4gICAgY29uc3QgcmF3VHlwZSA9IGpzb25bJ3Jhd190eXBlJ107XG4gICAgaWYgKCF0eXBlIHx8IHR5cGUgPT09ICcodW5rbm93biknIHx8IHR5cGUgPT09ICcnKSB7XG4gICAgICBpZiAodHlwZSA9PT0gJycpIHtcbiAgICAgICAgLy8gVGhpcyBzaG91bGQgbm90IGhhcHBlbi4gVGhlIEZsb3cgdGVhbSBiZWxpZXZlcyBpdCdzIGFuIGVycm9yIGluIEZsb3dcbiAgICAgICAgLy8gaWYgaXQgZG9lcy4gSSdtIGxlYXZpbmcgdGhlIGNvbmRpdGlvbiBoZXJlIGJlY2F1c2UgaXQgdXNlZCB0byBoYXBwZW5cbiAgICAgICAgLy8gYmVmb3JlIHRoZSBzd2l0Y2ggdG8gSlNPTiBhbmQgSSdkIHJhdGhlciBsb2cgc29tZXRoaW5nIHRoYW4gaGF2ZSB0aGVcbiAgICAgICAgLy8gdXNlciBleHBlcmllbmNlIHJlZ3Jlc3MgaW4gY2FzZSBJJ20gd3JvbmcuXG4gICAgICAgIGxvZ2dlci5lcnJvcignUmVjZWl2ZWQgZW1wdHkgdHlwZSBoaW50IGZyb20gYGZsb3cgdHlwZS1hdC1wb3NgJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHt0eXBlLCByYXdUeXBlfTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBmbG93R2V0T3V0bGluZShjdXJyZW50Q29udGVudHM6IHN0cmluZyk6IFByb21pc2U8P0FycmF5PEZsb3dPdXRsaW5lVHJlZT4+IHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgc3RkaW46IGN1cnJlbnRDb250ZW50cyxcbiAgICB9O1xuXG4gICAgY29uc3QgYXJncyA9IFsnYXN0J107XG5cbiAgICBsZXQganNvbjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRmxvd1Byb2Nlc3MuZXhlY0Zsb3dDbGllbnQoYXJncywgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBqc29uID0gcGFyc2VKU09OKGFyZ3MsIHJlc3VsdC5zdGRvdXQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci53YXJuKGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhc3RUb091dGxpbmUoanNvbik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gVHJhdmVyc2luZyB0aGUgQVNUIGlzIGFuIGVycm9yLXByb25lIHByb2Nlc3MgYW5kIGl0J3MgaGFyZCB0byBiZSBzdXJlIHdlJ3ZlIGhhbmRsZWQgYWxsIHRoZVxuICAgICAgLy8gY2FzZXMuIEZhaWwgZ3JhY2VmdWxseSBpZiBpdCBkb2VzIG5vdCB3b3JrLlxuICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlSlNPTihhcmdzOiBBcnJheTxhbnk+LCB2YWx1ZTogc3RyaW5nKTogYW55IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEludmFsaWQgSlNPTiByZXN1bHQgZnJvbSBmbG93ICR7YXJncy5qb2luKCcgJyl9LiBKU09OOlxcbicke3ZhbHVlfScuYCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuIl19