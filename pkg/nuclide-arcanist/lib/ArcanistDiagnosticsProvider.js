'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArcanistDiagnosticsProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _dec, _desc, _value, _class;

var _atom = require('atom');

var _nuclideDiagnosticsProviderBase;

function _load_nuclideDiagnosticsProviderBase() {
  return _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _onWillDestroyTextBuffer;

function _load_onWillDestroyTextBuffer() {
  return _onWillDestroyTextBuffer = _interopRequireDefault(require('../../commons-atom/on-will-destroy-text-buffer'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _aggregateFindDiagnostics;

function _load_aggregateFindDiagnostics() {
  return _aggregateFindDiagnostics = _interopRequireDefault(require('./aggregateFindDiagnostics'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

let ArcanistDiagnosticsProvider = exports.ArcanistDiagnosticsProvider = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-arcanist:lint'), (_class = class ArcanistDiagnosticsProvider {

  constructor(busySignalProvider) {
    this._busySignalProvider = busySignalProvider;
    this._subscriptions = new _atom.CompositeDisposable();
    const baseOptions = {
      enableForAllGrammars: true,
      shouldRunOnTheFly: false,
      onTextEditorEvent: this._runLintWithBusyMessage.bind(this)
    };
    this._providerBase = new (_nuclideDiagnosticsProviderBase || _load_nuclideDiagnosticsProviderBase()).DiagnosticsProviderBase(baseOptions);
    this._subscriptions.add(this._providerBase);
    this._requestSerializer = new (_promise || _load_promise()).RequestSerializer();
    this._subscriptions.add((0, (_onWillDestroyTextBuffer || _load_onWillDestroyTextBuffer()).default)(buffer => {
      const path = buffer.getPath();
      if (!path) {
        return;
      }
      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [path] });
    }));
  }

  dispose() {
    this._subscriptions.dispose();
  }

  /** The returned Promise will resolve when results have been published. */
  _runLintWithBusyMessage(textEditor) {
    const path = textEditor.getPath();
    if (path == null) {
      return Promise.resolve();
    }
    return this._busySignalProvider.reportBusy(`Waiting for arc lint results for \`${ textEditor.getTitle() }\``, () => this._runLint(textEditor), { onlyForFile: path });
  }

  /** Do not call this directly -- call _runLintWithBusyMessage */

  _runLint(textEditor) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = textEditor.getPath();

      if (!filePath) {
        throw new Error('Invariant violation: "filePath"');
      }

      try {
        const blacklistedLinters = (_featureConfig || _load_featureConfig()).default.get('nuclide-arcanist.blacklistedLinters');
        const result = yield _this._requestSerializer.run((0, (_aggregateFindDiagnostics || _load_aggregateFindDiagnostics()).default)([filePath], blacklistedLinters));
        if (result.status === 'outdated') {
          return;
        }
        const diagnostics = result.result;
        const fileDiagnostics = diagnostics.map(function (diagnostic) {
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
            maybeProperties.fix = _this._getFix(Object.assign({}, diagnostic));
          }
          return Object.assign({
            scope: 'file',
            providerName: 'Arc' + (diagnostic.code ? `: ${ diagnostic.code }` : ''),
            type: diagnostic.type,
            text: text,
            filePath: diagnostic.filePath,
            range: range
          }, maybeProperties);
        });
        const diagnosticsUpdate = {
          filePathToMessages: new Map([[filePath, fileDiagnostics]])
        };
        // If the editor has been closed since we made the request, we don't want to display the
        // errors. This ties in with the fact that we invalidate errors for a file when it is closed.
        if (!textEditor.isDestroyed()) {
          _this._providerBase.publishMessageUpdate(diagnosticsUpdate);
        }
      } catch (error) {
        logger.error(error);
        return;
      }
    })();
  }

  // This type is a bit different than an ArcDiagnostic since original and replacement are
  // mandatory.
  _getFix(diagnostic) {
    // For now just remove the suffix. The prefix would be nice too but it's a bit harder since we
    var _removeCommonSuffix = (0, (_string || _load_string()).removeCommonSuffix)(diagnostic.original, diagnostic.replacement),
        _removeCommonSuffix2 = _slicedToArray(_removeCommonSuffix, 2);

    const original = _removeCommonSuffix2[0],
          replacement = _removeCommonSuffix2[1];

    return {
      oldRange: this._getRangeForFix(diagnostic.row, diagnostic.col, original),
      newText: replacement,
      oldText: original
    };
  }

  _getRangeForFix(startRow, startCol, originalText) {
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

  onMessageUpdate(callback) {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback) {
    return this._providerBase.onMessageInvalidation(callback);
  }
}, (_applyDecoratedDescriptor(_class.prototype, '_runLint', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, '_runLint'), _class.prototype)), _class));