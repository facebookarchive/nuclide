"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatatipManager = void 0;

var _atom = require("atom");

function _promise() {
  const data = require("../../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _debounce() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/debounce"));

  _debounce = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _performanceNow() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/performanceNow"));

  _performanceNow = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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

function _getModifierKeys() {
  const data = require("./getModifierKeys");

  _getModifierKeys = function () {
    return data;
  };

  return data;
}

function _DatatipComponent() {
  const data = require("./DatatipComponent");

  _DatatipComponent = function () {
    return data;
  };

  return data;
}

function _isScrollable() {
  const data = _interopRequireDefault(require("./isScrollable"));

  _isScrollable = function () {
    return data;
  };

  return data;
}

function _PinnedDatatip() {
  const data = require("./PinnedDatatip");

  _PinnedDatatip = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/* global performance */
const DEFAULT_DATATIP_DEBOUNCE_DELAY = 1000;
const DEFAULT_DATATIP_INTERACTED_DEBOUNCE_DELAY = 1000;
const TRACK_SAMPLE_RATE = 10;

function getProviderName(provider) {
  if (provider.providerName == null) {
    (0, _log4js().getLogger)('datatip').error('Datatip provider has no name', provider);
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
  const pixelPositionFromScreenPosition = text.pixelPositionForScreenPosition(screenPosition); // Distance (in pixels) between screenPosition and the cursor.

  const horizontalDistance = pixelPosition.left - pixelPositionFromScreenPosition.left; // `screenPositionForMouseEvent.column` cannot exceed the current line length.
  // This is essentially a heuristic for "mouse cursor is to the left or right
  // of text content".

  if (pixelPosition.left <= 0 || horizontalDistance > editor.getDefaultCharWidth()) {
    return null;
  }

  return editor.bufferPositionForScreenPosition(screenPosition);
}

async function getDatatipResults(providers, editor, position, invoke) {
  const filteredDatatipProviders = Array.from(providers.getAllProvidersForEditor(editor));

  if (filteredDatatipProviders.length === 0) {
    return [];
  }

  const promises = filteredDatatipProviders.map(async provider => {
    const name = getProviderName(provider);

    try {
      return await _analytics().default.trackTimingSampled(name + '.datatip', async () => {
        const datatip = await invoke(provider);

        if (!datatip) {
          return null;
        }

        return {
          datatip,
          provider
        };
      }, TRACK_SAMPLE_RATE, {
        path: editor.getPath()
      });
    } catch (e) {
      (0, _log4js().getLogger)('datatip').error(`Error getting datatip from provider ${name}`, e);
      return null;
    }
  });

  if (_featureConfig().default.get('atom-ide-datatip.onlyTopDatatip')) {
    const result = await (0, _promise().asyncFind)(promises, x => x);
    return result != null ? [result] : [];
  } else {
    return (await Promise.all(promises)).filter(Boolean);
  }
}

function PinnableDatatip({
  datatip,
  editor,
  onPinClick
}) {
  let action;
  let actionTitle; // Datatips are pinnable by default, unless explicitly specified
  // otherwise.

  if (datatip.pinnable !== false) {
    action = _DatatipComponent().DATATIP_ACTIONS.PIN;
    actionTitle = 'Pin this Datatip';
  }

  return (// $FlowFixMe(>=0.53.0) Flow suppress
    React.createElement(_DatatipComponent().DatatipComponent, {
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
  }); // The actual datatip should appear at the trigger position.

  const overlayMarker = editor.markBufferRange(new _atom.Range(position, position), {
    invalidate: 'never'
  });
  return new (_UniversalDisposable().default)(() => highlightMarker.destroy(), () => overlayMarker.destroy(), // The editor may not mount the marker until the next update.
  // It's not safe to render anything until that point, as datatips
  // often need to measure their size in the DOM.
  _RxMin.Observable.from(editor.getElement().getNextUpdatePromise()).subscribe(() => {
    editor.decorateMarker(overlayMarker, {
      type: 'overlay',
      position: 'tail',
      item: element
    });
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
    this._subscriptions = new (_UniversalDisposable().default)();
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

    this._subscriptions.add(_featureConfig().default.observe('atom-ide-datatip.datatipDebounceDelay', () => this._setStartFetchingDebounce()), _featureConfig().default.observe('atom-ide-datatip.datatipInteractedWithDebounceDelay', () => this._setHideIfOutsideDebounce()), _RxMin.Observable.fromEvent(this._editorView, 'focus').subscribe(e => {
      this._shouldDropNextMouseMoveAfterFocus = true;

      if (!this._insideDatatip) {
        this._setState(DatatipState.HIDDEN);
      }
    }), _RxMin.Observable.fromEvent(this._editorView, 'blur').subscribe(e => {
      if (!this._insideDatatip) {
        this._setState(DatatipState.HIDDEN);
      }
    }), _RxMin.Observable.fromEvent(this._editorView, 'mousemove').subscribe(e => {
      this._lastFetchedFromCursorPosition = false;

      if (this._shouldDropNextMouseMoveAfterFocus) {
        this._shouldDropNextMouseMoveAfterFocus = false;
        return;
      }

      this._lastMoveEvent = e;
      this._heldKeys = (0, _getModifierKeys().getModifierKeysFromMouseEvent)(e);

      if (this._datatipState === DatatipState.HIDDEN) {
        this._startFetchingDebounce();
      } else {
        this._hideIfOutside();
      }
    }), _RxMin.Observable.fromEvent(this._editorView, 'mouseleave').subscribe(() => {
      this._lastMoveEvent = null;

      this._hideIfOutside();
    }), _RxMin.Observable.fromEvent(this._editorView, 'mousedown').subscribe(e => {
      let node = e.target;

      while (node != null) {
        if (node === this._datatipElement) {
          return;
        }

        node = node.parentNode;
      }

      this._hideOrCancel();
    }), _RxMin.Observable.fromEvent(this._editorView, 'keydown').subscribe(e => {
      const modifierKey = (0, _getModifierKeys().getModifierKeyFromKeyboardEvent)(e);

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
    }), _RxMin.Observable.fromEvent(this._editorView, 'keyup').subscribe(e => {
      const modifierKey = (0, _getModifierKeys().getModifierKeyFromKeyboardEvent)(e);

      if (modifierKey) {
        this._heldKeys.delete(modifierKey);

        if (this._datatipState !== DatatipState.HIDDEN) {
          this._fetchInResponseToKeyPress();
        }
      }
    }), _RxMin.Observable.fromEvent(this._datatipElement, 'wheel').subscribe(e => {
      // We'll mark this as an 'interaction' only if the scroll target was scrollable.
      // This requires going over the ancestors, so only check this once.
      // If it comes back as false, we won't bother checking again.
      if (!this._checkedScrollable) {
        this._isScrollable = (0, _isScrollable().default)(this._datatipElement, e);
        this._checkedScrollable = true;
      }

      if (this._isScrollable) {
        this._interactedWith = true;
        e.stopPropagation();
      }
    }), _RxMin.Observable.fromEvent(this._datatipElement, 'mousedown').subscribe(() => {
      this._interactedWith = true;
    }), _RxMin.Observable.fromEvent(this._datatipElement, 'mouseenter').subscribe(() => {
      this._insideDatatip = true;

      this._hideIfOutside();
    }), _RxMin.Observable.fromEvent(this._datatipElement, 'mouseleave').subscribe(() => {
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
    this._startFetchingDebounce = (0, _debounce().default)(() => {
      this._startFetching(() => getBufferPosition(this._editor, this._editorView, this._lastMoveEvent));
    }, ensurePositiveNumber(_featureConfig().default.get('atom-ide-datatip.datatipDebounceDelay'), DEFAULT_DATATIP_DEBOUNCE_DELAY),
    /* immediate */
    false);
  }

  _setHideIfOutsideDebounce() {
    this._hideIfOutsideDebounce = (0, _debounce().default)(() => {
      this._hideIfOutsideImmediate();
    }, ensurePositiveNumber(_featureConfig().default.get('atom-ide-datatip.datatipInteractedWithDebounceDelay'), DEFAULT_DATATIP_INTERACTED_DEBOUNCE_DELAY),
    /* immediate */
    false);
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

  async _startFetching(getPosition) {
    const position = getPosition();

    if (!position) {
      return;
    }

    const data = await this._fetchAndRender(position);

    if (data == null) {
      this._setState(DatatipState.HIDDEN);

      return;
    }

    if (this._datatipState !== DatatipState.FETCHING) {
      this._setState(DatatipState.HIDDEN);
    }

    if (this._blacklistedPosition && data.range && data.range.containsPoint(this._blacklistedPosition)) {
      this._setState(DatatipState.HIDDEN);

      return;
    }

    const currentPosition = getPosition();

    if (!currentPosition || !data.range || !data.range.containsPoint(currentPosition)) {
      this._setState(DatatipState.HIDDEN);

      return;
    }

    if (this._isHoveringOverPinnedTip()) {
      this._setState(DatatipState.HIDDEN);

      return;
    }

    this._setState(DatatipState.VISIBLE);

    this._interactedWith = false;
    this._checkedScrollable = false;
    this._range = data.range;

    if (this._markerDisposable) {
      this._markerDisposable.dispose();
    }

    this._markerDisposable = mountDatatipWithMarker(this._editor, this._datatipElement, data.range, data.renderedProviders, currentPosition);
  }

  async _fetch(position) {
    this._setState(DatatipState.FETCHING);

    let results;

    if (this._lastPosition != null && position.isEqual(this._lastPosition) && this._lastResultsPromise != null) {
      results = this._lastResultsPromise;
    } else {
      this._lastResultsPromise = getDatatipResults(this._datatipProviders, this._editor, position, provider => provider.datatip(this._editor, position));
      results = this._lastResultsPromise;
      this._lastPosition = position;
    }

    return (await results).concat((await getDatatipResults(this._modifierDatatipProviders, this._editor, position, provider => provider.modifierDatatip(this._editor, position, this._heldKeys))));
  }

  async _fetchAndRender(position) {
    const datatipsAndProviders = await this._fetch(position);

    if (datatipsAndProviders.length === 0) {
      return null;
    }

    const range = datatipsAndProviders[0].datatip.range;

    _analytics().default.track('datatip-popup', {
      scope: this._editor.getGrammar().scopeName,
      providerName: getProviderName(datatipsAndProviders[0].provider),
      rangeStartRow: String(range.start.row),
      rangeStartColumn: String(range.start.column),
      rangeEndRow: String(range.end.row),
      rangeEndColumn: String(range.end.column)
    });

    const renderedProviders = React.createElement("div", null, datatipsAndProviders.map(({
      datatip,
      provider
    }) => React.createElement(PinnableDatatip, {
      datatip: datatip,
      editor: this._editor,
      key: getProviderName(provider),
      onPinClick: this._handlePinClicked
    })));
    return {
      range,
      renderedProviders
    };
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
    const pinnedDatatip = new (_PinnedDatatip().PinnedDatatip)(datatip, editor, Object.assign({}, options, {
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
  this._handlePinClicked = (editor, datatip) => {
    _analytics().default.track('datatip-pinned-open');

    const startTime = (0, _performanceNow().default)();

    this._setState(DatatipState.HIDDEN);

    this._pinnedDatatips.add(new (_PinnedDatatip().PinnedDatatip)(datatip, editor, {
      onDispose: pinnedDatatip => {
        this._pinnedDatatips.delete(pinnedDatatip);

        _analytics().default.track('datatip-pinned-close', {
          duration: (0, _performanceNow().default)() - startTime
        });
      },
      hideDataTips: () => {
        this._hideDatatip();
      },
      position: 'end-of-line'
    }));
  };

  this._toggleDatatip = e => {
    var _ref;

    if (atom.workspace.getActiveTextEditor() !== this._editor) {
      return;
    } // Note that we don't need to hide the tooltip, we already hide it on
    // keydown, which is going to be triggered before the key binding which is
    // evaluated on keyup.
    // $FlowFixMe (v0.54.1 <)


    const maybeEventType = (_ref = e) != null ? (_ref = _ref.originalEvent) != null ? _ref.type : _ref : _ref; // Unfortunately, when you do keydown of the shortcut, it's going to
    // hide it, we need to make sure that when we do keyup, it doesn't show
    // it up right away. We assume that a keypress is done within 100ms
    // and don't show it again if it was hidden so soon.

    const forceShow = maybeEventType === 'keydown' && performance.now() - this._lastHiddenTime > 100;
    const forceHide = maybeEventType === 'keyup';
    const forceToggle = maybeEventType !== 'keydown' && maybeEventType !== 'keyup';

    if ( // if we have event information, prefer that for determining show/hide
    forceShow || forceToggle && this._datatipState === DatatipState.HIDDEN) {
      this._lastFetchedFromCursorPosition = true;

      this._startFetching(() => this._editor.getCursorScreenPosition());
    } else if (forceHide || forceToggle) {
      this._hideOrCancel();
    }
  };

  this._copyDatatipToClipboard = async () => {
    var _ref2;

    if (atom.workspace.getActiveTextEditor() !== this._editor) {
      return;
    }

    const pos = this._editor.getCursorScreenPosition();

    if (pos == null) {
      return;
    }

    const results = await this._fetch(pos);

    this._setState(DatatipState.HIDDEN);

    const tip = (_ref2 = results) != null ? (_ref2 = _ref2[0]) != null ? _ref2.datatip : _ref2 : _ref2;

    if (tip == null || tip.markedStrings == null) {
      return;
    }

    const markedStrings = tip.markedStrings;

    if (markedStrings == null) {
      return;
    }

    const value = markedStrings.map(string => string.value).join();

    if (value === '') {
      return;
    }

    atom.clipboard.write(value);
    atom.notifications.addInfo(`Copied data tip to clipboard: \`\`\`${value}\`\`\``);
  };
};

class DatatipManager {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)();
    this._editorManagers = new WeakMap();
    this._datatipProviders = new (_ProviderRegistry().default)();
    this._modifierDatatipProviders = new (_ProviderRegistry().default)();

    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
      const manager = new DatatipManagerForEditor(editor, this._datatipProviders, this._modifierDatatipProviders);

      this._editorManagers.set(editor, manager);

      this._subscriptions.addUntilDestroyed(editor, manager);
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
  }

}

exports.DatatipManager = DatatipManager;