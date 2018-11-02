"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const VISIBLE_TYPES = new Set(['Error']);

function visibleLinesFromMessages(messages) {
  const marks = new Set();
  messages.forEach(message => {
    if (VISIBLE_TYPES.has(message.type) && message.range != null) {
      marks.add({
        start: message.range.start.row,
        end: message.range.end.row
      });
    }
  });
  return marks;
}

function observeEditorPaths(editor) {
  return (0, _event().observableFromSubscribeFunction)(cb => editor.onDidChangePath(cb)).startWith(editor.getPath()).takeUntil((0, _event().observableFromSubscribeFunction)(cb => editor.onDidDestroy(cb)));
}

class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)();
    this._updates = new _rxjsCompatUmdMin.Subject();
  }

  dispose() {
    this._disposables.dispose();
  }

  provideScrollbarIndicators() {
    return {
      onUpdate: cb => new (_UniversalDisposable().default)(this._updates.subscribe(cb))
    };
  }

  consumeDiagnosticUpdates(diagnosticUpdater) {
    const scrollbarUpdates = (0, _event().observableFromSubscribeFunction)(cb => atom.workspace.observeTextEditors(cb)).mergeMap(editor => observeEditorPaths(editor).filter(Boolean).switchMap(path => {
      return (0, _event().observableFromSubscribeFunction)(cb => diagnosticUpdater.observeFileMessages(path, cb)).map(messages => ({
        markTypes: new Map([['DIAGNOSTIC_ERROR', visibleLinesFromMessages(messages.messages)]]),
        editor
      }));
    }));
    const disposable = new (_UniversalDisposable().default)(scrollbarUpdates.subscribe(update => {
      this._updates.next(update);
    }));

    this._disposables.add(disposable);

    return disposable;
  }

}

(0, _createPackage().default)(module.exports, Activation);