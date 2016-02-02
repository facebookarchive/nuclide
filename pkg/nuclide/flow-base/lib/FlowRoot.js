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
            component.path = null;
          }
        });
        var operation = diagnostic['operation'];
        if (operation != null) {
          // The operation field provides additional context. I don't fully understand the motivation
          // behind separating it out, but prepending it with 'See also: ' and adding it to the end of
          // the messages is what the Flow team recommended.
          operation['descr'] = 'See also: ' + operation['descr'];
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQztBQUMxQixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsVUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssV0FBVyxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7QUFDaEQsWUFBSSxJQUFJLEtBQUssRUFBRSxFQUFFOzs7OztBQUtmLGdCQUFNLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7U0FDbEU7QUFDRCxlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsYUFBTyxFQUFDLElBQUksRUFBSixJQUFJLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxDQUFDO0tBQ3hCOzs7U0E5T1UsUUFBUTs7Ozs7QUFpUHJCLFNBQVMsU0FBUyxDQUFDLElBQWdCLEVBQUUsS0FBYSxFQUFPO0FBQ3ZELE1BQUk7QUFDRixXQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDMUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFVBQU0sQ0FBQyxLQUFLLG9DQUFrQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBYSxLQUFLLFNBQUssQ0FBQztBQUNwRixVQUFNLENBQUMsQ0FBQztHQUNUO0NBQ0YiLCJmaWxlIjoiRmxvd1Jvb3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGlhZ25vc3RpY3MsXG4gIExvYyxcbn0gZnJvbSAnLi9GbG93U2VydmljZSc7XG5cbmltcG9ydCB7ZmlsdGVyfSBmcm9tICdmdXp6YWxkcmluJztcblxuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuaW1wb3J0IHtcbiAgaW5zZXJ0QXV0b2NvbXBsZXRlVG9rZW4sXG4gIHByb2Nlc3NBdXRvY29tcGxldGVJdGVtLFxufSBmcm9tICcuL0Zsb3dIZWxwZXJzLmpzJztcblxuaW1wb3J0IHtGbG93UHJvY2Vzc30gZnJvbSAnLi9GbG93UHJvY2Vzcyc7XG5cbi8qKiBFbmNhcHN1bGF0ZXMgYWxsIG9mIHRoZSBzdGF0ZSBpbmZvcm1hdGlvbiB3ZSBuZWVkIGFib3V0IGEgc3BlY2lmaWMgRmxvdyByb290ICovXG5leHBvcnQgY2xhc3MgRmxvd1Jvb3Qge1xuICAvLyBUaGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSAuZmxvd2NvbmZpZyBpcyAtLSBpLmUuIHRoZSByb290IG9mIHRoZSBGbG93IHByb2plY3QuXG4gIF9yb290OiBzdHJpbmc7XG4gIF9wcm9jZXNzOiBGbG93UHJvY2VzcztcblxuICBjb25zdHJ1Y3Rvcihyb290OiBzdHJpbmcpIHtcbiAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICB0aGlzLl9wcm9jZXNzID0gbmV3IEZsb3dQcm9jZXNzKHJvb3QpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9wcm9jZXNzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGFzeW5jIGZsb3dGaW5kRGVmaW5pdGlvbihcbiAgICBmaWxlOiBOdWNsaWRlVXJpLFxuICAgIGN1cnJlbnRDb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgKTogUHJvbWlzZTw/TG9jPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuICAgIC8vIFdlIHBhc3MgdGhlIGN1cnJlbnQgY29udGVudHMgb2YgdGhlIGJ1ZmZlciB0byBGbG93IHZpYSBzdGRpbi5cbiAgICAvLyBUaGlzIG1ha2VzIGl0IHBvc3NpYmxlIGZvciBnZXQtZGVmIHRvIG9wZXJhdGUgb24gdGhlIHVuc2F2ZWQgY29udGVudCBpblxuICAgIC8vIHRoZSB1c2VyJ3MgZWRpdG9yIHJhdGhlciB0aGFuIHdoYXQgaXMgc2F2ZWQgb24gZGlzay4gSXQgd291bGQgYmUgYW5ub3lpbmdcbiAgICAvLyBpZiB0aGUgdXNlciBoYWQgdG8gc2F2ZSBiZWZvcmUgdXNpbmcgdGhlIGp1bXAtdG8tZGVmaW5pdGlvbiBmZWF0dXJlIHRvXG4gICAgLy8gZW5zdXJlIGhlIG9yIHNoZSBnb3QgYWNjdXJhdGUgcmVzdWx0cy5cbiAgICBvcHRpb25zLnN0ZGluID0gY3VycmVudENvbnRlbnRzO1xuXG4gICAgY29uc3QgYXJncyA9IFsnZ2V0LWRlZicsICctLWpzb24nLCAnLS1wYXRoJywgZmlsZSwgbGluZSwgY29sdW1uXTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzcy5leGVjRmxvdyhhcmdzLCBvcHRpb25zLCBmaWxlKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY29uc3QganNvbiA9IHBhcnNlSlNPTihhcmdzLCByZXN1bHQuc3Rkb3V0KTtcbiAgICAgIGlmIChqc29uWydwYXRoJ10pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBmaWxlOiBqc29uWydwYXRoJ10sXG4gICAgICAgICAgbGluZToganNvblsnbGluZSddIC0gMSxcbiAgICAgICAgICBjb2x1bW46IGpzb25bJ3N0YXJ0J10gLSAxLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIGN1cnJlbnRDb250ZW50cyBpcyBudWxsLCBpdCBtZWFucyB0aGF0IHRoZSBmaWxlIGhhcyBub3QgY2hhbmdlZCBzaW5jZVxuICAgKiBpdCBoYXMgYmVlbiBzYXZlZCwgc28gd2UgY2FuIGF2b2lkIHBpcGluZyB0aGUgd2hvbGUgY29udGVudHMgdG8gdGhlIEZsb3dcbiAgICogcHJvY2Vzcy5cbiAgICovXG4gIGFzeW5jIGZsb3dGaW5kRGlhZ25vc3RpY3MoXG4gICAgZmlsZTogTnVjbGlkZVVyaSxcbiAgICBjdXJyZW50Q29udGVudHM6ID9zdHJpbmcsXG4gICk6IFByb21pc2U8P0RpYWdub3N0aWNzPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gICAgbGV0IGFyZ3M7XG4gICAgaWYgKGN1cnJlbnRDb250ZW50cykge1xuICAgICAgb3B0aW9ucy5zdGRpbiA9IGN1cnJlbnRDb250ZW50cztcblxuICAgICAgLy8gQ3VycmVudGx5LCBgZmxvdyBjaGVjay1jb250ZW50c2AgcmV0dXJucyBhbGwgb2YgdGhlIGVycm9ycyBpbiB0aGVcbiAgICAgIC8vIHByb2plY3QuIEl0IHdvdWxkIGJlIG5pY2UgaWYgaXQgd291bGQgdXNlIHRoZSBwYXRoIGZvciBmaWx0ZXJpbmcsIGFzXG4gICAgICAvLyBjdXJyZW50bHkgdGhlIGNsaWVudCBoYXMgdG8gZG8gdGhlIGZpbHRlcmluZy5cbiAgICAgIGFyZ3MgPSBbJ2NoZWNrLWNvbnRlbnRzJywgJy0tanNvbicsIGZpbGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXZSBjYW4ganVzdCB1c2UgYGZsb3cgc3RhdHVzYCBpZiB0aGUgY29udGVudHMgYXJlIHVuY2hhbmdlZC5cbiAgICAgIGFyZ3MgPSBbJ3N0YXR1cycsICctLWpzb24nLCBmaWxlXTtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIERvbid0IGxvZyBlcnJvcnMgaWYgdGhlIGNvbW1hbmQgcmV0dXJucyBhIG5vbnplcm8gZXhpdCBjb2RlLCBiZWNhdXNlIHN0YXR1cyByZXR1cm5zIG5vbnplcm9cbiAgICAgIC8vIGlmIGl0IGlzIHJlcG9ydGluZyBhbnkgaXNzdWVzLCBldmVuIHdoZW4gaXQgc3VjY2VlZHMuXG4gICAgICByZXN1bHQgPSBhd2FpdCB0aGlzLl9wcm9jZXNzLmV4ZWNGbG93KGFyZ3MsIG9wdGlvbnMsIGZpbGUsIC8qIHdhaXRGb3JTZXJ2ZXIgKi8gdHJ1ZSk7XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBUaGlzIGNvZGVwYXRoIHdpbGwgYmUgZXhlcmNpc2VkIHdoZW4gRmxvdyBmaW5kcyB0eXBlIGVycm9ycyBhcyB0aGVcbiAgICAgIC8vIGV4aXQgY29kZSB3aWxsIGJlIG5vbi16ZXJvLiBOb3RlIHRoaXMgY29kZXBhdGggY291bGQgYWxzbyBiZSBleGVyY2lzZWRcbiAgICAgIC8vIGR1ZSB0byBhIGxvZ2ljYWwgZXJyb3IgaW4gTnVjbGlkZSwgc28gd2UgdHJ5IHRvIGRpZmZlcmVudGlhdGUuXG4gICAgICBpZiAoZS5leGl0Q29kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJlc3VsdCA9IGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBqc29uO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gcGFyc2VKU09OKGFyZ3MsIHJlc3VsdC5zdGRvdXQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VzID0ganNvblsnZXJyb3JzJ10ubWFwKGRpYWdub3N0aWMgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGRpYWdub3N0aWNbJ21lc3NhZ2UnXTtcbiAgICAgIC8vIGBtZXNzYWdlYCBpcyBhIGxpc3Qgb2YgbWVzc2FnZSBjb21wb25lbnRzXG4gICAgICBtZXNzYWdlLmZvckVhY2goY29tcG9uZW50ID0+IHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQucGF0aCkge1xuICAgICAgICAgIC8vIFVzZSBhIGNvbnNpc3RlbnQgJ2ZhbHN5JyB2YWx1ZSBmb3IgdGhlIGVtcHR5IHN0cmluZywgdW5kZWZpbmVkLCBldGMuIEZsb3cgcmV0dXJucyB0aGVcbiAgICAgICAgICAvLyBlbXB0eSBzdHJpbmcgaW5zdGVhZCBvZiBudWxsIHdoZW4gdGhlcmUgaXMgbm8gcmVsZXZhbnQgcGF0aC5cbiAgICAgICAgICAvLyBUT0RPKHQ4NjQ0MzQwKSBSZW1vdmUgdGhpcyB3aGVuIEZsb3cgaXMgZml4ZWQuXG4gICAgICAgICAgY29tcG9uZW50LnBhdGggPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IGRpYWdub3N0aWNbJ29wZXJhdGlvbiddO1xuICAgICAgaWYgKG9wZXJhdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIC8vIFRoZSBvcGVyYXRpb24gZmllbGQgcHJvdmlkZXMgYWRkaXRpb25hbCBjb250ZXh0LiBJIGRvbid0IGZ1bGx5IHVuZGVyc3RhbmQgdGhlIG1vdGl2YXRpb25cbiAgICAgICAgLy8gYmVoaW5kIHNlcGFyYXRpbmcgaXQgb3V0LCBidXQgcHJlcGVuZGluZyBpdCB3aXRoICdTZWUgYWxzbzogJyBhbmQgYWRkaW5nIGl0IHRvIHRoZSBlbmQgb2ZcbiAgICAgICAgLy8gdGhlIG1lc3NhZ2VzIGlzIHdoYXQgdGhlIEZsb3cgdGVhbSByZWNvbW1lbmRlZC5cbiAgICAgICAgb3BlcmF0aW9uWydkZXNjciddID0gJ1NlZSBhbHNvOiAnICsgb3BlcmF0aW9uWydkZXNjciddO1xuICAgICAgICBtZXNzYWdlLnB1c2gob3BlcmF0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZsb3dSb290OiB0aGlzLl9yb290LFxuICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBmbG93R2V0QXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnMoXG4gICAgZmlsZTogTnVjbGlkZVVyaSxcbiAgICBjdXJyZW50Q29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICAgcHJlZml4OiBzdHJpbmcsXG4gICAgYWN0aXZhdGVkTWFudWFsbHk6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgLy8gV2UgbWF5IHdhbnQgdG8gbWFrZSB0aGlzIGNvbmZpZ3VyYWJsZSwgYnV0IGlmIGl0IGlzIGV2ZXIgaGlnaGVyIHRoYW4gb25lIHdlIG5lZWQgdG8gbWFrZSBzdXJlXG4gICAgLy8gaXQgd29ya3MgcHJvcGVybHkgd2hlbiB0aGUgdXNlciBtYW51YWxseSBhY3RpdmF0ZXMgaXQgKGUuZy4gd2l0aCBjdHJsK3NwYWNlKS4gU2VlXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXV0b2NvbXBsZXRlLXBsdXMvaXNzdWVzLzU5N1xuICAgIC8vXG4gICAgLy8gSWYgdGhpcyBpcyBtYWRlIGNvbmZpZ3VyYWJsZSwgY29uc2lkZXIgdXNpbmcgYXV0b2NvbXBsZXRlLXBsdXMnIG1pbmltdW1Xb3JkTGVuZ3RoIHNldHRpbmcsIGFzXG4gICAgLy8gcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F1dG9jb21wbGV0ZS1wbHVzL2lzc3Vlcy81OTRcbiAgICBjb25zdCBtaW5pbXVtUHJlZml4TGVuZ3RoID0gMTtcblxuICAgIC8vIEFsbG93cyBjb21wbGV0aW9ucyB0byBpbW1lZGlhdGVseSBhcHBlYXIgd2hlbiB3ZSBhcmUgY29tcGxldGluZyBvZmYgb2Ygb2JqZWN0IHByb3BlcnRpZXMuXG4gICAgLy8gVGhpcyBhbHNvIG5lZWRzIHRvIGJlIGNoYW5nZWQgaWYgbWluaW11bVByZWZpeExlbmd0aCBnb2VzIGFib3ZlIDEsIHNpbmNlIGFmdGVyIHlvdSB0eXBlIGFcbiAgICAvLyBzaW5nbGUgYWxwaGFudW1lcmljIGNoYXJhY3RlciwgYXV0b2NvbXBsZXRlLXBsdXMgbm8gbG9uZ2VyIGluY2x1ZGVzIHRoZSBkb3QgaW4gdGhlIHByZWZpeC5cbiAgICBjb25zdCBwcmVmaXhIYXNEb3QgPSBwcmVmaXguaW5kZXhPZignLicpICE9PSAtMTtcblxuICAgIC8vIElmIGl0IGlzIGp1c3Qgd2hpdGVzcGFjZSBhbmQgcHVuY3R1YXRpb24sIGlnbm9yZSBpdCAodGhpcyBrZWVwcyB1c1xuICAgIC8vIGZyb20gZWF0aW5nIGxlYWRpbmcgZG90cykuXG4gICAgY29uc3QgcmVwbGFjZW1lbnRQcmVmaXggPSAvXltcXHMuXSokLy50ZXN0KHByZWZpeCkgPyAnJyA6IHByZWZpeDtcblxuICAgIGlmICghYWN0aXZhdGVkTWFudWFsbHkgJiYgIXByZWZpeEhhc0RvdCAmJiByZXBsYWNlbWVudFByZWZpeC5sZW5ndGggPCBtaW5pbXVtUHJlZml4TGVuZ3RoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gICAgY29uc3QgYXJncyA9IFsnYXV0b2NvbXBsZXRlJywgJy0tanNvbicsIGZpbGVdO1xuXG4gICAgb3B0aW9ucy5zdGRpbiA9IGluc2VydEF1dG9jb21wbGV0ZVRva2VuKGN1cnJlbnRDb250ZW50cywgbGluZSwgY29sdW1uKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzcy5leGVjRmxvdyhhcmdzLCBvcHRpb25zLCBmaWxlKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGpzb24gPSBwYXJzZUpTT04oYXJncywgcmVzdWx0LnN0ZG91dCk7XG4gICAgICBsZXQgcmVzdWx0c0FycmF5O1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoanNvbikpIHtcbiAgICAgICAgLy8gRmxvdyA8IHYwLjIwLjBcbiAgICAgICAgcmVzdWx0c0FycmF5ID0ganNvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZsb3cgPj0gdjAuMjAuMC4gVGhlIG91dHB1dCBmb3JtYXQgd2FzIGNoYW5nZWQgdG8gc3VwcG9ydCBtb3JlIGRldGFpbGVkIGZhaWx1cmVcbiAgICAgICAgLy8gaW5mb3JtYXRpb24uXG4gICAgICAgIHJlc3VsdHNBcnJheSA9IGpzb24ucmVzdWx0O1xuICAgICAgfVxuICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IHJlc3VsdHNBcnJheS5tYXAoaXRlbSA9PiBwcm9jZXNzQXV0b2NvbXBsZXRlSXRlbShyZXBsYWNlbWVudFByZWZpeCwgaXRlbSkpO1xuICAgICAgcmV0dXJuIGZpbHRlcihjYW5kaWRhdGVzLCByZXBsYWNlbWVudFByZWZpeCwgeyBrZXk6ICdkaXNwbGF5VGV4dCcgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZsb3dHZXRUeXBlKFxuICAgIGZpbGU6IE51Y2xpZGVVcmksXG4gICAgY3VycmVudENvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICAgIGluY2x1ZGVSYXdUeXBlOiBib29sZWFuLFxuICApOiBQcm9taXNlPD97dHlwZTogc3RyaW5nLCByYXdUeXBlOiA/c3RyaW5nfT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcblxuICAgIG9wdGlvbnMuc3RkaW4gPSBjdXJyZW50Q29udGVudHM7XG5cbiAgICBsaW5lID0gbGluZSArIDE7XG4gICAgY29sdW1uID0gY29sdW1uICsgMTtcbiAgICBjb25zdCBhcmdzID1cbiAgICAgIFsndHlwZS1hdC1wb3MnLCAnLS1qc29uJywgJy0tcGF0aCcsIGZpbGUsIGxpbmUsIGNvbHVtbl07XG4gICAgaWYgKGluY2x1ZGVSYXdUeXBlKSB7XG4gICAgICBhcmdzLnB1c2goJy0tcmF3Jyk7XG4gICAgfVxuXG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcHJvY2Vzcy5leGVjRmxvdyhhcmdzLCBvcHRpb25zLCBmaWxlKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgb3V0cHV0ID0gcmVzdWx0LnN0ZG91dDtcbiAgICAgIGlmIChvdXRwdXQgPT09ICcnKSB7XG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgc3ludGF4IGVycm9yLCBGbG93IHJldHVybnMgdGhlIEpTT04gb24gc3RkZXJyIHdoaWxlXG4gICAgICAgIC8vIHN0aWxsIHJldHVybmluZyBhIDAgZXhpdCBjb2RlICh0ODAxODU5NSlcbiAgICAgICAgb3V0cHV0ID0gcmVzdWx0LnN0ZGVycjtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IGpzb247XG4gICAgdHJ5IHtcbiAgICAgIGpzb24gPSBwYXJzZUpTT04oYXJncywgb3V0cHV0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdHlwZSA9IGpzb25bJ3R5cGUnXTtcbiAgICBjb25zdCByYXdUeXBlID0ganNvblsncmF3X3R5cGUnXTtcbiAgICBpZiAoIXR5cGUgfHwgdHlwZSA9PT0gJyh1bmtub3duKScgfHwgdHlwZSA9PT0gJycpIHtcbiAgICAgIGlmICh0eXBlID09PSAnJykge1xuICAgICAgICAvLyBUaGlzIHNob3VsZCBub3QgaGFwcGVuLiBUaGUgRmxvdyB0ZWFtIGJlbGlldmVzIGl0J3MgYW4gZXJyb3IgaW4gRmxvd1xuICAgICAgICAvLyBpZiBpdCBkb2VzLiBJJ20gbGVhdmluZyB0aGUgY29uZGl0aW9uIGhlcmUgYmVjYXVzZSBpdCB1c2VkIHRvIGhhcHBlblxuICAgICAgICAvLyBiZWZvcmUgdGhlIHN3aXRjaCB0byBKU09OIGFuZCBJJ2QgcmF0aGVyIGxvZyBzb21ldGhpbmcgdGhhbiBoYXZlIHRoZVxuICAgICAgICAvLyB1c2VyIGV4cGVyaWVuY2UgcmVncmVzcyBpbiBjYXNlIEknbSB3cm9uZy5cbiAgICAgICAgbG9nZ2VyLmVycm9yKCdSZWNlaXZlZCBlbXB0eSB0eXBlIGhpbnQgZnJvbSBgZmxvdyB0eXBlLWF0LXBvc2AnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge3R5cGUsIHJhd1R5cGV9O1xuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlSlNPTihhcmdzOiBBcnJheTxhbnk+LCB2YWx1ZTogc3RyaW5nKTogYW55IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIuZXJyb3IoYEludmFsaWQgSlNPTiByZXN1bHQgZnJvbSBmbG93ICR7YXJncy5qb2luKCcgJyl9LiBKU09OOlxcbicke3ZhbHVlfScuYCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuIl19