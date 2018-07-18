"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _debounced() {
  const data = require("../../../../nuclide-commons-atom/debounced");

  _debounced = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const CURSOR_DELAY_MS = 250; // Apply a much higher debounce to text changes to avoid disrupting the typing experience.

const CHANGE_TOGGLE_MS = 2500;

class CodeHighlightManager {
  constructor() {
    this._providers = new (_ProviderRegistry().default)();
    this._markers = [];
    this._subscriptions = new (_UniversalDisposable().default)(this._highlightEditors());
  }

  _highlightEditors() {
    return (0, _debounced().observeActiveEditorsDebounced)(0).do(() => this._destroyMarkers()).switchMap(editor => {
      if (editor == null) {
        return _RxMin.Observable.empty();
      }

      const cursorPositions = (0, _event().observableFromSubscribeFunction)(editor.onDidChangeCursorPosition.bind(editor)).filter( // If we're moving around inside highlighted ranges, that's fine.
      event => !this._isPositionInHighlightedRanges(editor, event.newBufferPosition)).do(() => this._destroyMarkers()) // Immediately clear previous markers.
      .let((0, _observable().fastDebounce)(CURSOR_DELAY_MS)).startWith(null) // Immediately kick off a highlight event.
      .map(() => editor.getCursorBufferPosition()); // Changing text triggers a CHANGE_TOGGLE_MS period in which cursor changes are ignored.
      // We'll model this as one stream that emits 'false' and another that debounces 'true's.

      const changeEvents = (0, _event().observableFromSubscribeFunction)(editor.onDidChange.bind(editor)).do(() => this._destroyMarkers()).share();

      const changeToggles = _RxMin.Observable.merge(_RxMin.Observable.of(true), changeEvents.mapTo(false), changeEvents.let((0, _observable().fastDebounce)(CHANGE_TOGGLE_MS)).mapTo(true));

      const destroyEvents = (0, _event().observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor));
      return cursorPositions.let((0, _observable().toggle)(changeToggles)).switchMap(async position => {
        return {
          editor,
          ranges: await this._getHighlightedRanges(editor, position)
        };
      }).takeUntil(destroyEvents);
    }).subscribe(({
      editor,
      ranges
    }) => {
      if (ranges != null) {
        this._highlightRanges(editor, ranges);
      }
    });
  }

  async _getHighlightedRanges(editor, position) {
    const provider = this._providers.getProviderForEditor(editor);

    if (!provider) {
      return null;
    }

    try {
      return await provider.highlight(editor, position);
    } catch (e) {
      (0, _log4js().getLogger)('code-highlight').error('Error getting code highlights', e);
      return null;
    }
  }

  _highlightRanges(editor, ranges) {
    this._destroyMarkers();

    this._markers = ranges.map(range => editor.markBufferRange(range, {}));

    this._markers.forEach(marker => {
      editor.decorateMarker(marker, {
        type: 'highlight',
        class: 'code-highlight-marker'
      });
    });
  }

  _isPositionInHighlightedRanges(editor, position) {
    return this._markers.map(marker => marker.getBufferRange()).some(range => range.containsPoint(position));
  }

  _destroyMarkers() {
    this._markers.splice(0).forEach(marker => marker.destroy());
  }

  addProvider(provider) {
    return this._providers.addProvider(provider);
  }

  dispose() {
    this._subscriptions.dispose();

    this._destroyMarkers();
  }

}

exports.default = CodeHighlightManager;