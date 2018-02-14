'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _debounced;

function _load_debounced() {
  return _debounced = require('nuclide-commons-atom/debounced');
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

const CURSOR_DELAY_MS = 250;
// Apply a much higher debounce to text changes to avoid disrupting the typing experience.
const CHANGE_TOGGLE_MS = 2500;

class CodeHighlightManager {

  constructor() {
    this._providers = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._markers = [];
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._highlightEditors());
  }

  _highlightEditors() {
    var _this = this;

    return (0, (_debounced || _load_debounced()).observeActiveEditorsDebounced)(0).do(() => this._destroyMarkers()).switchMap(editor => {
      if (editor == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const cursorPositions = (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidChangeCursorPosition.bind(editor)).filter(
      // If we're moving around inside highlighted ranges, that's fine.
      event => !this._isPositionInHighlightedRanges(editor, event.newBufferPosition)).do(() => this._destroyMarkers()) // Immediately clear previous markers.
      .let((0, (_observable || _load_observable()).fastDebounce)(CURSOR_DELAY_MS)).startWith(null) // Immediately kick off a highlight event.
      .map(() => editor.getCursorBufferPosition());

      // Changing text triggers a CHANGE_TOGGLE_MS period in which cursor changes are ignored.
      // We'll model this as one stream that emits 'false' and another that debounces 'true's.
      const changeEvents = (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidChange.bind(editor)).do(() => this._destroyMarkers()).share();

      const changeToggles = _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of(true), changeEvents.mapTo(false), changeEvents.let((0, (_observable || _load_observable()).fastDebounce)(CHANGE_TOGGLE_MS)).mapTo(true));

      const destroyEvents = (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor));

      return cursorPositions.let((0, (_observable || _load_observable()).toggle)(changeToggles)).switchMap((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (position) {
          return {
            editor,
            ranges: yield _this._getHighlightedRanges(editor, position)
          };
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()).takeUntil(destroyEvents);
    }).subscribe(({ editor, ranges }) => {
      if (ranges != null) {
        this._highlightRanges(editor, ranges);
      }
    });
  }

  _getHighlightedRanges(editor, position) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const provider = _this2._providers.getProviderForEditor(editor);
      if (!provider) {
        return null;
      }

      try {
        return yield provider.highlight(editor, position);
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('code-highlight').error('Error getting code highlights', e);
        return null;
      }
    })();
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