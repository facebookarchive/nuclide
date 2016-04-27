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
        var result = yield this._process.execFlow(args, options);
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
        result = yield this._process.execFlow(args, options, /* waitForServer */true);
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
        var result = yield this._process.execFlow(args, options);
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
        var result = yield this._process.execFlow(args, options);
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