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

var _atom = require('atom');

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

let DatatipManager = exports.DatatipManager = class DatatipManager {

  constructor() {
    this._boundHideDatatip = this.hideDatatip.bind(this);
    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-datatip:toggle', this.toggleDatatip.bind(this)));
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'core:cancel', this._boundHideDatatip));
    this._debouncedMouseMove = () => {};
    this._subscriptions.add((_featureConfig || _load_featureConfig()).default.observe('nuclide-datatip.datatipDebounceDelay', debounceDelay => this.updateDebounceDelay(debounceDelay)));
    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(editor => {
      // When the cursor moves the next time we do a toggle we should show the
      // new datatip
      this._subscriptions.add(editor.onDidChangeCursorPosition(() => {
        this._datatipToggle = false;
      }));

      const editorView = atom.views.getView(editor);
      const mouseMoveListener = event => {
        this.handleMouseMove(event, editor, editorView);
      };
      editorView.addEventListener('mousemove', mouseMoveListener);
      const mouseListenerSubscription = new _atom.Disposable(() => editorView.removeEventListener('mousemove', mouseMoveListener));
      const destroySubscription = editor.onDidDestroy(() => {
        mouseListenerSubscription.dispose();
        this._subscriptions.remove(mouseListenerSubscription);
        this._subscriptions.remove(destroySubscription);
      });
      this._subscriptions.add(mouseListenerSubscription);
      this._subscriptions.add(destroySubscription);
    }));
    this._ephemeralDatatipElement = document.createElement('div');
    this._ephemeralDatatipElement.className = 'nuclide-datatip-overlay';

    const datatipMouseEnter = event => this._handleElementMouseEnter(event);
    const datatipMouseLeave = (0, (_debounce || _load_debounce()).default)(event => this._handleElementMouseLeave(event), 100);
    this._ephemeralDatatipElement.addEventListener('mouseenter', datatipMouseEnter);
    this._ephemeralDatatipElement.addEventListener('mouseleave', datatipMouseLeave);

    this._datatipProviders = [];
    this._marker = null;
    this._datatipToggle = false;
    this._currentRange = null;
    this._isHoveringDatatip = false;
    this._pinnedDatatips = new Set();
    this._globalKeydownSubscription = null;
  }

  /**
   * This helps determine if we should show the datatip when toggling it via
   * command. The toggle command first negates this, and then if this is true
   * shows a datatip, otherwise it hides the current datatip.
   */


  updateDebounceDelay(debounceDelay) {
    this._debouncedMouseMove = (0, (_debounce || _load_debounce()).default)((event, editor, editorView) => {
      this._datatipForMouseEvent(event, editor, editorView);
    }, debounceDelay,
    /* immediate */false);
  }

  handleMouseMove(event, editor, editorView) {
    const mouseEvent = event;
    this._debouncedMouseMove(mouseEvent, editor, editorView);
  }

  toggleDatatip() {
    this._datatipToggle = !this._datatipToggle;
    if (this._datatipToggle) {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        const position = editor.getCursorScreenPosition();
        this._datatipInEditor(editor, position);
      }
    } else {
      this.hideDatatip();
    }
  }

  hideDatatip() {
    if (this._marker == null) {
      return;
    }
    if (this._globalKeydownSubscription != null) {
      this._globalKeydownSubscription.dispose();
      this._globalKeydownSubscription = null;
    }
    this._ephemeralDatatipElement.style.display = 'none';
    this._marker.destroy();
    this._marker = null;
    this._currentRange = null;
    this._isHoveringDatatip = false;
  }

  _handleElementMouseEnter(event) {
    this._isHoveringDatatip = true;
  }

  _handleElementMouseLeave(event) {
    this._isHoveringDatatip = false;
  }

  _datatipForMouseEvent(e, editor, editorView) {
    if (!editorView.component || this._isHoveringDatatip) {
      // The editor was destroyed, but the destroy handler haven't yet been called to cancel
      // the timer.
      return;
    }
    const textEditorComponent = editorView.component;
    const screenPosition = textEditorComponent.screenPositionForMouseEvent(e);
    const pixelPosition = textEditorComponent.pixelPositionForMouseEvent(e);
    const pixelPositionFromScreenPosition = textEditorComponent.pixelPositionForScreenPosition(screenPosition);
    // Distance (in pixels) between screenPosition and the cursor.
    const horizontalDistance = pixelPosition.left - pixelPositionFromScreenPosition.left;
    // `screenPositionForMouseEvent.column` cannot exceed the current line length.
    // This is essentially a heuristic for "mouse cursor is to the left or right of text content".
    if (pixelPosition.left < 0 || horizontalDistance > editor.getDefaultCharWidth()) {
      this.hideDatatip();
      return;
    }
    const bufferPosition = editor.bufferPositionForScreenPosition(screenPosition);
    this._datatipInEditor(editor, bufferPosition);
  }

  _datatipInEditor(editor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._currentRange != null && _this._currentRange.containsPoint(position)) {
        return;
      }

      if (_this._marker != null) {
        _this.hideDatatip();
      }

      if (editor.isDestroyed()) {
        return;
      }

      var _editor$getGrammar = editor.getGrammar();

      const scopeName = _editor$getGrammar.scopeName;

      const providers = _this._getMatchingProvidersForScopeName(scopeName);
      if (providers.length === 0) {
        return;
      }
      const datatips = (0, (_collection || _load_collection()).arrayCompact)((yield Promise.all(providers.map((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (provider) {
          let name;
          if (provider.providerName != null) {
            name = provider.providerName;
          } else {
            name = 'unknown';
            logger.error('Datatip provider has no name', provider);
          }
          const datatip = yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(name + '.datatip', function () {
            return provider.datatip(editor, position);
          });
          if (!datatip || _this._marker) {
            return;
          }
          const pinnable = datatip.pinnable;
          const component = datatip.component;
          const range = datatip.range;
          // We track the timing above, but we still want to know the number of popups that are shown.

          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('datatip-popup', {
            scope: scopeName,
            providerName: name,
            rangeStartRow: String(range.start.row),
            rangeStartColumn: String(range.start.column),
            rangeEndRow: String(range.end.row),
            rangeEndColumn: String(range.end.column)
          });
          _this._currentRange = range;
          let action;
          let actionTitle;
          // Datatips are pinnable by default, unless explicitly specified otherwise.
          if (pinnable !== false) {
            action = (_DatatipComponent || _load_DatatipComponent()).DATATIP_ACTIONS.PIN;
            actionTitle = 'Pin this Datatip';
          }

          return {
            range: range,
            component: component,
            pinnable: pinnable,
            name: name,
            action: action,
            actionTitle: actionTitle
          };
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()))));
      if (datatips.length === 0) {
        return;
      }
      const renderedProviders = datatips.map(function (datatip) {
        const ProvidedComponent = datatip.component;
        const name = datatip.name;
        const action = datatip.action;
        const actionTitle = datatip.actionTitle;

        return _reactForAtom.React.createElement(
          (_DatatipComponent || _load_DatatipComponent()).DatatipComponent,
          {
            action: action,
            actionTitle: actionTitle,
            onActionClick: _this._handlePinClicked.bind(_this, editor, datatip),
            key: name },
          _reactForAtom.React.createElement(ProvidedComponent, null)
        );
      });

      let combinedRange = datatips[0].range;
      for (let i = 1; i < datatips.length; i++) {
        combinedRange = combinedRange.union(datatips[i].range);
      }

      // Transform the matched element range to the hint range.
      const marker = editor.markBufferRange(combinedRange, { invalidate: 'never' });
      _this._marker = marker;

      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        'div',
        null,
        renderedProviders
      ), _this._ephemeralDatatipElement);
      _this._ephemeralDatatipElement.style.display = 'block';

      editor.decorateMarker(marker, {
        type: 'overlay',
        position: 'tail',
        item: _this._ephemeralDatatipElement
      });
      editor.decorateMarker(marker, {
        type: 'highlight',
        class: 'nuclide-datatip-highlight-region'
      });
      _this._subscribeToGlobalKeydown();
    })();
  }

  _subscribeToGlobalKeydown() {
    const editor = atom.views.getView(atom.workspace);
    editor.addEventListener('keydown', this._boundHideDatatip);
    this._globalKeydownSubscription = new _atom.Disposable(() => {
      editor.removeEventListener('keydown', this._boundHideDatatip);
    });
  }

  _handlePinClicked(editor, datatip) {
    this.hideDatatip();
    this._pinnedDatatips.add(new (_PinnedDatatip || _load_PinnedDatatip()).PinnedDatatip(datatip, editor, pinnedDatatip => {
      this._pinnedDatatips.delete(pinnedDatatip);
    }));
  }

  _getMatchingProvidersForScopeName(scopeName) {
    return this._datatipProviders.filter(provider => {
      return provider.inclusionPriority > 0 && provider.validForScope(scopeName);
    }).sort((providerA, providerB) => {
      return providerA.inclusionPriority - providerB.inclusionPriority;
    });
  }

  addProvider(provider) {
    this._datatipProviders.push(provider);
  }

  removeProvider(provider) {
    (0, (_collection || _load_collection()).arrayRemove)(this._datatipProviders, provider);
  }

  createDatatip(component, range, pinnable) {
    return {
      component: component,
      range: range,
      pinnable: pinnable
    };
  }

  createPinnedDataTip(component, range, pinnable, editor, onDispose) {
    const datatip = new (_PinnedDatatip || _load_PinnedDatatip()).PinnedDatatip(this.createDatatip(component, range, pinnable), editor, onDispose);
    this._pinnedDatatips.add(datatip);
    return datatip;
  }

  deletePinnedDatatip(datatip) {
    this._pinnedDatatips.delete(datatip);
  }

  dispose() {
    this.hideDatatip();
    _reactForAtom.ReactDOM.unmountComponentAtNode(this._ephemeralDatatipElement);
    this._ephemeralDatatipElement.remove();
    this._pinnedDatatips.forEach(pinnedDatatip => pinnedDatatip.dispose());
    this._subscriptions.dispose();
  }
};