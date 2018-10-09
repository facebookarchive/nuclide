"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
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

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)();
    this._updates = new _RxMin.Subject();
  }

  dispose() {
    this._disposables.dispose();
  }

  provideScrollbarIndicators() {
    return {
      onUpdate: cb => new (_UniversalDisposable().default)(this._updates.subscribe(cb))
    };
  }

  consumeFind(findService) {
    const disposable = new (_UniversalDisposable().default)((0, _event().observableFromSubscribeFunction)(cb => atom.workspace.observeTextEditors(cb)).mergeMap(editor => {
      const searchMarkerLayer = findService.resultsMarkerLayerForTextEditor(editor);
      return (0, _event().observableFromSubscribeFunction)(cb => searchMarkerLayer.onDidUpdate(cb)).switchMap(() => {
        // TODO: I'm not sure why this macrotask is needed, but calling
        // `getMarkers` without it seems to return no markers.
        return _observable().macrotask.first().map(() => {
          const marks = searchMarkerLayer.getMarkers().map(marker => {
            const range = marker.getBufferRange();
            return {
              start: range.start.row,
              end: range.end.row
            };
          });
          return {
            editor,
            markTypes: new Map([['SEARCH_RESULT', new Set(marks)]])
          };
        });
      });
    }).subscribe(update => {
      this._updates.next(update);
    }));

    this._disposables.add(disposable);

    return disposable;
  }

}

(0, _createPackage().default)(module.exports, Activation);