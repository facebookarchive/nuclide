'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArcanistDiagnosticsProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */

class ArcanistDiagnosticsProvider {

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
    this._runningProcess = new Map();
    this._bufferSubs = new Map();
  }

  dispose() {
    this._subscriptions.dispose();
    this._bufferSubs.forEach((sub, path, _) => sub.dispose());
  }

  /** The returned Promise will resolve when results have been published. */
  _runLintWithBusyMessage(textEditor) {
    const path = textEditor.getPath();
    if (path == null) {
      return Promise.resolve();
    }

    const textBuffer = textEditor.getBuffer();
    this._subscribeToBuffer(textBuffer);

    return this._busySignalProvider.reportBusy(`Waiting for arc lint results for \`${textEditor.getTitle()}\``, () => this._runLint(textEditor), { onlyForFile: path });
  }

  _subscribeToBuffer(textBuffer) {
    const path = textBuffer.getPath();
    if (path != null && !this._bufferSubs.has(path)) {
      this._bufferSubs.set(path, textBuffer.onDidDestroy(() => this._handleBufferDidDestroy(path)));
    }
  }

  _handleBufferDidDestroy(path) {
    const sub = this._bufferSubs.get(path);

    if (!(sub != null)) {
      throw new Error('Missing TextBufffer subscription for ' + path);
    }

    sub.dispose();
    this._bufferSubs.delete(path);

    const runningProcess = this._runningProcess.get(path);
    if (runningProcess != null) {
      runningProcess.complete();
    }

    this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [path] });
  }

  /** Do not call this directly -- call _runLintWithBusyMessage */
  _runLint(textEditor) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-arcanist:lint', () => this.__runLint(textEditor));
  }

  __runLint(textEditor) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = textEditor.getPath();

      if (!filePath) {
        throw new Error('Invariant violation: "filePath"');
      }

      let diagnostics;
      try {
        diagnostics = yield _this._findDiagnostics(filePath);
      } catch (err) {
        logger.error(`_findDiagnostics error: ${err}`);
      }

      // If the editor has been closed since we made the request, we don't want to display the
      // errors. This ties in with the fact that we invalidate errors for a file when it is closed.
      if (diagnostics == null || textEditor.isDestroyed()) {
        return;
      }

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
          providerName: 'Arc' + (diagnostic.code ? `: ${diagnostic.code}` : ''),
          type: diagnostic.type,
          text,
          filePath: diagnostic.filePath,
          range
        }, maybeProperties);
      });
      const diagnosticsUpdate = {
        filePathToMessages: new Map([[filePath, fileDiagnostics]])
      };
      _this._providerBase.publishMessageUpdate(diagnosticsUpdate);
    })();
  }

  _findDiagnostics(filePath) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const blacklistedLinters = (_featureConfig || _load_featureConfig()).default.get('nuclide-arcanist.blacklistedLinters');
      const runningProcess = _this2._runningProcess.get(filePath);
      if (runningProcess != null) {
        // This will cause the previous lint run to resolve with `undefined`.
        runningProcess.complete();
      }
      const arcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(filePath);
      const subject = new _rxjsBundlesRxMinJs.Subject();
      _this2._runningProcess.set(filePath, subject);
      const subscription = arcService.findDiagnostics(filePath, blacklistedLinters).refCount().toArray().timeout((_featureConfig || _load_featureConfig()).default.get('nuclide-arcanist.lintTimeout')).subscribe(subject);
      return subject.finally(function () {
        subscription.unsubscribe();
        _this2._runningProcess.delete(filePath);
      }).toPromise();
    })();
  }

  // This type is a bit different than an ArcDiagnostic since original and replacement are
  // mandatory.
  _getFix(diagnostic) {
    // For now just remove the suffix. The prefix would be nice too but it's a bit harder since we
    const [original, replacement] = (0, (_string || _load_string()).removeCommonSuffix)(diagnostic.original, diagnostic.replacement);
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
}
exports.ArcanistDiagnosticsProvider = ArcanistDiagnosticsProvider;