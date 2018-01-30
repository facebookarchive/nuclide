'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatatipManager = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDatatipResults = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (providers, editor, position, invoke) {
    const filteredDatatipProviders = Array.from(providers.getAllProvidersForEditor(editor));
    if (filteredDatatipProviders.length === 0) {
      return [];
    }

    const promises = filteredDatatipProviders.map((() => {
      var _ref6 = (0, _asyncToGenerator.default)(function* (provider) {
        const name = getProviderName(provider);
        const timingTracker = new (_analytics || _load_analytics()).default.TimingTracker(name + '.datatip');
        try {
          const datatip = yield invoke(provider);
          if (!datatip) {
            return null;
          }

          timingTracker.onSuccess();

          const result = {
            datatip,
            provider
          };
          return result;
        } catch (e) {
          timingTracker.onError(e);
          (0, (_log4js || _load_log4js()).getLogger)('datatip').error(`Error getting datatip from provider ${name}`, e);
          return null;
        }
      });

      return function (_x5) {
        return _ref6.apply(this, arguments);
      };
    })());
    if ((_featureConfig || _load_featureConfig()).default.get('atom-ide-datatip.onlyTopDatatip')) {
      const result = yield (0, (_promise || _load_promise()).asyncFind)(promises, function (x) {
        return x;
      });
      return result != null ? [result] : [];
    } else {
      return (yield Promise.all(promises)).filter(Boolean);
    }
  });

  return function getDatatipResults(_x, _x2, _x3, _x4) {
    return _ref5.apply(this, arguments);
  };
})();

var _atom = require('atom');

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('nuclide-commons/performanceNow'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _getModifierKeys;

function _load_getModifierKeys() {
  return _getModifierKeys = require('./getModifierKeys');
}

var _DatatipComponent;

function _load_DatatipComponent() {
  return _DatatipComponent = require('./DatatipComponent');
}

var _isScrollable;

function _load_isScrollable() {
  return _isScrollable = _interopRequireDefault(require('./isScrollable'));
}

var _PinnedDatatip;

function _load_PinnedDatatip() {
  return _PinnedDatatip = require('./PinnedDatatip');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_DATATIP_DEBOUNCE_DELAY = 1000; /**
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

/* global performance */

const DEFAULT_DATATIP_INTERACTED_DEBOUNCE_DELAY = 1000;

function getProviderName(provider) {
  if (provider.providerName == null) {
    (0, (_log4js || _load_log4js()).getLogger)('datatip').error('Datatip provider has no name', provider);
    return 'unknown';
  }
  return provider.providerName;
}

function getBufferPosition(editor, editorView, event) {
  if (!event) {
    return null;
  }

  const text = editorView.component;
  if (!text) {
    return null;
  }

  const screenPosition = text.screenPositionForMouseEvent(event);
  const pixelPosition = text.pixelPositionForMouseEvent(event);
  const pixelPositionFromScreenPosition = text.pixelPositionForScreenPosition(screenPosition);
  // Distance (in pixels) between screenPosition and the cursor.
  const horizontalDistance = pixelPosition.left - pixelPositionFromScreenPosition.left;
  // `screenPositionForMouseEvent.column` cannot exceed the current line length.
  // This is essentially a heuristic for "mouse cursor is to the left or right
  // of text content".
  if (pixelPosition.left < 0 || horizontalDistance > editor.getDefaultCharWidth()) {
    return null;
  }
  return editor.bufferPositionForScreenPosition(screenPosition);
}

function PinnableDatatip({
  datatip,
  editor,
  onPinClick
}) {
  let action;
  let actionTitle;
  // Datatips are pinnable by default, unless explicitly specified
  // otherwise.
  if (datatip.pinnable !== false) {
    action = (_DatatipComponent || _load_DatatipComponent()).DATATIP_ACTIONS.PIN;
    actionTitle = 'Pin this Datatip';
  }

  return (
    // $FlowFixMe(>=0.53.0) Flow suppress
    _react.createElement((_DatatipComponent || _load_DatatipComponent()).DatatipComponent, {
      action: action,
      actionTitle: actionTitle,
      datatip: datatip,
      onActionClick: () => onPinClick(editor, datatip)
    })
  );
}

function mountDatatipWithMarker(editor, element, range, renderedProviders, position) {
  // Highlight the text indicated by the datatip's range.
  const highlightMarker = editor.markBufferRange(range, {
    invalidate: 'never'
  });
  editor.decorateMarker(highlightMarker, {
    type: 'highlight',
    class: 'datatip-highlight-region'
  });

  // The actual datatip should appear at the trigger position.
  const overlayMarker = editor.markBufferRange(new _atom.Range(position, position), {
    invalidate: 'never'
  });
  editor.decorateMarker(overlayMarker, {
    type: 'overlay',
    position: 'tail',
    item: element
  });

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => highlightMarker.destroy(), () => overlayMarker.destroy(),
  // The editor may not mount the marker until the next update.
  // It's not safe to render anything until that point, as datatips
  // often need to measure their size in the DOM.
  _rxjsBundlesRxMinJs.Observable.from(editor.getElement().getNextUpdatePromise()).subscribe(() => {
    element.style.display = 'block';
    _reactDom.default.render(renderedProviders, element);
  }));
}

const DatatipState = Object.freeze({
  HIDDEN: 'HIDDEN',
  FETCHING: 'FETCHING',
  VISIBLE: 'VISIBLE'
});


function ensurePositiveNumber(value, defaultValue) {
  if (typeof value !== 'number' || value < 0) {
    return defaultValue;
  }
  return value;
}

class DatatipManagerForEditor {

  constructor(editor, datatipProviders, modifierDatatipProviders) {
    _initialiseProps.call(this);

    this._editor = editor;
    this._editorView = atom.views.getView(editor);
    this._pinnedDatatips = new Set();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._datatipProviders = datatipProviders;
    this._modifierDatatipProviders = modifierDatatipProviders;
    this._datatipElement = document.createElement('div');
    this._datatipElement.className = 'datatip-overlay';
    this._datatipState = DatatipState.HIDDEN;
    this._heldKeys = new Set();
    this._interactedWith = false;
    this._checkedScrollable = false;
    this._isScrollable = false;
    this._lastHiddenTime = 0;
    this._lastFetchedFromCursorPosition = false;
    this._shouldDropNextMouseMoveAfterFocus = false;

    this._subscriptions.add((_featureConfig || _load_featureConfig()).default.observe('atom-ide-datatip.datatipDebounceDelay', () => this._setStartFetchingDebounce()), (_featureConfig || _load_featureConfig()).default.observe('atom-ide-datatip.datatipInteractedWithDebounceDelay', () => this._setHideIfOutsideDebounce()), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'focus').subscribe(e => {
      this._shouldDropNextMouseMoveAfterFocus = true;
      if (!this._insideDatatip) {
        this._setState(DatatipState.HIDDEN);
      }
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'blur').subscribe(e => {
      if (!this._insideDatatip) {
        this._setState(DatatipState.HIDDEN);
      }
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'mousemove').subscribe(e => {
      this._lastFetchedFromCursorPosition = false;
      if (this._shouldDropNextMouseMoveAfterFocus) {
        this._shouldDropNextMouseMoveAfterFocus = false;
        return;
      }

      this._lastMoveEvent = e;
      this._heldKeys = (0, (_getModifierKeys || _load_getModifierKeys()).getModifierKeysFromMouseEvent)(e);
      if (this._datatipState === DatatipState.HIDDEN) {
        this._startFetchingDebounce();
      } else {
        this._hideIfOutside();
      }
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'mouseleave').subscribe(() => {
      this._lastMoveEvent = null;
      this._hideIfOutside();
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'mousedown').subscribe(e => {
      let node = e.target;
      while (node != null) {
        if (node === this._datatipElement) {
          return;
        }
        node = node.parentNode;
      }

      this._hideOrCancel();
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'keydown').subscribe(e => {
      const modifierKey = (0, (_getModifierKeys || _load_getModifierKeys()).getModifierKeyFromKeyboardEvent)(e);
      if (modifierKey) {
        // On Windows, key repeat applies to modifier keys too!
        // So it's quite possible that we hit this twice without hitting keyup.
        if (this._heldKeys.has(modifierKey)) {
          return;
        }
        this._heldKeys.add(modifierKey);
        if (this._datatipState !== DatatipState.HIDDEN) {
          this._fetchInResponseToKeyPress();
        }
      } else {
        this._hideOrCancel();
      }
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'keyup').subscribe(e => {
      const modifierKey = (0, (_getModifierKeys || _load_getModifierKeys()).getModifierKeyFromKeyboardEvent)(e);
      if (modifierKey) {
        this._heldKeys.delete(modifierKey);
        if (this._datatipState !== DatatipState.HIDDEN) {
          this._fetchInResponseToKeyPress();
        }
      }
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._datatipElement, 'wheel').subscribe(e => {
      // We'll mark this as an 'interaction' only if the scroll target was scrollable.
      // This requires going over the ancestors, so only check this once.
      // If it comes back as false, we won't bother checking again.
      if (!this._checkedScrollable) {
        this._isScrollable = (0, (_isScrollable || _load_isScrollable()).default)(this._datatipElement, e);
        this._checkedScrollable = true;
      }
      if (this._isScrollable) {
        this._interactedWith = true;
        e.stopPropagation();
      }
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._datatipElement, 'mousedown').subscribe(() => {
      this._interactedWith = true;
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._datatipElement, 'mouseenter').subscribe(() => {
      this._insideDatatip = true;
      this._hideIfOutside();
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._datatipElement, 'mouseleave').subscribe(() => {
      this._insideDatatip = false;
      this._hideIfOutside();
    }), this._editorView.onDidChangeScrollTop(() => {
      this._lastMoveEvent = null;
      if (this._datatipState === DatatipState.VISIBLE) {
        this._setState(DatatipState.HIDDEN);
      }
    }), this._editor.getBuffer().onDidChangeText(() => {
      if (this._datatipState === DatatipState.VISIBLE) {
        this._setState(DatatipState.HIDDEN);
      }
    }), atom.commands.add('atom-text-editor', 'datatip:toggle', this._toggleDatatip), atom.commands.add('atom-text-editor', 'datatip:copy-to-clipboard', this._copyDatatipToClipboard));
  }

  _fetchInResponseToKeyPress() {
    if (this._lastFetchedFromCursorPosition) {
      this._startFetching(() => this._editor.getCursorBufferPosition());
    } else {
      this._startFetching(() => getBufferPosition(this._editor, this._editorView, this._lastMoveEvent));
    }
  }

  _setStartFetchingDebounce() {
    this._startFetchingDebounce = (0, (_debounce || _load_debounce()).default)(() => {
      this._startFetching(() => getBufferPosition(this._editor, this._editorView, this._lastMoveEvent));
    }, ensurePositiveNumber((_featureConfig || _load_featureConfig()).default.get('atom-ide-datatip.datatipDebounceDelay'), DEFAULT_DATATIP_DEBOUNCE_DELAY),
    /* immediate */false);
  }

  _setHideIfOutsideDebounce() {
    this._hideIfOutsideDebounce = (0, (_debounce || _load_debounce()).default)(() => {
      this._hideIfOutsideImmediate();
    }, ensurePositiveNumber((_featureConfig || _load_featureConfig()).default.get('atom-ide-datatip.datatipInteractedWithDebounceDelay'), DEFAULT_DATATIP_INTERACTED_DEBOUNCE_DELAY),
    /* immediate */false);
  }

  dispose() {
    this._setState(DatatipState.HIDDEN);
    this._subscriptions.dispose();
    this._datatipElement.remove();
  }

  _setState(newState) {
    const oldState = this._datatipState;
    this._datatipState = newState;

    if (newState === DatatipState.HIDDEN) {
      this._blacklistedPosition = null;
      if (oldState !== DatatipState.HIDDEN) {
        this._hideDatatip();
      }
    }
  }

  _startFetching(getPosition) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const position = getPosition();
      if (!position) {
        return;
      }

      const data = yield _this._fetchAndRender(position);
      if (data == null) {
        _this._setState(DatatipState.HIDDEN);
        return;
      }
      if (_this._datatipState !== DatatipState.FETCHING) {
        _this._setState(DatatipState.HIDDEN);
      }

      if (_this._blacklistedPosition && data.range && data.range.containsPoint(_this._blacklistedPosition)) {
        _this._setState(DatatipState.HIDDEN);
        return;
      }

      const currentPosition = getPosition();
      if (!currentPosition || !data.range || !data.range.containsPoint(currentPosition)) {
        _this._setState(DatatipState.HIDDEN);
        return;
      }

      if (_this._isHoveringOverPinnedTip()) {
        _this._setState(DatatipState.HIDDEN);
        return;
      }

      _this._setState(DatatipState.VISIBLE);
      _this._interactedWith = false;
      _this._checkedScrollable = false;
      _this._range = data.range;

      if (_this._markerDisposable) {
        _this._markerDisposable.dispose();
      }
      _this._markerDisposable = mountDatatipWithMarker(_this._editor, _this._datatipElement, data.range, data.renderedProviders, currentPosition);
    })();
  }

  _fetch(position) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._setState(DatatipState.FETCHING);

      let results;
      if (_this2._lastPosition != null && position.isEqual(_this2._lastPosition) && _this2._lastResultsPromise != null) {
        results = _this2._lastResultsPromise;
      } else {
        _this2._lastResultsPromise = getDatatipResults(_this2._datatipProviders, _this2._editor, position, function (provider) {
          return provider.datatip(_this2._editor, position);
        });
        results = _this2._lastResultsPromise;
        _this2._lastPosition = position;
      }

      return (yield results).concat((yield getDatatipResults(_this2._modifierDatatipProviders, _this2._editor, position, function (provider) {
        return provider.modifierDatatip(_this2._editor, position, _this2._heldKeys);
      })));
    })();
  }

  _fetchAndRender(position) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const datatipsAndProviders = yield _this3._fetch(position);
      if (datatipsAndProviders.length === 0) {
        return null;
      }

      const range = datatipsAndProviders[0].datatip.range;
      (_analytics || _load_analytics()).default.track('datatip-popup', {
        scope: _this3._editor.getGrammar().scopeName,
        providerName: getProviderName(datatipsAndProviders[0].provider),
        rangeStartRow: String(range.start.row),
        rangeStartColumn: String(range.start.column),
        rangeEndRow: String(range.end.row),
        rangeEndColumn: String(range.end.column)
      });

      const renderedProviders = _react.createElement(
        'div',
        null,
        datatipsAndProviders.map(function ({ datatip, provider }) {
          return _react.createElement(PinnableDatatip, {
            datatip: datatip,
            editor: _this3._editor,
            key: getProviderName(provider),
            onPinClick: _this3._handlePinClicked
          });
        })
      );

      return {
        range,
        renderedProviders
      };
    })();
  }

  _isHoveringOverPinnedTip() {
    const pinnedDataTips = Array.from(this._pinnedDatatips.values());
    const hoveringTips = pinnedDataTips.filter(dt => dt.isHovering());
    return hoveringTips != null && hoveringTips.length > 0;
  }

  _hideDatatip() {
    this._lastHiddenTime = performance.now();
    if (this._markerDisposable) {
      this._markerDisposable.dispose();
      this._markerDisposable = null;
    }
    this._range = null;
    _reactDom.default.unmountComponentAtNode(this._datatipElement);
    this._datatipElement.style.display = 'none';
  }

  _hideOrCancel() {
    if (this._datatipState === DatatipState.HIDDEN || this._datatipState === DatatipState.FETCHING) {
      if (this._blacklistedPosition == null) {
        this._blacklistedPosition = getBufferPosition(this._editor, this._editorView, this._lastMoveEvent);
      }
      return;
    }

    this._setState(DatatipState.HIDDEN);
  }

  _hideIfOutside() {
    if (this._datatipState !== DatatipState.VISIBLE) {
      return;
    }

    if (this._interactedWith) {
      this._hideIfOutsideDebounce();
    } else {
      this._hideIfOutsideImmediate();
    }
  }

  _hideIfOutsideImmediate() {
    if (this._datatipState !== DatatipState.VISIBLE) {
      return;
    }
    if (this._insideDatatip) {
      return;
    }

    if (this._isHoveringOverPinnedTip()) {
      this._setState(DatatipState.HIDDEN);
      return;
    }

    const currentPosition = getBufferPosition(this._editor, this._editorView, this._lastMoveEvent);
    if (currentPosition && this._range && this._range.containsPoint(currentPosition)) {
      return;
    }

    this._setState(DatatipState.HIDDEN);
  }

  createPinnedDataTip(datatip, editor, options) {
    const pinnedDatatip = new (_PinnedDatatip || _load_PinnedDatatip()).PinnedDatatip(datatip, editor, Object.assign({}, options, {
      onDispose: () => {
        this._pinnedDatatips.delete(pinnedDatatip);
      },
      hideDataTips: () => {
        this._hideDatatip();
      }
    }));
    return pinnedDatatip;
  }

}

var _initialiseProps = function () {
  var _this4 = this;

  this._handlePinClicked = (editor, datatip) => {
    (_analytics || _load_analytics()).default.track('datatip-pinned-open');
    const startTime = (0, (_performanceNow || _load_performanceNow()).default)();
    this._setState(DatatipState.HIDDEN);
    this._pinnedDatatips.add(new (_PinnedDatatip || _load_PinnedDatatip()).PinnedDatatip(datatip, editor, {
      onDispose: pinnedDatatip => {
        this._pinnedDatatips.delete(pinnedDatatip);
        (_analytics || _load_analytics()).default.track('datatip-pinned-close', {
          duration: (0, (_performanceNow || _load_performanceNow()).default)() - startTime
        });
      },
      hideDataTips: () => {
        this._hideDatatip();
      },
      position: 'end-of-line'
    }));
  };

  this._toggleDatatip = e => {
    var _ref, _ref2;

    if (atom.workspace.getActiveTextEditor() !== this._editor) {
      return;
    }

    // Note that we don't need to hide the tooltip, we already hide it on
    // keydown, which is going to be triggered before the key binding which is
    // evaluated on keyup.
    // $FlowFixMe (v0.54.1 <)
    const maybeEventType = (_ref = e) != null ? (_ref2 = _ref.originalEvent) != null ? _ref2.type : _ref2 : _ref;

    // Unfortunately, when you do keydown of the shortcut, it's going to
    // hide it, we need to make sure that when we do keyup, it doesn't show
    // it up right away. We assume that a keypress is done within 100ms
    // and don't show it again if it was hidden so soon.
    const forceShow = maybeEventType === 'keydown' && performance.now() - this._lastHiddenTime > 100;
    const forceHide = maybeEventType === 'keyup';
    const forceToggle = maybeEventType !== 'keydown' && maybeEventType !== 'keyup';

    if (
    // if we have event information, prefer that for determining show/hide
    forceShow || forceToggle && this._datatipState === DatatipState.HIDDEN) {
      this._lastFetchedFromCursorPosition = true;
      this._startFetching(() => this._editor.getCursorScreenPosition());
    } else if (forceHide || forceToggle) {
      this._hideOrCancel();
    }
  };

  this._copyDatatipToClipboard = (0, _asyncToGenerator.default)(function* () {
    var _ref3, _ref4;

    if (atom.workspace.getActiveTextEditor() !== _this4._editor) {
      return;
    }

    const pos = _this4._editor.getCursorScreenPosition();
    if (pos == null) {
      return;
    }
    const results = yield _this4._fetch(pos);
    _this4._setState(DatatipState.HIDDEN);

    const tip = (_ref3 = results) != null ? (_ref4 = _ref3[0]) != null ? _ref4.datatip : _ref4 : _ref3;
    if (tip == null || tip.markedStrings == null) {
      return;
    }

    const markedStrings = tip.markedStrings;
    if (markedStrings == null) {
      return;
    }

    const value = markedStrings.map(function (string) {
      return string.value;
    }).join();
    if (value === '') {
      return;
    }

    atom.clipboard.write(value);
    atom.notifications.addInfo(`Copied data tip to clipboard: \`\`\`${value}\`\`\``);
  });
};

class DatatipManager {

  constructor() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._editorManagers = new Map();
    this._datatipProviders = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._modifierDatatipProviders = new (_ProviderRegistry || _load_ProviderRegistry()).default();

    this._subscriptions.add((0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
      const manager = new DatatipManagerForEditor(editor, this._datatipProviders, this._modifierDatatipProviders);
      this._editorManagers.set(editor, manager);
      const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
        manager.dispose();
        this._editorManagers.delete(editor);
      });
      this._subscriptions.add(disposable);
      editor.onDidDestroy(() => disposable.dispose());
    }));
  }

  addProvider(provider) {
    return this._datatipProviders.addProvider(provider);
  }

  addModifierProvider(provider) {
    return this._modifierDatatipProviders.addProvider(provider);
  }

  createPinnedDataTip(datatip, editor, options) {
    const manager = this._editorManagers.get(editor);
    if (!manager) {
      throw new Error('Trying to create a pinned data tip on an editor that has ' + 'no datatip manager');
    }
    return manager.createPinnedDataTip(datatip, editor, options);
  }

  dispose() {
    this._subscriptions.dispose();
    this._editorManagers.forEach(manager => {
      manager.dispose();
    });
    this._editorManagers = new Map();
  }
}
exports.DatatipManager = DatatipManager;