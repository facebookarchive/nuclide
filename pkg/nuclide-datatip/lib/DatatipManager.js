Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _DatatipComponent2;

function _DatatipComponent() {
  return _DatatipComponent2 = require('./DatatipComponent');
}

var _PinnedDatatip2;

function _PinnedDatatip() {
  return _PinnedDatatip2 = require('./PinnedDatatip');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var DatatipManager = (function () {
  function DatatipManager() {
    var _this = this;

    _classCallCheck(this, DatatipManager);

    this._boundHideDatatip = this.hideDatatip.bind(this);
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-datatip:toggle', this.toggleDatatip.bind(this)));
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'core:cancel', this._boundHideDatatip));
    this._debouncedMouseMove = function () {};
    this._subscriptions.add((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe('nuclide-datatip.datatipDebounceDelay', function (debounceDelay) {
      return _this.updateDebounceDelay(debounceDelay);
    }));
    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      // When the cursor moves the next time we do a toggle we should show the
      // new datatip
      _this._subscriptions.add(editor.onDidChangeCursorPosition(function () {
        _this._datatipToggle = false;
      }));

      var editorView = atom.views.getView(editor);
      var mouseMoveListener = function mouseMoveListener(event) {
        _this.handleMouseMove(event, editor, editorView);
      };
      editorView.addEventListener('mousemove', mouseMoveListener);
      var mouseListenerSubscription = new (_atom2 || _atom()).Disposable(function () {
        return editorView.removeEventListener('mousemove', mouseMoveListener);
      });
      var destroySubscription = editor.onDidDestroy(function () {
        mouseListenerSubscription.dispose();
        _this._subscriptions.remove(mouseListenerSubscription);
        _this._subscriptions.remove(destroySubscription);
      });
      _this._subscriptions.add(mouseListenerSubscription);
      _this._subscriptions.add(destroySubscription);
    }));
    this._ephemeralDatatipElement = document.createElement('div');
    this._ephemeralDatatipElement.className = 'nuclide-datatip-overlay';

    var datatipMouseEnter = function datatipMouseEnter(event) {
      return _this._handleElementMouseEnter(event);
    };
    var datatipMouseLeave = function datatipMouseLeave(event) {
      return _this._handleElementMouseLeave(event);
    };
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

  _createClass(DatatipManager, [{
    key: 'updateDebounceDelay',
    value: function updateDebounceDelay(debounceDelay) {
      var _this2 = this;

      this._debouncedMouseMove = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function (event, editor, editorView) {
        _this2._datatipForMouseEvent(event, editor, editorView);
      }, debounceDelay,
      /* immediate */false);
    }
  }, {
    key: 'handleMouseMove',
    value: function handleMouseMove(event, editor, editorView) {
      this._debouncedMouseMove(event, editor, editorView);
    }
  }, {
    key: 'toggleDatatip',
    value: function toggleDatatip() {
      this._datatipToggle = !this._datatipToggle;
      if (this._datatipToggle) {
        var _editor = atom.workspace.getActiveTextEditor();
        if (_editor != null) {
          var position = _editor.getCursorScreenPosition();
          this._datatipInEditor(_editor, position);
        }
      } else {
        this.hideDatatip();
      }
    }
  }, {
    key: 'hideDatatip',
    value: function hideDatatip() {
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
  }, {
    key: '_handleElementMouseEnter',
    value: function _handleElementMouseEnter(event) {
      this._isHoveringDatatip = true;
    }
  }, {
    key: '_handleElementMouseLeave',
    value: function _handleElementMouseLeave(event) {
      this._isHoveringDatatip = false;
    }
  }, {
    key: '_datatipForMouseEvent',
    value: function _datatipForMouseEvent(e, editor, editorView) {
      if (!editorView.component) {
        // The editor was destroyed, but the destroy handler haven't yet been called to cancel
        // the timer.
        return;
      }
      var textEditorComponent = editorView.component;
      var screenPosition = textEditorComponent.screenPositionForMouseEvent(e);
      var pixelPosition = textEditorComponent.pixelPositionForMouseEvent(e);
      var pixelPositionFromScreenPosition = textEditorComponent.pixelPositionForScreenPosition(screenPosition);
      // Distance (in pixels) between screenPosition and the cursor.
      var horizontalDistance = pixelPosition.left - pixelPositionFromScreenPosition.left;
      // `screenPositionForMouseEvent.column` cannot exceed the current line length.
      // This is essentially a heuristic for "mouse cursor is to the left or right of text content".
      if (pixelPosition.left < 0 || horizontalDistance > editor.getDefaultCharWidth()) {
        this.hideDatatip();
        return;
      }
      var bufferPosition = editor.bufferPositionForScreenPosition(screenPosition);
      this._datatipInEditor(editor, bufferPosition);
    }
  }, {
    key: '_datatipInEditor',
    value: _asyncToGenerator(function* (editor, position) {
      var _this3 = this;

      if (this._isHoveringDatatip) {
        return;
      }

      if (this._currentRange != null && this._currentRange.containsPoint(position)) {
        return;
      }

      if (this._marker != null) {
        this.hideDatatip();
      }

      var _editor$getGrammar = editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;

      var providers = this._getMatchingProvidersForScopeName(scopeName);
      if (providers.length === 0) {
        return;
      }
      var datatips = yield Promise.all(providers.map(_asyncToGenerator(function* (provider) {
        var name = undefined;
        if (provider.providerName != null) {
          name = provider.providerName;
        } else {
          name = 'unknown';
          var logger = require('../../nuclide-logging').getLogger();
          logger.error('Datatip provider has no name', provider);
        }
        var datatip = yield (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)(name + '.datatip', function () {
          return provider.datatip(editor, position);
        });
        if (!datatip || _this3._marker) {
          return;
        }
        var pinnable = datatip.pinnable;
        var component = datatip.component;
        var range = datatip.range;

        // We track the timing above, but we still want to know the number of popups that are shown.
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('datatip-popup', {
          scope: scopeName,
          providerName: name,
          rangeStartRow: String(range.start.row),
          rangeStartColumn: String(range.start.column),
          rangeEndRow: String(range.end.row),
          rangeEndColumn: String(range.end.column)
        });
        _this3._currentRange = range;
        var action = undefined;
        var actionTitle = undefined;
        // Datatips are pinnable by default, unless explicitly specified otherwise.
        if (pinnable !== false) {
          action = (_DatatipComponent2 || _DatatipComponent()).DATATIP_ACTIONS.PIN;
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
      })));
      var nonEmptyDatatips = datatips.filter(function (datatip) {
        return datatip != null;
      });
      if (nonEmptyDatatips.length === 0) {
        return;
      }
      var renderedProviders = nonEmptyDatatips.map(function (datatip) {
        var ProvidedComponent = datatip.component;
        var name = datatip.name;
        var action = datatip.action;
        var actionTitle = datatip.actionTitle;

        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_DatatipComponent2 || _DatatipComponent()).DatatipComponent,
          {
            action: action,
            actionTitle: actionTitle,
            onActionClick: _this3._handlePinClicked.bind(_this3, editor, datatip),
            key: name },
          (_reactForAtom2 || _reactForAtom()).React.createElement(ProvidedComponent, null)
        );
      });

      var combinedRange = nonEmptyDatatips[0].range;
      for (var i = 1; i < nonEmptyDatatips.length; i++) {
        combinedRange = combinedRange.union(nonEmptyDatatips[i].range);
      }

      // Transform the matched element range to the hint range.
      var marker = editor.markBufferRange(combinedRange, { invalidate: 'never' });
      this._marker = marker;

      (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        renderedProviders
      ), this._ephemeralDatatipElement);
      // This relative positioning is to work around the issue that `position: 'head'`
      // doesn't work for overlay decorators are rendered on the bottom right of the given range.
      // Atom issue: https://github.com/atom/atom/issues/6695
      var expressionLength = combinedRange.end.column - combinedRange.start.column;
      this._ephemeralDatatipElement.style.left = -(expressionLength * editor.getDefaultCharWidth()) + 'px';
      this._ephemeralDatatipElement.style.display = 'block';

      editor.decorateMarker(marker, {
        type: 'overlay',
        position: 'head',
        item: this._ephemeralDatatipElement
      });
      editor.decorateMarker(marker, {
        type: 'highlight',
        'class': 'nuclide-datatip-highlight-region'
      });
      this._subscribeToGlobalKeydown();
    })
  }, {
    key: '_subscribeToGlobalKeydown',
    value: function _subscribeToGlobalKeydown() {
      var _this4 = this;

      var editor = atom.views.getView(atom.workspace);
      editor.addEventListener('keydown', this._boundHideDatatip);
      this._globalKeydownSubscription = new (_atom2 || _atom()).Disposable(function () {
        editor.removeEventListener('keydown', _this4._boundHideDatatip);
      });
    }
  }, {
    key: '_handlePinClicked',
    value: function _handlePinClicked(editor, datatip) {
      var _this5 = this;

      this.hideDatatip();
      this._pinnedDatatips.add(new (_PinnedDatatip2 || _PinnedDatatip()).PinnedDatatip(datatip, editor, function (pinnedDatatip) {
        _this5._pinnedDatatips.delete(pinnedDatatip);
      }));
    }
  }, {
    key: '_getMatchingProvidersForScopeName',
    value: function _getMatchingProvidersForScopeName(scopeName) {
      return this._datatipProviders.filter(function (provider) {
        return provider.inclusionPriority > 0 && provider.validForScope(scopeName);
      }).sort(function (providerA, providerB) {
        return providerA.inclusionPriority - providerB.inclusionPriority;
      });
    }
  }, {
    key: 'addProvider',
    value: function addProvider(provider) {
      this._datatipProviders.push(provider);
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayRemove)(this._datatipProviders, provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.hideDatatip();
      (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this._ephemeralDatatipElement);
      this._ephemeralDatatipElement.remove();
      this._pinnedDatatips.forEach(function (pinnedDatatip) {
        return pinnedDatatip.dispose();
      });
      this._subscriptions.dispose();
    }
  }]);

  return DatatipManager;
})();

exports.DatatipManager = DatatipManager;

/**
 * This helps determine if we should show the datatip when toggling it via
 * command. The toggle command first negates this, and then if this is true
 * shows a datatip, otherwise it hides the current datatip.
 */