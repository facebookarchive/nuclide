'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatatipManager = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let fetchDatatip = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor, position, allProviders, onPinClick) {
    var _editor$getGrammar = editor.getGrammar();

    const scopeName = _editor$getGrammar.scopeName;

    const providers = filterProvidersByScopeName(allProviders, scopeName);
    if (providers.length === 0) {
      return null;
    }

    let combinedRange = null;
    const renderedProviders = (0, (_collection || _load_collection()).arrayCompact)((yield Promise.all(providers.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (provider) {
        const name = getProviderName(provider);
        const datatip = yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(name + '.datatip', function () {
          return provider.datatip(editor, position);
        });
        if (!datatip) {
          return null;
        }
        const pinnable = datatip.pinnable,
              component = datatip.component,
              range = datatip.range;

        const ProvidedComponent = component;

        // We track the timing above, but we still want to know the number of
        // popups that are shown.
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('datatip-popup', {
          scope: scopeName,
          providerName: name,
          rangeStartRow: String(range.start.row),
          rangeStartColumn: String(range.start.column),
          rangeEndRow: String(range.end.row),
          rangeEndColumn: String(range.end.column)
        });

        if (!combinedRange) {
          combinedRange = range;
        } else {
          combinedRange = combinedRange.union(range);
        }

        let action;
        let actionTitle;
        // Datatips are pinnable by default, unless explicitly specified
        // otherwise.
        if (pinnable !== false) {
          action = (_DatatipComponent || _load_DatatipComponent()).DATATIP_ACTIONS.PIN;
          actionTitle = 'Pin this Datatip';
        }

        return _reactForAtom.React.createElement(
          (_DatatipComponent || _load_DatatipComponent()).DatatipComponent,
          {
            action: action,
            actionTitle: actionTitle,
            onActionClick: function () {
              return onPinClick(editor, datatip);
            },
            key: name },
          _reactForAtom.React.createElement(ProvidedComponent, null)
        );
      });

      return function (_x5) {
        return _ref2.apply(this, arguments);
      };
    })()))));
    if (renderedProviders.length === 0) {
      return null;
    }

    return {
      range: combinedRange,
      renderedProviders: _reactForAtom.React.createElement(
        'div',
        null,
        renderedProviders
      )
    };
  });

  return function fetchDatatip(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

var _reactForAtom = require('react-for-atom');

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

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

function renderDatatip(editor, element, _ref3) {
  let range = _ref3.range,
      renderedProviders = _ref3.renderedProviders;

  // Transform the matched element range to the hint range.
  const marker = editor.markBufferRange(range, { invalidate: 'never' });

  _reactForAtom.ReactDOM.render(renderedProviders, element);
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
let DatatipManagerForEditor = class DatatipManagerForEditor {

  constructor(editor, datatipProviders) {
    this._editor = editor;
    this._editorView = atom.views.getView(editor);
    this._pinnedDatatips = new Set();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._datatipProviders = datatipProviders;
    this._datatipElement = document.createElement('div');
    this._datatipElement.className = 'nuclide-datatip-overlay';
    this._datatipState = DatatipState.HIDDEN;
    this._lastHiddenTime = 0;

    this._subscriptions.add((_featureConfig || _load_featureConfig()).default.observe('nuclide-datatip.datatipDebounceDelay', () => this._setStartFetchingDebounce()), _rxjsBundlesRxMinJs.Observable.fromEvent(this._editorView, 'mousemove').subscribe(e => {
      this._lastMoveEvent = e;
      if (this._datatipState === DatatipState.HIDDEN) {
        this._startFetchingDebounce();
      } else {
        this._hideIfOutside();
      }
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
    }, (_featureConfig || _load_featureConfig()).default.get('nuclide-datatip.datatipDebounceDelay'),
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
      _this._range = data.range;
      _this._marker = renderDatatip(_this._editor, _this._datatipElement, data);
    })();
  }

  _hideDatatip() {
    this._lastHiddenTime = window.performance.now();
    if (this._marker) {
      this._marker.destroy();
      this._marker = null;
    }
    this._range = null;
    _reactForAtom.ReactDOM.unmountComponentAtNode(this._datatipElement);
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
    /* datatip */{ component: component, range: range, pinnable: pinnable }, editor,
    /* onDispose */() => {
      this._pinnedDatatips.delete(datatip);
    });
    return datatip;
  }

  _handlePinClicked(editor, datatip) {
    this._setState(DatatipState.HIDDEN);
    this._pinnedDatatips.add(new (_PinnedDatatip || _load_PinnedDatatip()).PinnedDatatip(datatip, editor, /* onDispose */pinnedDatatip => {
      this._pinnedDatatips.delete(pinnedDatatip);
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
    window.performance.now() - this._lastHiddenTime > 100) {
      this._startFetching(() => this._editor.getCursorScreenPosition());
      return;
    }
  }
};
let DatatipManager = exports.DatatipManager = class DatatipManager {

  constructor() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._editorManagers = new Map();
    this._datatipProviders = [];

    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
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
};