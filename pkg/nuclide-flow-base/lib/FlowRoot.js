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
//# sourceMappingURL=data:application/json;base64,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b3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtTZXJ2ZXJTdGF0dXNUeXBlfSBmcm9tICcuLic7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGlhZ25vc3RpY3MsXG4gIExvYyxcbiAgRmxvd091dGxpbmVUcmVlLFxufSBmcm9tICcuLic7XG5cbmltcG9ydCB7ZmlsdGVyfSBmcm9tICdmdXp6YWxkcmluJztcblxuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5pbXBvcnQge1xuICBpbnNlcnRBdXRvY29tcGxldGVUb2tlbixcbiAgcHJvY2Vzc0F1dG9jb21wbGV0ZUl0ZW0sXG59IGZyb20gJy4vRmxvd0hlbHBlcnMnO1xuXG5pbXBvcnQge0Zsb3dQcm9jZXNzfSBmcm9tICcuL0Zsb3dQcm9jZXNzJztcblxuaW1wb3J0IHthc3RUb091dGxpbmV9IGZyb20gJy4vYXN0VG9PdXRsaW5lJztcbmltcG9ydCB7Zmxvd1N0YXR1c091dHB1dFRvRGlhZ25vc3RpY3N9IGZyb20gJy4vZGlhZ25vc3RpY3NQYXJzZXInO1xuXG4vKiogRW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgc3RhdGUgaW5mb3JtYXRpb24gd2UgbmVlZCBhYm91dCBhIHNwZWNpZmljIEZsb3cgcm9vdCAqL1xuZXhwb3J0IGNsYXNzIEZsb3dSb290IHtcbiAgLy8gVGhlIHBhdGggdG8gdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGUgLmZsb3djb25maWcgaXMgLS0gaS5lLiB0aGUgcm9vdCBvZiB0aGUgRmxvdyBwcm9qZWN0LlxuICBfcm9vdDogc3RyaW5nO1xuICBfcHJvY2VzczogRmxvd1Byb2Nlc3M7XG5cbiAgY29uc3RydWN0b3Iocm9vdDogc3RyaW5nKSB7XG4gICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgdGhpcy5fcHJvY2VzcyA9IG5ldyBGbG93UHJvY2Vzcyhyb290KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvY2Vzcy5kaXNwb3NlKCk7XG4gIH1cblxuICBhbGxvd1NlcnZlclJlc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvY2Vzcy5hbGxvd1NlcnZlclJlc3RhcnQoKTtcbiAgfVxuXG4gIGdldFBhdGhUb1Jvb3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcm9vdDtcbiAgfVxuXG4gIGdldFNlcnZlclN0YXR1c1VwZGF0ZXMoKTogT2JzZXJ2YWJsZTxTZXJ2ZXJTdGF0dXNUeXBlPiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3MuZ2V0U2VydmVyU3RhdHVzVXBkYXRlcygpO1xuICB9XG5cbiAgYXN5bmMgZmxvd0ZpbmREZWZpbml0aW9uKFxuICAgIGZpbGU6IE51Y2xpZGVVcmksXG4gICAgY3VycmVudENvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICApOiBQcm9taXNlPD9Mb2M+IHtcbiAgICBjb25zdCBvcHRpb25zID0ge307XG4gICAgLy8gV2UgcGFzcyB0aGUgY3VycmVudCBjb250ZW50cyBvZiB0aGUgYnVmZmVyIHRvIEZsb3cgdmlhIHN0ZGluLlxuICAgIC8vIFRoaXMgbWFrZXMgaXQgcG9zc2libGUgZm9yIGdldC1kZWYgdG8gb3BlcmF0ZSBvbiB0aGUgdW5zYXZlZCBjb250ZW50IGluXG4gICAgLy8gdGhlIHVzZXIncyBlZGl0b3IgcmF0aGVyIHRoYW4gd2hhdCBpcyBzYXZlZCBvbiBkaXNrLiBJdCB3b3VsZCBiZSBhbm5veWluZ1xuICAgIC8vIGlmIHRoZSB1c2VyIGhhZCB0byBzYXZlIGJlZm9yZSB1c2luZyB0aGUganVtcC10by1kZWZpbml0aW9uIGZlYXR1cmUgdG9cbiAgICAvLyBlbnN1cmUgaGUgb3Igc2hlIGdvdCBhY2N1cmF0ZSByZXN1bHRzLlxuICAgIG9wdGlvbnMuc3RkaW4gPSBjdXJyZW50Q29udGVudHM7XG5cbiAgICBjb25zdCBhcmdzID0gWydnZXQtZGVmJywgJy0tanNvbicsICctLXBhdGgnLCBmaWxlLCBsaW5lLCBjb2x1bW5dO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzLmV4ZWNGbG93KGFyZ3MsIG9wdGlvbnMsIGZpbGUpO1xuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBjb25zdCBqc29uID0gcGFyc2VKU09OKGFyZ3MsIHJlc3VsdC5zdGRvdXQpO1xuICAgICAgaWYgKGpzb25bJ3BhdGgnXSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZpbGU6IGpzb25bJ3BhdGgnXSxcbiAgICAgICAgICBwb2ludDoge1xuICAgICAgICAgICAgbGluZToganNvblsnbGluZSddIC0gMSxcbiAgICAgICAgICAgIGNvbHVtbjoganNvblsnc3RhcnQnXSAtIDEsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBjdXJyZW50Q29udGVudHMgaXMgbnVsbCwgaXQgbWVhbnMgdGhhdCB0aGUgZmlsZSBoYXMgbm90IGNoYW5nZWQgc2luY2VcbiAgICogaXQgaGFzIGJlZW4gc2F2ZWQsIHNvIHdlIGNhbiBhdm9pZCBwaXBpbmcgdGhlIHdob2xlIGNvbnRlbnRzIHRvIHRoZSBGbG93XG4gICAqIHByb2Nlc3MuXG4gICAqL1xuICBhc3luYyBmbG93RmluZERpYWdub3N0aWNzKFxuICAgIGZpbGU6IE51Y2xpZGVVcmksXG4gICAgY3VycmVudENvbnRlbnRzOiA/c3RyaW5nLFxuICApOiBQcm9taXNlPD9EaWFnbm9zdGljcz4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICAgIGxldCBhcmdzO1xuICAgIGlmIChjdXJyZW50Q29udGVudHMpIHtcbiAgICAgIG9wdGlvbnMuc3RkaW4gPSBjdXJyZW50Q29udGVudHM7XG5cbiAgICAgIC8vIEN1cnJlbnRseSwgYGZsb3cgY2hlY2stY29udGVudHNgIHJldHVybnMgYWxsIG9mIHRoZSBlcnJvcnMgaW4gdGhlXG4gICAgICAvLyBwcm9qZWN0LiBJdCB3b3VsZCBiZSBuaWNlIGlmIGl0IHdvdWxkIHVzZSB0aGUgcGF0aCBmb3IgZmlsdGVyaW5nLCBhc1xuICAgICAgLy8gY3VycmVudGx5IHRoZSBjbGllbnQgaGFzIHRvIGRvIHRoZSBmaWx0ZXJpbmcuXG4gICAgICBhcmdzID0gWydjaGVjay1jb250ZW50cycsICctLWpzb24nLCBmaWxlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2UgY2FuIGp1c3QgdXNlIGBmbG93IHN0YXR1c2AgaWYgdGhlIGNvbnRlbnRzIGFyZSB1bmNoYW5nZWQuXG4gICAgICBhcmdzID0gWydzdGF0dXMnLCAnLS1qc29uJywgZmlsZV07XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdDtcblxuICAgIHRyeSB7XG4gICAgICAvLyBEb24ndCBsb2cgZXJyb3JzIGlmIHRoZSBjb21tYW5kIHJldHVybnMgYSBub256ZXJvIGV4aXQgY29kZSwgYmVjYXVzZSBzdGF0dXMgcmV0dXJucyBub256ZXJvXG4gICAgICAvLyBpZiBpdCBpcyByZXBvcnRpbmcgYW55IGlzc3VlcywgZXZlbiB3aGVuIGl0IHN1Y2NlZWRzLlxuICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzcy5leGVjRmxvdyhhcmdzLCBvcHRpb25zLCBmaWxlLCAvKiB3YWl0Rm9yU2VydmVyICovIHRydWUpO1xuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gVGhpcyBjb2RlcGF0aCB3aWxsIGJlIGV4ZXJjaXNlZCB3aGVuIEZsb3cgZmluZHMgdHlwZSBlcnJvcnMgYXMgdGhlXG4gICAgICAvLyBleGl0IGNvZGUgd2lsbCBiZSBub24temVyby4gTm90ZSB0aGlzIGNvZGVwYXRoIGNvdWxkIGFsc28gYmUgZXhlcmNpc2VkXG4gICAgICAvLyBkdWUgdG8gYSBsb2dpY2FsIGVycm9yIGluIE51Y2xpZGUsIHNvIHdlIHRyeSB0byBkaWZmZXJlbnRpYXRlLlxuICAgICAgaWYgKGUuZXhpdENvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXN1bHQgPSBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQganNvbjtcbiAgICB0cnkge1xuICAgICAganNvbiA9IHBhcnNlSlNPTihhcmdzLCByZXN1bHQuc3Rkb3V0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gZmxvd1N0YXR1c091dHB1dFRvRGlhZ25vc3RpY3ModGhpcy5fcm9vdCwganNvbik7XG4gIH1cblxuICBhc3luYyBmbG93R2V0QXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnMoXG4gICAgZmlsZTogTnVjbGlkZVVyaSxcbiAgICBjdXJyZW50Q29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICAgcHJlZml4OiBzdHJpbmcsXG4gICAgYWN0aXZhdGVkTWFudWFsbHk6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgLy8gV2UgbWF5IHdhbnQgdG8gbWFrZSB0aGlzIGNvbmZpZ3VyYWJsZSwgYnV0IGlmIGl0IGlzIGV2ZXIgaGlnaGVyIHRoYW4gb25lIHdlIG5lZWQgdG8gbWFrZSBzdXJlXG4gICAgLy8gaXQgd29ya3MgcHJvcGVybHkgd2hlbiB0aGUgdXNlciBtYW51YWxseSBhY3RpdmF0ZXMgaXQgKGUuZy4gd2l0aCBjdHJsK3NwYWNlKS4gU2VlXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvaXNzdWVzLzU5N1xuICAgIC8vXG4gICAgLy8gSWYgdGhpcyBpcyBtYWRlIGNvbmZpZ3VyYWJsZSwgY29uc2lkZXIgdXNpbmcgYXV0b2NvbXBsZXRlLXBsdXMnIG1pbmltdW1Xb3JkTGVuZ3RoIHNldHRpbmcsIGFzXG4gICAgLy8gcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL2lzc3Vlcy81OTRcbiAgICBjb25zdCBtaW5pbXVtUHJlZml4TGVuZ3RoID0gMTtcblxuICAgIC8vIEFsbG93cyBjb21wbGV0aW9ucyB0byBpbW1lZGlhdGVseSBhcHBlYXIgd2hlbiB3ZSBhcmUgY29tcGxldGluZyBvZmYgb2Ygb2JqZWN0IHByb3BlcnRpZXMuXG4gICAgLy8gVGhpcyBhbHNvIG5lZWRzIHRvIGJlIGNoYW5nZWQgaWYgbWluaW11bVByZWZpeExlbmd0aCBnb2VzIGFib3ZlIDEsIHNpbmNlIGFmdGVyIHlvdSB0eXBlIGFcbiAgICAvLyBzaW5nbGUgYWxwaGFudW1lcmljIGNoYXJhY3RlciwgYXV0b2NvbXBsZXRlLXBsdXMgbm8gbG9uZ2VyIGluY2x1ZGVzIHRoZSBkb3QgaW4gdGhlIHByZWZpeC5cbiAgICBjb25zdCBwcmVmaXhIYXNEb3QgPSBwcmVmaXguaW5kZXhPZignLicpICE9PSAtMTtcblxuICAgIC8vIElmIGl0IGlzIGp1c3Qgd2hpdGVzcGFjZSBhbmQgcHVuY3R1YXRpb24sIGlnbm9yZSBpdCAodGhpcyBrZWVwcyB1c1xuICAgIC8vIGZyb20gZWF0aW5nIGxlYWRpbmcgZG90cykuXG4gICAgY29uc3QgcmVwbGFjZW1lbnRQcmVmaXggPSAvXltcXHMuXSokLy50ZXN0KHByZWZpeCkgPyAnJyA6IHByZWZpeDtcblxuICAgIGlmICghYWN0aXZhdGVkTWFudWFsbHkgJiYgIXByZWZpeEhhc0RvdCAmJiByZXBsYWNlbWVudFByZWZpeC5sZW5ndGggPCBtaW5pbXVtUHJlZml4TGVuZ3RoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gICAgY29uc3QgYXJncyA9IFsnYXV0b2NvbXBsZXRlJywgJy0tanNvbicsIGZpbGVdO1xuXG4gICAgb3B0aW9ucy5zdGRpbiA9IGluc2VydEF1dG9jb21wbGV0ZVRva2VuKGN1cnJlbnRDb250ZW50cywgbGluZSwgY29sdW1uKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzcy5leGVjRmxvdyhhcmdzLCBvcHRpb25zLCBmaWxlKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGpzb24gPSBwYXJzZUpTT04oYXJncywgcmVzdWx0LnN0ZG91dCk7XG4gICAgICBsZXQgcmVzdWx0c0FycmF5O1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoanNvbikpIHtcbiAgICAgICAgLy8gRmxvdyA8IHYwLjIwLjBcbiAgICAgICAgcmVzdWx0c0FycmF5ID0ganNvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZsb3cgPj0gdjAuMjAuMC4gVGhlIG91dHB1dCBmb3JtYXQgd2FzIGNoYW5nZWQgdG8gc3VwcG9ydCBtb3JlIGRldGFpbGVkIGZhaWx1cmVcbiAgICAgICAgLy8gaW5mb3JtYXRpb24uXG4gICAgICAgIHJlc3VsdHNBcnJheSA9IGpzb24ucmVzdWx0O1xuICAgICAgfVxuICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IHJlc3VsdHNBcnJheS5tYXAoaXRlbSA9PiBwcm9jZXNzQXV0b2NvbXBsZXRlSXRlbShyZXBsYWNlbWVudFByZWZpeCwgaXRlbSkpO1xuICAgICAgcmV0dXJuIGZpbHRlcihjYW5kaWRhdGVzLCByZXBsYWNlbWVudFByZWZpeCwgeyBrZXk6ICdkaXNwbGF5VGV4dCcgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZsb3dHZXRUeXBlKFxuICAgIGZpbGU6IE51Y2xpZGVVcmksXG4gICAgY3VycmVudENvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICAgIGluY2x1ZGVSYXdUeXBlOiBib29sZWFuLFxuICApOiBQcm9taXNlPD97dHlwZTogc3RyaW5nOyByYXdUeXBlOiA/c3RyaW5nfT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICAgIG9wdGlvbnMuc3RkaW4gPSBjdXJyZW50Q29udGVudHM7XG5cbiAgICBsaW5lID0gbGluZSArIDE7XG4gICAgY29sdW1uID0gY29sdW1uICsgMTtcbiAgICBjb25zdCBhcmdzID1cbiAgICAgIFsndHlwZS1hdC1wb3MnLCAnLS1qc29uJywgJy0tcGF0aCcsIGZpbGUsIGxpbmUsIGNvbHVtbl07XG4gICAgaWYgKGluY2x1ZGVSYXdUeXBlKSB7XG4gICAgICBhcmdzLnB1c2goJy0tcmF3Jyk7XG4gICAgfVxuXG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzcy5leGVjRmxvdyhhcmdzLCBvcHRpb25zLCBmaWxlKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgb3V0cHV0ID0gcmVzdWx0LnN0ZG91dDtcbiAgICAgIGlmIChvdXRwdXQgPT09ICcnKSB7XG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgc3ludGF4IGVycm9yLCBGbG93IHJldHVybnMgdGhlIEpTT04gb24gc3RkZXJyIHdoaWxlXG4gICAgICAgIC8vIHN0aWxsIHJldHVybmluZyBhIDAgZXhpdCBjb2RlICh0ODAxODU5NSlcbiAgICAgICAgb3V0cHV0ID0gcmVzdWx0LnN0ZGVycjtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IGpzb247XG4gICAgdHJ5IHtcbiAgICAgIGpzb24gPSBwYXJzZUpTT04oYXJncywgb3V0cHV0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdHlwZSA9IGpzb25bJ3R5cGUnXTtcbiAgICBjb25zdCByYXdUeXBlID0ganNvblsncmF3X3R5cGUnXTtcbiAgICBpZiAoIXR5cGUgfHwgdHlwZSA9PT0gJyh1bmtub3duKScgfHwgdHlwZSA9PT0gJycpIHtcbiAgICAgIGlmICh0eXBlID09PSAnJykge1xuICAgICAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuLiBUaGUgRmxvdyB0ZWFtIGJlbGlldmVzIGl0J3MgYW4gZXJyb3IgaW4gRmxvd1xuICAgICAgICAvLyBpZiBpdCBkb2VzLiBJJ20gbGVhdmluZyB0aGUgY29uZGl0aW9uIGhlcmUgYmVjYXVzZSBpdCB1c2VkIHRvIGhhcHBlblxuICAgICAgICAvLyBiZWZvcmUgdGhlIHN3aXRjaCB0byBKU09OIGFuZCBJJ2QgcmF0aGVyIGxvZyBzb21ldGhpbmcgdGhhbiBoYXZlIHRoZVxuICAgICAgICAvLyB1c2VyIGV4cGVyaWVuY2UgcmVncmVzcyBpbiBjYXNlIEknbSB3cm9uZy5cbiAgICAgICAgbG9nZ2VyLmVycm9yKCdSZWNlaXZlZCBlbXB0eSB0eXBlIGhpbnQgZnJvbSBgZmxvdyB0eXBlLWF0LXBvc2AnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge3R5cGUsIHJhd1R5cGV9O1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGZsb3dHZXRPdXRsaW5lKGN1cnJlbnRDb250ZW50czogc3RyaW5nKTogUHJvbWlzZTw/QXJyYXk8Rmxvd091dGxpbmVUcmVlPj4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBzdGRpbjogY3VycmVudENvbnRlbnRzLFxuICAgIH07XG5cbiAgICBjb25zdCBhcmdzID0gWydhc3QnXTtcblxuICAgIGxldCBqc29uO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBGbG93UHJvY2Vzcy5leGVjRmxvd0NsaWVudChhcmdzLCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGpzb24gPSBwYXJzZUpTT04oYXJncywgcmVzdWx0LnN0ZG91dCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLndhcm4oZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGFzdFRvT3V0bGluZShqc29uKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBUcmF2ZXJzaW5nIHRoZSBBU1QgaXMgYW4gZXJyb3ItcHJvbmUgcHJvY2VzcyBhbmQgaXQncyBoYXJkIHRvIGJlIHN1cmUgd2UndmUgaGFuZGxlZCBhbGwgdGhlXG4gICAgICAvLyBjYXNlcy4gRmFpbCBncmFjZWZ1bGx5IGlmIGl0IGRvZXMgbm90IHdvcmsuXG4gICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VKU09OKGFyZ3M6IEFycmF5PGFueT4sIHZhbHVlOiBzdHJpbmcpOiBhbnkge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGxvZ2dlci5lcnJvcihgSW52YWxpZCBKU09OIHJlc3VsdCBmcm9tIGZsb3cgJHthcmdzLmpvaW4oJyAnKX0uIEpTT046XFxuJyR7dmFsdWV9Jy5gKTtcbiAgICB0aHJvdyBlO1xuICB9XG59XG4iXX0=