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

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
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
function marksDiffer(rangeA, rangeB) {
  return rangeA.start === rangeB.start && rangeA.end === rangeB.end;
}

function getCursorPositions(editor) {
  return _rxjsCompatUmdMin.Observable.merge((0, _event().observableFromSubscribeFunction)(cb => editor.onDidChangeCursorPosition(cb)), (0, _event().observableFromSubscribeFunction)(cb => editor.onDidAddCursor(cb)), (0, _event().observableFromSubscribeFunction)(cb => editor.onDidRemoveCursor(cb))).map(() => editor.getCursorBufferPositions());
}

class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)();
    this._updates = new _rxjsCompatUmdMin.Subject();

    this._disposables.add((0, _event().observableFromSubscribeFunction)(cb => atom.workspace.observeTextEditors(cb)).mergeMap(editor => {
      return _rxjsCompatUmdMin.Observable.combineLatest(getCursorPositions(editor).map(cursorPoints => cursorPoints.map(point => point.row)).distinctUntilChanged(_collection().arrayEqual).map(rows => {
        return new Set(rows.map(row => ({
          start: row,
          end: row
        })));
      }), (0, _event().observableFromSubscribeFunction)(cb => editor.onDidChangeSelectionRange(cb)).map(({
        newBufferRange
      }) => {
        return {
          start: newBufferRange.start.row,
          end: newBufferRange.end.row
        };
      }).distinctUntilChanged(marksDiffer)).map(([cursors, selection]) => {
        return {
          editor,
          markTypes: new Map([['CURSOR', cursors], ['SELECTION', new Set([selection])]])
        };
      });
    }).subscribe(update => {
      this._updates.next(update);
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  provideScrollbarIndicators() {
    return {
      onUpdate: cb => new (_UniversalDisposable().default)(this._updates.subscribe(cb))
    };
  }

}

(0, _createPackage().default)(module.exports, Activation);