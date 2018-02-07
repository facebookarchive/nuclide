'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO(peterhal): The current index should really live in the DiagnosticStore.
class KeyboardShortcuts {

  constructor(diagnosticUpdater) {
    this._index = null;
    this._diagnostics = [];

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const first = () => this.setIndex(0);
    const last = () => this.setIndex(this._diagnostics.length - 1);
    this._subscriptions.add((0, (_event || _load_event()).observableFromSubscribeFunction)(diagnosticUpdater.observeMessages).subscribe(diagnostics => {
      this._index = null;
      this._traceIndex = null;
      this._diagnostics = diagnostics;
    }), atom.commands.add('atom-workspace', 'diagnostics:go-to-first-diagnostic', first), atom.commands.add('atom-workspace', 'diagnostics:go-to-last-diagnostic', last), atom.commands.add('atom-workspace', 'diagnostics:go-to-next-diagnostic', () => {
      this._index == null ? first() : this.setIndex(this._index + 1);
    }), atom.commands.add('atom-workspace', 'diagnostics:go-to-previous-diagnostic', () => {
      this._index == null ? last() : this.setIndex(this._index - 1);
    }), atom.commands.add('atom-workspace', 'diagnostics:go-to-next-diagnostic-trace', () => {
      this.nextTrace();
    }), atom.commands.add('atom-workspace', 'diagnostics:go-to-previous-diagnostic-trace', () => {
      this.previousTrace();
    }));
  }

  setIndex(index) {
    this._traceIndex = null;
    if (this._diagnostics.length === 0) {
      this._index = null;
      return;
    }
    this._index = Math.max(0, Math.min(index, this._diagnostics.length - 1));
    this.gotoCurrentIndex();
  }

  gotoCurrentIndex() {
    if (!(this._index != null)) {
      throw new Error('Invariant violation: "this._index != null"');
    }

    if (!(this._traceIndex == null)) {
      throw new Error('Invariant violation: "this._traceIndex == null"');
    }

    const diagnostic = this._diagnostics[this._index];
    const range = diagnostic.range;
    if (range == null) {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(diagnostic.filePath);
    } else {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(diagnostic.filePath, {
        line: range.start.row,
        column: range.start.column
      });
    }
  }

  nextTrace() {
    const traces = this.currentTraces();
    if (traces == null) {
      return;
    }
    let candidateTrace = this._traceIndex == null ? 0 : this._traceIndex + 1;
    while (candidateTrace < traces.length) {
      if (this.trySetCurrentTrace(traces, candidateTrace)) {
        return;
      }
      candidateTrace++;
    }
    this._traceIndex = null;
    this.gotoCurrentIndex();
  }

  previousTrace() {
    const traces = this.currentTraces();
    if (traces == null) {
      return;
    }
    let candidateTrace = this._traceIndex == null ? traces.length - 1 : this._traceIndex - 1;
    while (candidateTrace >= 0) {
      if (this.trySetCurrentTrace(traces, candidateTrace)) {
        return;
      }
      candidateTrace--;
    }
    this._traceIndex = null;
    this.gotoCurrentIndex();
  }

  currentTraces() {
    if (this._index == null) {
      return null;
    }
    const diagnostic = this._diagnostics[this._index];
    return diagnostic.trace;
  }

  // TODO: Should filter out traces whose location matches the main diagnostic's location?
  trySetCurrentTrace(traces, traceIndex) {
    const trace = traces[traceIndex];
    if (trace.filePath != null && trace.range != null) {
      this._traceIndex = traceIndex;
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(trace.filePath, {
        line: trace.range.start.row,
        column: trace.range.start.column
      });
      return true;
    }
    return false;
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
exports.default = KeyboardShortcuts; /**
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