'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__testing__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let _lint = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (textEditor) {
    const filePath = textEditor.getPath();
    if (filePath == null) {
      return null;
    }

    let diagnostics;
    try {
      diagnostics = yield _findDiagnostics(filePath);
    } catch (err) {
      logger.warn('arc lint failed:', err);
      return null;
    }

    if (diagnostics == null) {
      return null;
    } else if (textEditor.isDestroyed()) {
      return [];
    }

    return diagnostics.map(function (diagnostic) {
      const range = new _atom.Range([diagnostic.row, diagnostic.col], [diagnostic.row, textEditor.getBuffer().lineLengthForRow(diagnostic.row)]);
      let text;
      if (Array.isArray(diagnostic.text)) {
        // Sometimes `arc lint` returns an array of strings for the text, rather than just a
        // string :(.
        text = diagnostic.text.join(' ');
      } else {
        text = diagnostic.text;
      }
      const maybeProperties = {};
      if (diagnostic.original != null && diagnostic.replacement != null &&
      // Sometimes linters set original and replacement to the same value. Obviously that won't
      // fix anything.
      diagnostic.original !== diagnostic.replacement) {
        // Copy the object so the type refinements hold...
        maybeProperties.fix = _getFix(Object.assign({}, diagnostic));
      }
      return Object.assign({
        // flowlint-next-line sketchy-null-string:off
        name: 'Arc' + (diagnostic.code ? `: ${diagnostic.code}` : ''),
        type: diagnostic.type,
        text,
        filePath: diagnostic.filePath,
        range
      }, maybeProperties);
    });
  });

  return function _lint(_x) {
    return _ref.apply(this, arguments);
  };
})();

let _findDiagnostics = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (filePath) {
    const blacklistedLinters = (_featureConfig || _load_featureConfig()).default.get('nuclide-arc-lint.blacklistedLinters');
    const runningProcess = _runningProcess.get(filePath);
    if (runningProcess != null) {
      // This will cause the previous lint run to resolve with `undefined`.
      runningProcess.complete();
    }
    const subject = new _rxjsBundlesRxMinJs.Subject();
    _runningProcess.set(filePath, subject);
    return _promisePool.submit(function () {
      // It's possible that the subject was replaced by a queued lint run.
      if (_runningProcess.get(filePath) !== subject) {
        return Promise.resolve(null);
      }
      const arcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(filePath);
      const subscription = arcService.findDiagnostics(filePath, blacklistedLinters).refCount().toArray().timeout((_featureConfig || _load_featureConfig()).default.get('nuclide-arc-lint.lintTimeout')).subscribe(subject);
      return subject.finally(function () {
        subscription.unsubscribe();
        _runningProcess.delete(filePath);
      }).toPromise();
    });
  });

  return function _findDiagnostics(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

// This type is a bit different than an ArcDiagnostic since original and replacement are
// mandatory.


exports.lint = lint;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _os = _interopRequireDefault(require('os'));

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-arc-lint'); /**
                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                * All rights reserved.
                                                                                *
                                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                                * the root directory of this source tree.
                                                                                *
                                                                                * 
                                                                                * @format
                                                                                */

const _runningProcess = new Map();
const _promisePool = new (_promiseExecutors || _load_promiseExecutors()).PromisePool(Math.round(_os.default.cpus().length / 2));

function lint(textEditor) {
  return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-arcanist:lint', () => _lint(textEditor));
}

function _getFix(diagnostic) {
  // For now just remove the suffix. The prefix would be nice too but it's a bit harder since we
  const [original, replacement] = (0, (_string || _load_string()).removeCommonSuffix)(diagnostic.original, diagnostic.replacement);
  return {
    range: _getRangeForFix(diagnostic.row, diagnostic.col, original),
    newText: replacement,
    oldText: original
  };
}

function _getRangeForFix(startRow, startCol, originalText) {
  let newlineCount = 0;
  for (const char of originalText) {
    if (char === '\n') {
      newlineCount++;
    }
  }
  const endRow = startRow + newlineCount;
  const lastNewlineIndex = originalText.lastIndexOf('\n');
  let endCol;
  if (lastNewlineIndex === -1) {
    endCol = startCol + originalText.length;
  } else {
    endCol = originalText.length - lastNewlineIndex - 1;
  }

  return new _atom.Range([startRow, startCol], [endRow, endCol]);
}

const __testing__ = exports.__testing__ = {
  _findDiagnostics,
  _getRangeForFix,
  _getFix,
  _runningProcess
};