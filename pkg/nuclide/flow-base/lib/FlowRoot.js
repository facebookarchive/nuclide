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

var _logging = require('../../logging');

var _FlowHelpersJs = require('./FlowHelpers.js');

var _FlowProcess = require('./FlowProcess');

var _astToOutline = require('./astToOutline');

/** Encapsulates all of the state information we need about a specific Flow root */

var logger = (0, _logging.getLogger)();

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
            line: json['line'] - 1,
            column: json['start'] - 1
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

      var messages = json['errors'].map(function (diagnostic) {
        var message = diagnostic['message'];
        // `message` is a list of message components
        message.forEach(function (component) {
          if (!component.path) {
            // Use a consistent 'falsy' value for the empty string, undefined, etc. Flow returns the
            // empty string instead of null when there is no relevant path.
            // TODO(t8644340) Remove this when Flow is fixed.
            delete component.path;
          }
        });
        var operation = diagnostic['operation'];
        if (operation != null) {
          // The operation field provides additional context. I don't fully understand the motivation
          // behind separating it out, but prepending it with 'See also: ' and adding it to the end of
          // the messages is what the Flow team recommended.
          operation['descr'] = 'See also: ' + operation['descr'];
          operation['level'] = message[0]['level'];
          message.push(operation);
        }
        return message;
      });

      return {
        flowRoot: this._root,
        messages: messages
      };
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

      options.stdin = (0, _FlowHelpersJs.insertAutocompleteToken)(currentContents, line, column);
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
          return (0, _FlowHelpersJs.processAutocompleteItem)(replacementPrefix, item);
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixjQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2YsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFJO0FBQ0YsZUFBTyxnQ0FBYSxJQUFJLENBQUMsQ0FBQztPQUMzQixDQUFDLE9BQU8sQ0FBQyxFQUFFOzs7QUFHVixjQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7O1NBeFJVLFFBQVE7Ozs7O0FBMlJyQixTQUFTLFNBQVMsQ0FBQyxJQUFnQixFQUFFLEtBQWEsRUFBTztBQUN2RCxNQUFJO0FBQ0YsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQzFCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixVQUFNLENBQUMsS0FBSyxvQ0FBa0MsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQWEsS0FBSyxTQUFLLENBQUM7QUFDcEYsVUFBTSxDQUFDLENBQUM7R0FDVDtDQUNGIiwiZmlsZSI6IkZsb3dSb290LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtTZXJ2ZXJTdGF0dXNUeXBlfSBmcm9tICcuL0Zsb3dTZXJ2aWNlJztcblxuaW1wb3J0IHR5cGUge1xuICBEaWFnbm9zdGljcyxcbiAgTG9jLFxuICBGbG93T3V0bGluZVRyZWUsXG59IGZyb20gJy4vRmxvd1NlcnZpY2UnO1xuXG5pbXBvcnQge2ZpbHRlcn0gZnJvbSAnZnV6emFsZHJpbic7XG5cblxuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmltcG9ydCB7XG4gIGluc2VydEF1dG9jb21wbGV0ZVRva2VuLFxuICBwcm9jZXNzQXV0b2NvbXBsZXRlSXRlbSxcbn0gZnJvbSAnLi9GbG93SGVscGVycy5qcyc7XG5cbmltcG9ydCB7Rmxvd1Byb2Nlc3N9IGZyb20gJy4vRmxvd1Byb2Nlc3MnO1xuXG5pbXBvcnQge2FzdFRvT3V0bGluZX0gZnJvbSAnLi9hc3RUb091dGxpbmUnO1xuXG4vKiogRW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgc3RhdGUgaW5mb3JtYXRpb24gd2UgbmVlZCBhYm91dCBhIHNwZWNpZmljIEZsb3cgcm9vdCAqL1xuZXhwb3J0IGNsYXNzIEZsb3dSb290IHtcbiAgLy8gVGhlIHBhdGggdG8gdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGUgLmZsb3djb25maWcgaXMgLS0gaS5lLiB0aGUgcm9vdCBvZiB0aGUgRmxvdyBwcm9qZWN0LlxuICBfcm9vdDogc3RyaW5nO1xuICBfcHJvY2VzczogRmxvd1Byb2Nlc3M7XG5cbiAgY29uc3RydWN0b3Iocm9vdDogc3RyaW5nKSB7XG4gICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgdGhpcy5fcHJvY2VzcyA9IG5ldyBGbG93UHJvY2Vzcyhyb290KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvY2Vzcy5kaXNwb3NlKCk7XG4gIH1cblxuICBhbGxvd1NlcnZlclJlc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvY2Vzcy5hbGxvd1NlcnZlclJlc3RhcnQoKTtcbiAgfVxuXG4gIGdldFBhdGhUb1Jvb3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcm9vdDtcbiAgfVxuXG4gIGdldFNlcnZlclN0YXR1c1VwZGF0ZXMoKTogT2JzZXJ2YWJsZTxTZXJ2ZXJTdGF0dXNUeXBlPiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3MuZ2V0U2VydmVyU3RhdHVzVXBkYXRlcygpO1xuICB9XG5cbiAgYXN5bmMgZmxvd0ZpbmREZWZpbml0aW9uKFxuICAgIGZpbGU6IE51Y2xpZGVVcmksXG4gICAgY3VycmVudENvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICApOiBQcm9taXNlPD9Mb2M+IHtcbiAgICBjb25zdCBvcHRpb25zID0ge307XG4gICAgLy8gV2UgcGFzcyB0aGUgY3VycmVudCBjb250ZW50cyBvZiB0aGUgYnVmZmVyIHRvIEZsb3cgdmlhIHN0ZGluLlxuICAgIC8vIFRoaXMgbWFrZXMgaXQgcG9zc2libGUgZm9yIGdldC1kZWYgdG8gb3BlcmF0ZSBvbiB0aGUgdW5zYXZlZCBjb250ZW50IGluXG4gICAgLy8gdGhlIHVzZXIncyBlZGl0b3IgcmF0aGVyIHRoYW4gd2hhdCBpcyBzYXZlZCBvbiBkaXNrLiBJdCB3b3VsZCBiZSBhbm5veWluZ1xuICAgIC8vIGlmIHRoZSB1c2VyIGhhZCB0byBzYXZlIGJlZm9yZSB1c2luZyB0aGUganVtcC10by1kZWZpbml0aW9uIGZlYXR1cmUgdG9cbiAgICAvLyBlbnN1cmUgaGUgb3Igc2hlIGdvdCBhY2N1cmF0ZSByZXN1bHRzLlxuICAgIG9wdGlvbnMuc3RkaW4gPSBjdXJyZW50Q29udGVudHM7XG5cbiAgICBjb25zdCBhcmdzID0gWydnZXQtZGVmJywgJy0tanNvbicsICctLXBhdGgnLCBmaWxlLCBsaW5lLCBjb2x1bW5dO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzLmV4ZWNGbG93KGFyZ3MsIG9wdGlvbnMsIGZpbGUpO1xuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBjb25zdCBqc29uID0gcGFyc2VKU09OKGFyZ3MsIHJlc3VsdC5zdGRvdXQpO1xuICAgICAgaWYgKGpzb25bJ3BhdGgnXSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZpbGU6IGpzb25bJ3BhdGgnXSxcbiAgICAgICAgICBsaW5lOiBqc29uWydsaW5lJ10gLSAxLFxuICAgICAgICAgIGNvbHVtbjoganNvblsnc3RhcnQnXSAtIDEsXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSWYgY3VycmVudENvbnRlbnRzIGlzIG51bGwsIGl0IG1lYW5zIHRoYXQgdGhlIGZpbGUgaGFzIG5vdCBjaGFuZ2VkIHNpbmNlXG4gICAqIGl0IGhhcyBiZWVuIHNhdmVkLCBzbyB3ZSBjYW4gYXZvaWQgcGlwaW5nIHRoZSB3aG9sZSBjb250ZW50cyB0byB0aGUgRmxvd1xuICAgKiBwcm9jZXNzLlxuICAgKi9cbiAgYXN5bmMgZmxvd0ZpbmREaWFnbm9zdGljcyhcbiAgICBmaWxlOiBOdWNsaWRlVXJpLFxuICAgIGN1cnJlbnRDb250ZW50czogP3N0cmluZyxcbiAgKTogUHJvbWlzZTw/RGlhZ25vc3RpY3M+IHtcbiAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICBsZXQgYXJncztcbiAgICBpZiAoY3VycmVudENvbnRlbnRzKSB7XG4gICAgICBvcHRpb25zLnN0ZGluID0gY3VycmVudENvbnRlbnRzO1xuXG4gICAgICAvLyBDdXJyZW50bHksIGBmbG93IGNoZWNrLWNvbnRlbnRzYCByZXR1cm5zIGFsbCBvZiB0aGUgZXJyb3JzIGluIHRoZVxuICAgICAgLy8gcHJvamVjdC4gSXQgd291bGQgYmUgbmljZSBpZiBpdCB3b3VsZCB1c2UgdGhlIHBhdGggZm9yIGZpbHRlcmluZywgYXNcbiAgICAgIC8vIGN1cnJlbnRseSB0aGUgY2xpZW50IGhhcyB0byBkbyB0aGUgZmlsdGVyaW5nLlxuICAgICAgYXJncyA9IFsnY2hlY2stY29udGVudHMnLCAnLS1qc29uJywgZmlsZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIGNhbiBqdXN0IHVzZSBgZmxvdyBzdGF0dXNgIGlmIHRoZSBjb250ZW50cyBhcmUgdW5jaGFuZ2VkLlxuICAgICAgYXJncyA9IFsnc3RhdHVzJywgJy0tanNvbicsIGZpbGVdO1xuICAgIH1cblxuICAgIGxldCByZXN1bHQ7XG5cbiAgICB0cnkge1xuICAgICAgLy8gRG9uJ3QgbG9nIGVycm9ycyBpZiB0aGUgY29tbWFuZCByZXR1cm5zIGEgbm9uemVybyBleGl0IGNvZGUsIGJlY2F1c2Ugc3RhdHVzIHJldHVybnMgbm9uemVyb1xuICAgICAgLy8gaWYgaXQgaXMgcmVwb3J0aW5nIGFueSBpc3N1ZXMsIGV2ZW4gd2hlbiBpdCBzdWNjZWVkcy5cbiAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuX3Byb2Nlc3MuZXhlY0Zsb3coYXJncywgb3B0aW9ucywgZmlsZSwgLyogd2FpdEZvclNlcnZlciAqLyB0cnVlKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRoaXMgY29kZXBhdGggd2lsbCBiZSBleGVyY2lzZWQgd2hlbiBGbG93IGZpbmRzIHR5cGUgZXJyb3JzIGFzIHRoZVxuICAgICAgLy8gZXhpdCBjb2RlIHdpbGwgYmUgbm9uLXplcm8uIE5vdGUgdGhpcyBjb2RlcGF0aCBjb3VsZCBhbHNvIGJlIGV4ZXJjaXNlZFxuICAgICAgLy8gZHVlIHRvIGEgbG9naWNhbCBlcnJvciBpbiBOdWNsaWRlLCBzbyB3ZSB0cnkgdG8gZGlmZmVyZW50aWF0ZS5cbiAgICAgIGlmIChlLmV4aXRDb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVzdWx0ID0gZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGpzb247XG4gICAgdHJ5IHtcbiAgICAgIGpzb24gPSBwYXJzZUpTT04oYXJncywgcmVzdWx0LnN0ZG91dCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbWVzc2FnZXMgPSBqc29uWydlcnJvcnMnXS5tYXAoZGlhZ25vc3RpYyA9PiB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZGlhZ25vc3RpY1snbWVzc2FnZSddO1xuICAgICAgLy8gYG1lc3NhZ2VgIGlzIGEgbGlzdCBvZiBtZXNzYWdlIGNvbXBvbmVudHNcbiAgICAgIG1lc3NhZ2UuZm9yRWFjaChjb21wb25lbnQgPT4ge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5wYXRoKSB7XG4gICAgICAgICAgLy8gVXNlIGEgY29uc2lzdGVudCAnZmFsc3knIHZhbHVlIGZvciB0aGUgZW1wdHkgc3RyaW5nLCB1bmRlZmluZWQsIGV0Yy4gRmxvdyByZXR1cm5zIHRoZVxuICAgICAgICAgIC8vIGVtcHR5IHN0cmluZyBpbnN0ZWFkIG9mIG51bGwgd2hlbiB0aGVyZSBpcyBubyByZWxldmFudCBwYXRoLlxuICAgICAgICAgIC8vIFRPRE8odDg2NDQzNDApIFJlbW92ZSB0aGlzIHdoZW4gRmxvdyBpcyBmaXhlZC5cbiAgICAgICAgICBkZWxldGUgY29tcG9uZW50LnBhdGg7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3Qgb3BlcmF0aW9uID0gZGlhZ25vc3RpY1snb3BlcmF0aW9uJ107XG4gICAgICBpZiAob3BlcmF0aW9uICE9IG51bGwpIHtcbiAgICAgICAgLy8gVGhlIG9wZXJhdGlvbiBmaWVsZCBwcm92aWRlcyBhZGRpdGlvbmFsIGNvbnRleHQuIEkgZG9uJ3QgZnVsbHkgdW5kZXJzdGFuZCB0aGUgbW90aXZhdGlvblxuICAgICAgICAvLyBiZWhpbmQgc2VwYXJhdGluZyBpdCBvdXQsIGJ1dCBwcmVwZW5kaW5nIGl0IHdpdGggJ1NlZSBhbHNvOiAnIGFuZCBhZGRpbmcgaXQgdG8gdGhlIGVuZCBvZlxuICAgICAgICAvLyB0aGUgbWVzc2FnZXMgaXMgd2hhdCB0aGUgRmxvdyB0ZWFtIHJlY29tbWVuZGVkLlxuICAgICAgICBvcGVyYXRpb25bJ2Rlc2NyJ10gPSAnU2VlIGFsc286ICcgKyBvcGVyYXRpb25bJ2Rlc2NyJ107XG4gICAgICAgIG9wZXJhdGlvblsnbGV2ZWwnXSA9IG1lc3NhZ2VbMF1bJ2xldmVsJ107XG4gICAgICAgIG1lc3NhZ2UucHVzaChvcGVyYXRpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZmxvd1Jvb3Q6IHRoaXMuX3Jvb3QsXG4gICAgICBtZXNzYWdlczogbWVzc2FnZXMsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGZsb3dHZXRBdXRvY29tcGxldGVTdWdnZXN0aW9ucyhcbiAgICBmaWxlOiBOdWNsaWRlVXJpLFxuICAgIGN1cnJlbnRDb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgICBwcmVmaXg6IHN0cmluZyxcbiAgICBhY3RpdmF0ZWRNYW51YWxseTogYm9vbGVhbixcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBXZSBtYXkgd2FudCB0byBtYWtlIHRoaXMgY29uZmlndXJhYmxlLCBidXQgaWYgaXQgaXMgZXZlciBoaWdoZXIgdGhhbiBvbmUgd2UgbmVlZCB0byBtYWtlIHN1cmVcbiAgICAvLyBpdCB3b3JrcyBwcm9wZXJseSB3aGVuIHRoZSB1c2VyIG1hbnVhbGx5IGFjdGl2YXRlcyBpdCAoZS5nLiB3aXRoIGN0cmwrc3BhY2UpLiBTZWVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdXRvY29tcGxldGUtcGx1cy9pc3N1ZXMvNTk3XG4gICAgLy9cbiAgICAvLyBJZiB0aGlzIGlzIG1hZGUgY29uZmlndXJhYmxlLCBjb25zaWRlciB1c2luZyBhdXRvY29tcGxldGUtcGx1cycgbWluaW11bVdvcmRMZW5ndGggc2V0dGluZywgYXNcbiAgICAvLyBwZXIgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvaXNzdWVzLzU5NFxuICAgIGNvbnN0IG1pbmltdW1QcmVmaXhMZW5ndGggPSAxO1xuXG4gICAgLy8gQWxsb3dzIGNvbXBsZXRpb25zIHRvIGltbWVkaWF0ZWx5IGFwcGVhciB3aGVuIHdlIGFyZSBjb21wbGV0aW5nIG9mZiBvZiBvYmplY3QgcHJvcGVydGllcy5cbiAgICAvLyBUaGlzIGFsc28gbmVlZHMgdG8gYmUgY2hhbmdlZCBpZiBtaW5pbXVtUHJlZml4TGVuZ3RoIGdvZXMgYWJvdmUgMSwgc2luY2UgYWZ0ZXIgeW91IHR5cGUgYVxuICAgIC8vIHNpbmdsZSBhbHBoYW51bWVyaWMgY2hhcmFjdGVyLCBhdXRvY29tcGxldGUtcGx1cyBubyBsb25nZXIgaW5jbHVkZXMgdGhlIGRvdCBpbiB0aGUgcHJlZml4LlxuICAgIGNvbnN0IHByZWZpeEhhc0RvdCA9IHByZWZpeC5pbmRleE9mKCcuJykgIT09IC0xO1xuXG4gICAgLy8gSWYgaXQgaXMganVzdCB3aGl0ZXNwYWNlIGFuZCBwdW5jdHVhdGlvbiwgaWdub3JlIGl0ICh0aGlzIGtlZXBzIHVzXG4gICAgLy8gZnJvbSBlYXRpbmcgbGVhZGluZyBkb3RzKS5cbiAgICBjb25zdCByZXBsYWNlbWVudFByZWZpeCA9IC9eW1xccy5dKiQvLnRlc3QocHJlZml4KSA/ICcnIDogcHJlZml4O1xuXG4gICAgaWYgKCFhY3RpdmF0ZWRNYW51YWxseSAmJiAhcHJlZml4SGFzRG90ICYmIHJlcGxhY2VtZW50UHJlZml4Lmxlbmd0aCA8IG1pbmltdW1QcmVmaXhMZW5ndGgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICBjb25zdCBhcmdzID0gWydhdXRvY29tcGxldGUnLCAnLS1qc29uJywgZmlsZV07XG5cbiAgICBvcHRpb25zLnN0ZGluID0gaW5zZXJ0QXV0b2NvbXBsZXRlVG9rZW4oY3VycmVudENvbnRlbnRzLCBsaW5lLCBjb2x1bW4pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzLmV4ZWNGbG93KGFyZ3MsIG9wdGlvbnMsIGZpbGUpO1xuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgY29uc3QganNvbiA9IHBhcnNlSlNPTihhcmdzLCByZXN1bHQuc3Rkb3V0KTtcbiAgICAgIGxldCByZXN1bHRzQXJyYXk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShqc29uKSkge1xuICAgICAgICAvLyBGbG93IDwgdjAuMjAuMFxuICAgICAgICByZXN1bHRzQXJyYXkgPSBqc29uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRmxvdyA+PSB2MC4yMC4wLiBUaGUgb3V0cHV0IGZvcm1hdCB3YXMgY2hhbmdlZCB0byBzdXBwb3J0IG1vcmUgZGV0YWlsZWQgZmFpbHVyZVxuICAgICAgICAvLyBpbmZvcm1hdGlvbi5cbiAgICAgICAgcmVzdWx0c0FycmF5ID0ganNvbi5yZXN1bHQ7XG4gICAgICB9XG4gICAgICBjb25zdCBjYW5kaWRhdGVzID0gcmVzdWx0c0FycmF5Lm1hcChpdGVtID0+IHByb2Nlc3NBdXRvY29tcGxldGVJdGVtKHJlcGxhY2VtZW50UHJlZml4LCBpdGVtKSk7XG4gICAgICByZXR1cm4gZmlsdGVyKGNhbmRpZGF0ZXMsIHJlcGxhY2VtZW50UHJlZml4LCB7IGtleTogJ2Rpc3BsYXlUZXh0JyB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZmxvd0dldFR5cGUoXG4gICAgZmlsZTogTnVjbGlkZVVyaSxcbiAgICBjdXJyZW50Q29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICAgaW5jbHVkZVJhd1R5cGU6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8P3t0eXBlOiBzdHJpbmc7IHJhd1R5cGU6ID9zdHJpbmd9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gICAgb3B0aW9ucy5zdGRpbiA9IGN1cnJlbnRDb250ZW50cztcblxuICAgIGxpbmUgPSBsaW5lICsgMTtcbiAgICBjb2x1bW4gPSBjb2x1bW4gKyAxO1xuICAgIGNvbnN0IGFyZ3MgPVxuICAgICAgWyd0eXBlLWF0LXBvcycsICctLWpzb24nLCAnLS1wYXRoJywgZmlsZSwgbGluZSwgY29sdW1uXTtcbiAgICBpZiAoaW5jbHVkZVJhd1R5cGUpIHtcbiAgICAgIGFyZ3MucHVzaCgnLS1yYXcnKTtcbiAgICB9XG5cbiAgICBsZXQgb3V0cHV0O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzLmV4ZWNGbG93KGFyZ3MsIG9wdGlvbnMsIGZpbGUpO1xuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBvdXRwdXQgPSByZXN1bHQuc3Rkb3V0O1xuICAgICAgaWYgKG91dHB1dCA9PT0gJycpIHtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBzeW50YXggZXJyb3IsIEZsb3cgcmV0dXJucyB0aGUgSlNPTiBvbiBzdGRlcnIgd2hpbGVcbiAgICAgICAgLy8gc3RpbGwgcmV0dXJuaW5nIGEgMCBleGl0IGNvZGUgKHQ4MDE4NTk1KVxuICAgICAgICBvdXRwdXQgPSByZXN1bHQuc3RkZXJyO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQganNvbjtcbiAgICB0cnkge1xuICAgICAganNvbiA9IHBhcnNlSlNPTihhcmdzLCBvdXRwdXQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0eXBlID0ganNvblsndHlwZSddO1xuICAgIGNvbnN0IHJhd1R5cGUgPSBqc29uWydyYXdfdHlwZSddO1xuICAgIGlmICghdHlwZSB8fCB0eXBlID09PSAnKHVua25vd24pJyB8fCB0eXBlID09PSAnJykge1xuICAgICAgaWYgKHR5cGUgPT09ICcnKSB7XG4gICAgICAgIC8vIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW4uIFRoZSBGbG93IHRlYW0gYmVsaWV2ZXMgaXQncyBhbiBlcnJvciBpbiBGbG93XG4gICAgICAgIC8vIGlmIGl0IGRvZXMuIEknbSBsZWF2aW5nIHRoZSBjb25kaXRpb24gaGVyZSBiZWNhdXNlIGl0IHVzZWQgdG8gaGFwcGVuXG4gICAgICAgIC8vIGJlZm9yZSB0aGUgc3dpdGNoIHRvIEpTT04gYW5kIEknZCByYXRoZXIgbG9nIHNvbWV0aGluZyB0aGFuIGhhdmUgdGhlXG4gICAgICAgIC8vIHVzZXIgZXhwZXJpZW5jZSByZWdyZXNzIGluIGNhc2UgSSdtIHdyb25nLlxuICAgICAgICBsb2dnZXIuZXJyb3IoJ1JlY2VpdmVkIGVtcHR5IHR5cGUgaGludCBmcm9tIGBmbG93IHR5cGUtYXQtcG9zYCcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7dHlwZSwgcmF3VHlwZX07XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgZmxvd0dldE91dGxpbmUoY3VycmVudENvbnRlbnRzOiBzdHJpbmcpOiBQcm9taXNlPD9BcnJheTxGbG93T3V0bGluZVRyZWU+PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIHN0ZGluOiBjdXJyZW50Q29udGVudHMsXG4gICAgfTtcblxuICAgIGNvbnN0IGFyZ3MgPSBbJ2FzdCddO1xuXG4gICAgbGV0IGpzb247XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEZsb3dQcm9jZXNzLmV4ZWNGbG93Q2xpZW50KGFyZ3MsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAganNvbiA9IHBhcnNlSlNPTihhcmdzLCByZXN1bHQuc3Rkb3V0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIud2FybihlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXN0VG9PdXRsaW5lKGpzb24pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRyYXZlcnNpbmcgdGhlIEFTVCBpcyBhbiBlcnJvci1wcm9uZSBwcm9jZXNzIGFuZCBpdCdzIGhhcmQgdG8gYmUgc3VyZSB3ZSd2ZSBoYW5kbGVkIGFsbCB0aGVcbiAgICAgIC8vIGNhc2VzLiBGYWlsIGdyYWNlZnVsbHkgaWYgaXQgZG9lcyBub3Qgd29yay5cbiAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZUpTT04oYXJnczogQXJyYXk8YW55PiwgdmFsdWU6IHN0cmluZyk6IGFueSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmVycm9yKGBJbnZhbGlkIEpTT04gcmVzdWx0IGZyb20gZmxvdyAke2FyZ3Muam9pbignICcpfS4gSlNPTjpcXG4nJHt2YWx1ZX0nLmApO1xuICAgIHRocm93IGU7XG4gIH1cbn1cbiJdfQ==