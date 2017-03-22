'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatatipManager = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let fetchDatatip = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor, position, allProviders, onPinClick) {
    const { scopeName } = editor.getGrammar();
    const providers = filterProvidersByScopeName(allProviders, scopeName);
    if (providers.length === 0) {
      return null;
    }

    const datatipsAndProviders = (0, (_collection || _load_collection()).arrayCompact)((yield Promise.all(providers.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (provider) {
        const name = getProviderName(provider);
        const datatip = yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(name + '.datatip', function () {
          return provider.datatip(editor, position);
        });

        if (!datatip) {
          return null;
        }

        return {
          datatip,
          provider
        };
      });

      return function (_x5) {
        return _ref2.apply(this, arguments);
      };
    })()))));

    // Providers are already sorted by priority and we've already removed the ones
    // with no datatip, so just grab the first one.
    const [topDatatipAndProvider] = datatipsAndProviders;
    if (topDatatipAndProvider == null) {
      return null;
    }
    const topDatatip = topDatatipAndProvider.datatip;

    if (!(topDatatip != null)) {
      throw new Error('Invariant violation: "topDatatip != null"');
    }

    const { range } = topDatatip;
    const providerName = getProviderName(topDatatipAndProvider.provider);

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('datatip-popup', {
      scope: scopeName,
      providerName,
      rangeStartRow: String(range.start.row),
      rangeStartColumn: String(range.start.column),
      rangeEndRow: String(range.end.row),
      rangeEndColumn: String(range.end.column)
    });

    const renderedProvider = renderProvider(topDatatip, editor, providerName, onPinClick);

    return {
      range,
      renderedProvider
    };
  });

  return function fetchDatatip(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DatatipComponent;

function _load_DatatipComponent() {
  return _DatatipComponent = require('./DatatipComponent');
}

var _PinnedDatatip;

function _load_PinnedDatatip() {
  return _PinnedDatatip = require('./PinnedDatatip');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('../../commons-node/performanceNow'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

/* global performance */

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const CUMULATIVE_WHEELX_THRESHOLD = 20;
const DEFAULT_DATATIP_DEBOUNCE_DELAY = 1000;
const DEFAULT_DATATIP_INTERACTED_DEBOUNCE_DELAY = 1000;

function getProviderName(provider) {
  if (provider.providerName == null) {
    logger.error('Datatip provider has no name', provider);
    return 'unknown';
  }
  return provider.providerName;
}

function filterProvidersByScopeName(providers, scopeName) {
  return providers.filter(provider => {
    return provider.inclusionPriority > 0 && provider.validForScope(scopeName);
  }).sort((providerA, providerB) => {
    return providerA.inclusionPriority - providerB.inclusionPriority;
  });
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

function renderProvider(datatip, editor, providerName, onPinClick) {
  const { pinnable, component } = datatip;
  const ProvidedComponent = component;

  let action;
  let actionTitle;
  // Datatips are pinnable by default, unless explicitly specified
  // otherwise.
  if (pinnable !== false) {
    action = (_DatatipComponent || _load_DatatipComponent()).DATATIP_ACTIONS.PIN;
    actionTitle = 'Pin this Datatip';
  }

  return _react.default.createElement(
    (_DatatipComponent || _load_DatatipComponent()).DatatipComponent,
    {
      action: action,
      actionTitle: actionTitle,
      onActionClick: () => onPinClick(editor, datatip),
      key: providerName },
    _react.default.createElement(ProvidedComponent, null)
  );
}

function renderDatatip(editor, element, { range, renderedProvider }) {
  // Transform the matched element range to the hint range.
  const marker = editor.markBufferRange(range, { invalidate: 'never' });

  _reactDom.default.render(renderedProvider, element);
  element.style.display = 'block';

  editor.decorateMarker(marker, {
    type: 'overlay',
    position: 'tail',
    item: element
  });

  editor.decorateMarker(marker, {
    type: 'highlight',
    class: 'nuclide-datatip-highlight-region'
  });

  return marker;
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

  constructor(editor, datatipProviders) {
    this._editor = editor;
    this._editorView = atom.views.getView(editor);
    this._pinnedDatatips = new Set();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._datatipProviders = datatipProviders;
    this._datatipElement = document.createElement('div');
    this._datatipElement.className = 'nuclide-datatip-overlay';
    this._datatipState = DatatipState.HIDDEN;
    this._interactedWith = false;
    this._cumulativeWheelX = 0;
    this._lastHiddenTime = 0;
    this._shouldDropNextMouseMoveAfterFocus = false;

    this._subscriptions.add((_featureConfig || _load_featureConfig()).default.observe('nuclide-datatip.datatipDebounceDelay', () => this._setStartFetchingDebounce()), (_featureConfig || _load_featureConfig()).default.observe('nuclide-datatip.datatipInteractedWithDebounceDelay', () => this._setHideIfOutsideDebounce()), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'focus').subscribe(e => {
      this._shouldDropNextMouseMoveAfterFocus = true;
      if (!this._insideDatatip) {
        this._setState(DatatipState.HIDDEN);
      }
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'blur').subscribe(e => {
      if (!this._insideDatatip) {
        this._setState(DatatipState.HIDDEN);
      }
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'mousemove').subscribe(e => {
      if (this._shouldDropNextMouseMoveAfterFocus) {
        this._shouldDropNextMouseMoveAfterFocus = false;
        return;
      }

      this._lastMoveEvent = e;
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
      while (node !== null) {
        if (node === this._datatipElement) {
          return;
        }
        node = node.parentNode;
      }

      this._hideOrCancel();
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'keydown').subscribe(e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      this._hideOrCancel();
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(this._datatipElement, 'wheel').subscribe(e => {
      this._cumulativeWheelX += Math.abs(e.deltaX);
      if (this._cumulativeWheelX > CUMULATIVE_WHEELX_THRESHOLD) {
        this._interactedWith = true;
      }
      if (this._interactedWith) {
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
    }), atom.commands.add('atom-text-editor', 'nuclide-datatip:toggle', this._toggleDatatip.bind(this)));
  }

  _setStartFetchingDebounce() {
    this._startFetchingDebounce = (0, (_debounce || _load_debounce()).default)(() => {
      this._startFetching(() => getBufferPosition(this._editor, this._editorView, this._lastMoveEvent));
    }, ensurePositiveNumber((_featureConfig || _load_featureConfig()).default.get('nuclide-datatip.datatipDebounceDelay'), DEFAULT_DATATIP_DEBOUNCE_DELAY),
    /* immediate */false);
  }

  _setHideIfOutsideDebounce() {
    this._hideIfOutsideDebounce = (0, (_debounce || _load_debounce()).default)(() => {
      this._hideIfOutsideImmediate();
    }, ensurePositiveNumber((_featureConfig || _load_featureConfig()).default.get('nuclide-datatip.datatipInteractedWithDebounceDelay'), DEFAULT_DATATIP_INTERACTED_DEBOUNCE_DELAY),
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
    }
    if (oldState === DatatipState.VISIBLE && newState === DatatipState.HIDDEN) {
      this._hideDatatip();
      return;
    }
  }

  _startFetching(getPosition) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._datatipState !== DatatipState.HIDDEN) {
        return;
      }
      const position = getPosition();
      if (!position) {
        return;
      }

      _this._setState(DatatipState.FETCHING);
      const data = yield fetchDatatip(_this._editor, position, _this._datatipProviders, _this._handlePinClicked.bind(_this));

      if (data === null) {
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

      _this._setState(DatatipState.VISIBLE);
      _this._interactedWith = false;
      _this._cumulativeWheelX = 0;
      _this._range = data.range;
      _this._marker = renderDatatip(_this._editor, _this._datatipElement, data);
    })();
  }

  _hideDatatip() {
    this._lastHiddenTime = performance.now();
    if (this._marker) {
      this._marker.destroy();
      this._marker = null;
    }
    this._range = null;
    _reactDom.default.unmountComponentAtNode(this._datatipElement);
    this._datatipElement.style.display = 'none';
  }

  _hideOrCancel() {
    if (this._datatipState === DatatipState.HIDDEN || this._datatipState === DatatipState.FETCHING) {
      this._blacklistedPosition = getBufferPosition(this._editor, this._editorView, this._lastMoveEvent);
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
    const currentPosition = getBufferPosition(this._editor, this._editorView, this._lastMoveEvent);
    if (currentPosition && this._range && this._range.containsPoint(currentPosition)) {
      return;
    }

    this._setState(DatatipState.HIDDEN);
  }

  createPinnedDataTip(component, range, pinnable, editor) {
    const datatip = new (_PinnedDatatip || _load_PinnedDatatip()).PinnedDatatip(
    /* datatip */{ component, range, pinnable }, editor,
    /* onDispose */() => {
      this._pinnedDatatips.delete(datatip);
    });
    return datatip;
  }

  _handlePinClicked(editor, datatip) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('datatip-pinned-open');
    const startTime = (0, (_performanceNow || _load_performanceNow()).default)();
    this._setState(DatatipState.HIDDEN);
    this._pinnedDatatips.add(new (_PinnedDatatip || _load_PinnedDatatip()).PinnedDatatip(datatip, editor, /* onDispose */pinnedDatatip => {
      this._pinnedDatatips.delete(pinnedDatatip);
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('datatip-pinned-close', { duration: (0, (_performanceNow || _load_performanceNow()).default)() - startTime });
    }));
  }

  _toggleDatatip() {
    if (atom.workspace.getActiveTextEditor() !== this._editor) {
      return;
    }

    // Note that we don't need to hide the tooltip, we already hide it on
    // keydown, which is going to be triggered before the key binding which is
    // evaluated on keyup.

    if (this._datatipState === DatatipState.HIDDEN &&
    // Unfortunately, when you do keydown of the shortcut, it's going to
    // hide it, we need to make sure that when we do keyup, it doesn't show
    // it up right away. We assume that a keypress is done within 100ms
    // and don't show it again if it was hidden so soon.
    performance.now() - this._lastHiddenTime > 100) {
      this._startFetching(() => this._editor.getCursorScreenPosition());
      return;
    }
  }
}

class DatatipManager {

  constructor() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._editorManagers = new Map();
    this._datatipProviders = [];

    this._subscriptions.add((0, (_textEditor || _load_textEditor()).observeTextEditors)(editor => {
      const manager = new DatatipManagerForEditor(editor, this._datatipProviders);
      this._editorManagers.set(editor, manager);
      const dispose = () => {
        manager.dispose();
        this._editorManagers.delete(editor);
      };
      this._subscriptions.add(new (_UniversalDisposable || _load_UniversalDisposable()).default(dispose));
      editor.onDidDestroy(dispose);
    }));
  }

  addProvider(provider) {
    this._datatipProviders.push(provider);
  }

  removeProvider(provider) {
    (0, (_collection || _load_collection()).arrayRemove)(this._datatipProviders, provider);
  }

  createPinnedDataTip(component, range, pinnable, editor) {
    const manager = this._editorManagers.get(editor);
    if (!manager) {
      throw new Error('Trying to create a pinned data tip on an editor that has ' + 'no datatip manager');
    }
    return manager.createPinnedDataTip(component, range, pinnable, editor);
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