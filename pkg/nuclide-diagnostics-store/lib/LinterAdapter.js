'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinterAdapter = undefined;
exports.linterMessageToDiagnosticMessage = linterMessageToDiagnosticMessage;
exports.linterMessagesToDiagnosticUpdate = linterMessagesToDiagnosticUpdate;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideDiagnosticsCommon;

function _load_nuclideDiagnosticsCommon() {
  return _nuclideDiagnosticsCommon = require('../../nuclide-diagnostics-common');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Exported for testing.
function linterMessageToDiagnosticMessage(msg, providerName) {
  // The types are slightly different, so we need to copy to make Flow happy. Basically, a Trace
  // does not need a filePath property, but a LinterTrace does. Trace is a subtype of LinterTrace,
  // so copying works but aliasing does not. For a detailed explanation see
  // https://github.com/facebook/flow/issues/908
  const trace = msg.trace ? msg.trace.map(component => Object.assign({}, component)) : undefined;
  if (msg.filePath) {
    return {
      scope: 'file',
      providerName: msg.name != null ? msg.name : providerName,
      type: msg.type,
      filePath: msg.filePath,
      text: msg.text,
      html: msg.html,
      range: msg.range && _atom.Range.fromObject(msg.range),
      trace,
      fix: msg.fix == null ? undefined : {
        oldRange: msg.fix.range,
        oldText: msg.fix.oldText,
        newText: msg.fix.newText
      }
    };
  } else {
    return {
      scope: 'project',
      providerName: msg.name != null ? msg.name : providerName,
      type: msg.type,
      text: msg.text,
      html: msg.html,
      range: msg.range && _atom.Range.fromObject(msg.range),
      trace
    };
  }
}

// Exported for testing.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function linterMessagesToDiagnosticUpdate(currentPath, msgs, providerName) {
  const filePathToMessages = new Map();
  if (currentPath) {
    // Make sure we invalidate the messages for the current path. We may want to
    // figure out which other paths we want to invalidate if it turns out that
    // linters regularly return messages for other files.
    filePathToMessages.set(currentPath, []);
  }
  const projectMessages = [];
  for (const msg of msgs) {
    const diagnosticMessage = linterMessageToDiagnosticMessage(msg, providerName);
    if (diagnosticMessage.scope === 'file') {
      const path = diagnosticMessage.filePath;
      let messages = filePathToMessages.get(path);
      if (messages == null) {
        messages = [];
        filePathToMessages.set(path, messages);
      }
      messages.push(diagnosticMessage);
    } else {
      // Project scope.
      projectMessages.push(diagnosticMessage);
    }
  }
  return {
    filePathToMessages,
    projectMessages
  };
}

/**
 * Provides an adapter between Atom linters (defined by the LinterProvider
 * type), and Nuclide Diagnostic Providers.
 *
 * The constructor takes a LinterProvider as an argument, and the resulting
 * LinterAdapter is a valid DiagnosticProvider.
 */
class LinterAdapter {

  constructor(provider) {
    this._provider = provider;
    this._updates = new _rxjsBundlesRxMinJs.Subject();
    this._invalidations = new _rxjsBundlesRxMinJs.Subject();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_nuclideDiagnosticsCommon || _load_nuclideDiagnosticsCommon()).observeTextEditorEvents)(this._provider.grammarScopes[0] === '*' ? 'all' : this._provider.grammarScopes, this._provider.lintsOnChange || this._provider.lintOnFly ? 'changes' : 'saves')
    // Group text editor events by their underlying text buffer.
    // Each grouped stream lasts until the buffer gets destroyed.
    .groupBy(editor => editor.getBuffer(), editor => editor,
    // $FlowFixMe: add durationSelector to groupBy
    grouped => (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => grouped.key.onDidDestroy(cb)).take(1)).mergeMap(bufferObservable =>
    // Run the linter on each buffer event.
    _rxjsBundlesRxMinJs.Observable.concat(bufferObservable,
    // When the buffer gets destroyed, immediately stop linting and invalidate.
    _rxjsBundlesRxMinJs.Observable.of(null))
    // switchMap ensures that earlier lints are overridden by later ones.
    .switchMap(editor => editor == null ? _rxjsBundlesRxMinJs.Observable.of(null) : this._runLint(editor))
    // Track the previous update so we can invalidate its results.
    // (Prevents dangling diagnostics when a linter affects multiple files).
    .scan((acc, update) => ({ update, lastUpdate: acc.update }), { update: null, lastUpdate: null })).subscribe(({ update, lastUpdate }) => this._processUpdate(update, lastUpdate)));
  }

  _runLint(editor) {
    return _rxjsBundlesRxMinJs.Observable.defer(() => {
      const lintPromise = this._provider.lint(editor);
      if (lintPromise == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return Promise.resolve(lintPromise).catch(error => {
        // Prevent errors from blowing up the entire stream.
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error in linter provider ${this._provider.name}:`, error);
        return null;
      });
    }).switchMap(linterMessages => {
      if (linterMessages == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const update = linterMessagesToDiagnosticUpdate(editor.getPath(), linterMessages, this._provider.name);
      return _rxjsBundlesRxMinJs.Observable.of(update);
    });
  }

  _processUpdate(update, lastUpdate) {
    if (lastUpdate != null && lastUpdate.filePathToMessages != null) {
      this._invalidations.next({
        scope: 'file',
        filePaths: Array.from(lastUpdate.filePathToMessages.keys())
      });
    }
    if (update != null) {
      this._updates.next(update);
    }
  }

  dispose() {
    this._disposables.dispose();
    this._updates.complete();
    this._invalidations.complete();
  }

  getUpdates() {
    return this._updates.asObservable();
  }

  getInvalidations() {
    return this._invalidations.asObservable();
  }
}
exports.LinterAdapter = LinterAdapter;