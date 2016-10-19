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

exports.activate = activate;
exports.registerProvider = registerProvider;
exports.registerStore = registerStore;
exports.getHomeFragments = getHomeFragments;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _QuickSelectionComponent;

function _load_QuickSelectionComponent() {
  return _QuickSelectionComponent = _interopRequireDefault(require('./QuickSelectionComponent'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsNodeDebounce;

function _load_commonsNodeDebounce() {
  return _commonsNodeDebounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _SearchResultManager;

function _load_SearchResultManager() {
  return _SearchResultManager = _interopRequireDefault(require('./SearchResultManager'));
}

var _QuickSelectionActions;

function _load_QuickSelectionActions() {
  return _QuickSelectionActions = _interopRequireDefault(require('./QuickSelectionActions'));
}

var _QuickSelectionDispatcher;

function _load_QuickSelectionDispatcher() {
  return _QuickSelectionDispatcher = _interopRequireDefault(require('./QuickSelectionDispatcher'));
}

var _QuickSelectionDispatcher2;

function _load_QuickSelectionDispatcher2() {
  return _QuickSelectionDispatcher2 = require('./QuickSelectionDispatcher');
}

function getSearchResultManager() {
  return (_SearchResultManager || _load_SearchResultManager()).default.getInstance();
}

var DEFAULT_PROVIDER = 'OmniSearchResultProvider';
var TOPBAR_APPROX_HEIGHT = 100; // A reasonable heuristic that prevents us from having to measure.
var MODAL_MARGIN = 65;
// don't pre-fill search input if selection is longer than this
var MAX_SELECTION_LENGTH = 1000;

/**
 * A "session" for the purpose of analytics. It exists from the moment the quick-open UI becomes
 * visible until it gets closed, either via file selection or cancellation.
 */
var analyticsSessionId = null;
var AnalyticsEvents = Object.freeze({
  CHANGE_SELECTION: 'quickopen-change-selection',
  CHANGE_TAB: 'quickopen-change-tab',
  CLOSE_PANEL: 'quickopen-close-panel',
  OPEN_PANEL: 'quickopen-open-panel',
  SELECT_FILE: 'quickopen-select-file'
});
var AnalyticsDebounceDelays = Object.freeze({
  CHANGE_TAB: 100,
  CHANGE_SELECTION: 100
});

var trackProviderChange = (0, (_commonsNodeDebounce || _load_commonsNodeDebounce()).default)(function (providerName) {
  analyticsSessionId = analyticsSessionId || Date.now().toString();
  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.CHANGE_TAB, {
    'quickopen-provider': providerName,
    'quickopen-session': analyticsSessionId
  });
}, AnalyticsDebounceDelays.CHANGE_TAB);

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._previousFocus = null;
    this._scrollableAreaHeightGap = MODAL_MARGIN + TOPBAR_APPROX_HEIGHT;
    this._subscriptions = new (_atom || _load_atom()).CompositeDisposable();
    this._currentProvider = getSearchResultManager().getProviderByName(DEFAULT_PROVIDER);
    (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).default.getInstance().register(function (action) {
      if (action.actionType === (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.ACTIVE_PROVIDER_CHANGED) {
        _this._handleActiveProviderChange(action.providerName);
      }
    });

    this._subscriptions.add(atom.commands.add('body', 'core:cancel', function () {
      if (_this._searchPanel && _this._searchPanel.isVisible()) {
        _this.closeSearchPanel();
      }
    }));

    this.closeSearchPanel = this.closeSearchPanel.bind(this);
  }

  _createClass(Activation, [{
    key: '_render',
    value: function _render() {
      var _this2 = this;

      if (this._reactDiv == null) {
        var _reactDiv = document.createElement('div');
        this._searchPanel = atom.workspace.addModalPanel({
          item: _reactDiv,
          visible: false
        });
        var modalView = atom.views.getView(this._searchPanel);
        // These styles are for Atom Dark, which sets a fixed width for modals.
        Object.assign(modalView.style, {
          marginLeft: '0',
          maxWidth: 'none',
          position: 'absolute',
          width: 'auto',
          left: MODAL_MARGIN + 'px',
          right: MODAL_MARGIN + 'px'
        });
        this._reactDiv = _reactDiv;
      }

      var _searchComponent = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_QuickSelectionComponent || _load_QuickSelectionComponent()).default, {
        activeProvider: this._currentProvider,
        scrollableAreaHeightGap: this._scrollableAreaHeightGap,
        onBlur: this.closeSearchPanel
      }), this._reactDiv);
      (0, (_assert || _load_assert()).default)(_searchComponent instanceof (_QuickSelectionComponent || _load_QuickSelectionComponent()).default);

      if (this._searchComponent == null) {
        _searchComponent.onSelection(function (selection) {
          var options = {};
          if (selection.line) {
            options.initialLine = selection.line;
          }
          if (selection.column) {
            options.initialColumn = selection.column;
          }

          atom.workspace.open(selection.path, options).then(function (textEditor) {
            atom.commands.dispatch(atom.views.getView(textEditor), 'tabs:keep-preview-tab');
          });

          var query = _searchComponent.getInputTextEditor().textContent;
          var providerName = _this2._currentProvider.name;
          // default to empty string because `track` enforces string-only values
          var sourceProvider = selection.sourceProvider || '';
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.SELECT_FILE, {
            'quickopen-filepath': selection.path,
            'quickopen-query': query,
            'quickopen-provider': providerName, // The currently open "tab".
            'quickopen-session': analyticsSessionId || '',
            // Because the `provider` is usually OmniSearch, also track the original provider.
            'quickopen-provider-source': sourceProvider
          });
          _this2.closeSearchPanel();
        });

        _searchComponent.onCancellation(function () {
          return _this2.closeSearchPanel();
        });
        _searchComponent.onSelectionChanged((0, (_commonsNodeDebounce || _load_commonsNodeDebounce()).default)(function (selection) {
          // Only track user-initiated selection-change events.
          if (analyticsSessionId != null) {
            (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.CHANGE_SELECTION, {
              'quickopen-selected-index': selection.selectedItemIndex.toString(),
              'quickopen-selected-service': selection.selectedService,
              'quickopen-selected-directory': selection.selectedDirectory,
              'quickopen-session': analyticsSessionId
            });
          }
        }, AnalyticsDebounceDelays.CHANGE_SELECTION));
      }

      this._searchComponent = _searchComponent;
    }
  }, {
    key: '_handleActiveProviderChange',
    value: function _handleActiveProviderChange(newProviderName) {
      trackProviderChange(newProviderName);
      // Toggle newProviderName before setting this._currentProvider to make
      // the search panel stay open.
      this.toggleProvider(newProviderName);
      this._currentProvider = getSearchResultManager().getProviderByName(newProviderName);
      this._render();
    }
  }, {
    key: 'toggleOmniSearchProvider',
    value: function toggleOmniSearchProvider() {
      (_QuickSelectionActions || _load_QuickSelectionActions()).default.changeActiveProvider('OmniSearchResultProvider');
    }
  }, {
    key: 'toggleProvider',
    value: function toggleProvider(providerName) {
      analyticsSessionId = analyticsSessionId || Date.now().toString();
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.CHANGE_TAB, {
        'quickopen-provider': providerName,
        'quickopen-session': analyticsSessionId
      });
      var provider = getSearchResultManager().getProviderByName(providerName);
      // "toggle" behavior
      if (this._searchPanel != null && this._searchPanel.isVisible() && providerName === this._currentProvider.name) {
        this.closeSearchPanel();
        return;
      }

      this._currentProvider = provider;
      this._render();
      this.showSearchPanel();
    }
  }, {
    key: 'showSearchPanel',
    value: function showSearchPanel() {
      this._previousFocus = document.activeElement;
      var _searchComponent = this._searchComponent;
      var _searchPanel = this._searchPanel;

      if (_searchComponent != null && _searchPanel != null) {
        // Start a new search "session" for analytics purposes.
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.OPEN_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        // showSearchPanel gets called when changing providers even if it's already shown.
        var isAlreadyVisible = _searchPanel.isVisible();
        _searchPanel.show();
        _searchComponent.focus();
        if ((_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
          var selectedText = this._getFirstSelectionText();
          if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
            _searchComponent.setInputValue(selectedText.split('\n')[0]);
          }
        }
        _searchComponent.selectInput();
      }
    }
  }, {
    key: 'closeSearchPanel',
    value: function closeSearchPanel() {
      var _searchComponent = this._searchComponent;
      var _searchPanel = this._searchPanel;

      if (_searchComponent != null && _searchPanel != null) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.CLOSE_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        _searchPanel.hide();
        _searchComponent.blur();
        analyticsSessionId = null;
      }

      if (this._previousFocus != null) {
        this._previousFocus.focus();
        this._previousFocus = null;
      }
    }
  }, {
    key: '_getFirstSelectionText',
    value: function _getFirstSelectionText() {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        return editor.getSelections()[0].getText();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      if (this._reactDiv != null) {
        (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode(this._reactDiv);
        this._reactDiv = null;
      }
      if (this._searchPanel != null) {
        this._searchPanel.destroy();
        this._searchPanel = null;
      }
    }
  }]);

  return Activation;
})();

var activation = null;
function getActivation() {
  if (activation == null) {
    activation = new Activation();
  }
  return activation;
}

var listeners = null;

function activate() {
  listeners = new (_atom || _load_atom()).CompositeDisposable();
  listeners.add(atom.commands.add('atom-workspace', {
    'nuclide-quick-open:find-anything-via-omni-search': function nuclideQuickOpenFindAnythingViaOmniSearch() {
      getActivation().toggleOmniSearchProvider();
    }
  }));
  getActivation();
}

function registerProvider(service) {
  return getSearchResultManager().registerProvider(service);
}

function registerStore() {
  return getSearchResultManager();
}

function getHomeFragments() {
  return {
    feature: {
      title: 'Quick Open',
      icon: 'search',
      description: 'A powerful search box to quickly find local and remote files and content.',
      command: 'nuclide-quick-open:find-anything-via-omni-search'
    },
    priority: 10
  };
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
  if (listeners) {
    listeners.dispose();
    listeners = null;
  }
  getSearchResultManager().dispose();
}