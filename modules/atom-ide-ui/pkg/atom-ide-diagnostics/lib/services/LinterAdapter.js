'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinterAdapter = undefined;
exports.linterMessageToDiagnosticMessage = linterMessageToDiagnosticMessage;
exports.linterMessageV2ToDiagnosticMessage = linterMessageV2ToDiagnosticMessage;
exports.linterMessagesToDiagnosticUpdate = linterMessagesToDiagnosticUpdate;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _textEvent;

function _load_textEvent() {
  return _textEvent = require('nuclide-commons-atom/text-event');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Exported for testing.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function linterMessageToDiagnosticMessage(msg, providerName) {
  // The types are slightly different, so we need to copy to make Flow happy. Basically, a Trace
  // does not need a filePath property, but a LinterTrace does. Trace is a subtype of LinterTrace,
  // so copying works but aliasing does not. For a detailed explanation see
  // https://github.com/facebook/flow/issues/908
  const trace = msg.trace ? msg.trace.map(component => Object.assign({}, component)) : undefined;
  // flowlint-next-line sketchy-null-string:off
  if (msg.filePath) {
    const { fix } = msg;
    return {
      scope: 'file',
      providerName: msg.name != null ? msg.name : providerName,
      type: msg.type,
      filePath: msg.filePath,
      text: msg.text,
      html: msg.html,
      range: msg.range && _atom.Range.fromObject(msg.range),
      trace,
      fix: fix == null ? undefined : {
        oldRange: _atom.Range.fromObject(fix.range),
        oldText: fix.oldText,
        newText: fix.newText
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

const LinterSeverityMap = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info'
};

// Version 2 only handles file-level diagnostics.
function linterMessageV2ToDiagnosticMessage(msg, providerName) {
  let trace;
  if (msg.trace != null) {
    trace = msg.trace.map(component => Object.assign({}, component));
  } else if (msg.reference != null) {
    const point = msg.reference.position != null ? _atom.Point.fromObject(msg.reference.position) : null;
    trace = [{
      type: 'Trace',
      filePath: msg.reference.file,
      range: point ? new _atom.Range(point, point) : undefined
    }];
  }
  // TODO: handle multiple solutions and priority.
  let fix;
  const { solutions } = msg;
  if (solutions != null) {
    const solution = solutions[0];
    if (solution.replaceWith !== undefined) {
      fix = {
        oldRange: _atom.Range.fromObject(solution.position),
        oldText: solution.currentText,
        newText: solution.replaceWith,
        title: solution.title
      };
    }
    // TODO: support the callback version.
  }
  let text = msg.excerpt;
  // TODO: use markdown + handle callback-based version.
  if (typeof msg.description === 'string') {
    text = text + '\n' + msg.description;
  }
  return {
    scope: 'file',
    // flowlint-next-line sketchy-null-string:off
    providerName: msg.linterName || providerName,
    type: LinterSeverityMap[msg.severity],
    filePath: msg.location.file,
    text,
    range: _atom.Range.fromObject(msg.location.position),
    trace,
    fix
  };
}

function linterMessagesToDiagnosticUpdate(currentPath, msgs, providerName) {
  const filePathToMessages = new Map();
  // flowlint-next-line sketchy-null-string:off
  if (currentPath) {
    // Make sure we invalidate the messages for the current path. We may want to
    // figure out which other paths we want to invalidate if it turns out that
    // linters regularly return messages for other files.
    filePathToMessages.set(currentPath, []);
  }
  const projectMessages = [];
  for (const msg of msgs) {
    const diagnosticMessage = msg.type === undefined ? linterMessageV2ToDiagnosticMessage(msg, providerName) : linterMessageToDiagnosticMessage(msg, providerName);
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
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_textEvent || _load_textEvent()).observeTextEditorEvents)(this._provider.grammarScopes[0] === '*' ? 'all' : this._provider.grammarScopes, this._provider.lintsOnChange || this._provider.lintOnFly ? 'changes' : 'saves')
    // Group text editor events by their underlying text buffer.
    // Each grouped stream lasts until the buffer gets destroyed.
    .groupBy(editor => editor.getBuffer(), editor => editor, grouped =>
    // $FlowFixMe: add durationSelector to groupBy
    (0, (_event || _load_event()).observableFromSubscribeFunction)(cb =>
    // $FlowFixMe
    grouped.key.onDidDestroy(cb)).take(1)).mergeMap(bufferObservable =>
    // Run the linter on each buffer event.
    _rxjsBundlesRxMinJs.Observable.concat(bufferObservable,
    // When the buffer gets destroyed, immediately stop linting and invalidate.
    _rxjsBundlesRxMinJs.Observable.of(null))
    // switchMap ensures that earlier lints are overridden by later ones.
    .switchMap(editor => editor == null ? _rxjsBundlesRxMinJs.Observable.of(null) : this._runLint(editor))
    // Track the previous update so we can invalidate its results.
    // (Prevents dangling diagnostics when a linter affects multiple files).
    .scan((acc, update) => ({ update, lastUpdate: acc.update }), {
      update: null,
      lastUpdate: null
    })).subscribe(({ update, lastUpdate }) => this._processUpdate(update, lastUpdate)));
  }

  _runLint(editor) {
    return _rxjsBundlesRxMinJs.Observable.defer(() => {
      const lintPromise = this._provider.lint(editor);
      if (lintPromise == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return Promise.resolve(lintPromise).catch(error => {
        // Prevent errors from blowing up the entire stream.
        (0, (_log4js || _load_log4js()).getLogger)('atom-ide-diagnostics').error(`Error in linter provider ${this._provider.name}:`, error);
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