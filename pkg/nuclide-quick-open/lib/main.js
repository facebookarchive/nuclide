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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _QuickSelectionComponent2;

function _QuickSelectionComponent() {
  return _QuickSelectionComponent2 = _interopRequireDefault(require('./QuickSelectionComponent'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

function getSearchResultManager() {
  return require('./SearchResultManager').default.getInstance();
}

var DEFAULT_PROVIDER = 'OmniSearchResultProvider';
var TOPBAR_APPROX_HEIGHT = 100; // A reasonable heuristic that prevents us from having to measure.
var MODAL_MARGIN = 32;
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

var trackProviderChange = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function (providerName) {
  analyticsSessionId = analyticsSessionId || Date.now().toString();
  (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.CHANGE_TAB, {
    'quickopen-provider': providerName,
    'quickopen-session': analyticsSessionId
  });
}, AnalyticsDebounceDelays.CHANGE_TAB);

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._previousFocus = null;
    this._maxScrollableAreaHeight = 10000;
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._currentProvider = getSearchResultManager().getProviderByName(DEFAULT_PROVIDER);
    var QuickSelectionDispatcher = require('./QuickSelectionDispatcher');
    QuickSelectionDispatcher.getInstance().register(function (action) {
      if (action.actionType === QuickSelectionDispatcher.ActionType.ACTIVE_PROVIDER_CHANGED) {
        _this._handleActiveProviderChange(action.providerName);
      }
    });
    this._reactDiv = document.createElement('div');
    this._searchPanel = atom.workspace.addModalPanel({ item: this._reactDiv, visible: false });
    this._debouncedUpdateModalPosition = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(this._updateScrollableHeight.bind(this), 200);
    window.addEventListener('resize', this._debouncedUpdateModalPosition);
    this._customizeModalElement();
    this._updateScrollableHeight();

    this._searchComponent = this._render();

    this._searchComponent.onSelection(function (selection) {
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

      var query = _this._searchComponent.getInputTextEditor().textContent;
      var providerName = _this._currentProvider.name;
      // default to empty string because `track` enforces string-only values
      var sourceProvider = selection.sourceProvider || '';
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.SELECT_FILE, {
        'quickopen-filepath': selection.path,
        'quickopen-query': query,
        'quickopen-provider': providerName, // The currently open "tab".
        'quickopen-session': analyticsSessionId || '',
        // Because the `provider` is usually OmniSearch, also track the original provider.
        'quickopen-provider-source': sourceProvider
      });
      _this.closeSearchPanel();
    });

    this._subscriptions.add(atom.commands.add('body', 'core:cancel', function () {
      if (_this._searchPanel && _this._searchPanel.isVisible()) {
        _this.closeSearchPanel();
      }
    }));

    this._searchComponent.onCancellation(function () {
      return _this.closeSearchPanel();
    });
    this._searchComponent.onSelectionChanged((0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function (selection) {
      // Only track user-initiated selection-change events.
      if (analyticsSessionId != null) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.CHANGE_SELECTION, {
          'quickopen-selected-index': selection.selectedItemIndex.toString(),
          'quickopen-selected-service': selection.selectedService,
          'quickopen-selected-directory': selection.selectedDirectory,
          'quickopen-session': analyticsSessionId
        });
      }
    }, AnalyticsDebounceDelays.CHANGE_SELECTION));
  }

  // Customize the element containing the modal.

  _createClass(Activation, [{
    key: '_customizeModalElement',
    value: function _customizeModalElement() {
      var modalElement = this._searchPanel.getItem().parentNode;
      modalElement.style.setProperty('margin-left', '0');
      modalElement.style.setProperty('max-width', 'none');
      modalElement.style.setProperty('position', 'absolute');
      modalElement.style.setProperty('width', 'auto');
      modalElement.style.setProperty('left', MODAL_MARGIN + 'px');
      modalElement.style.setProperty('right', MODAL_MARGIN + 'px');
    }
  }, {
    key: '_updateScrollableHeight',
    value: function _updateScrollableHeight() {
      var _document$documentElement$getBoundingClientRect = document.documentElement.getBoundingClientRect();

      var height = _document$documentElement$getBoundingClientRect.height;

      this._maxScrollableAreaHeight = height - MODAL_MARGIN - TOPBAR_APPROX_HEIGHT;
      // Force a re-render to update _maxScrollableAreaHeight.
      this._searchComponent = this._render();
    }
  }, {
    key: '_render',
    value: function _render() {
      var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_QuickSelectionComponent2 || _QuickSelectionComponent()).default, {
        activeProvider: this._currentProvider,
        maxScrollableAreaHeight: this._maxScrollableAreaHeight,
        onBlur: this.closeSearchPanel.bind(this)
      }), this._reactDiv);
      (0, (_assert2 || _assert()).default)(component instanceof (_QuickSelectionComponent2 || _QuickSelectionComponent()).default);
      return component;
    }
  }, {
    key: '_handleActiveProviderChange',
    value: function _handleActiveProviderChange(newProviderName) {
      trackProviderChange(newProviderName);
      // Toggle newProviderName before setting this._currentProvider to make
      // the search panel stay open.
      this.toggleProvider(newProviderName);
      this._currentProvider = getSearchResultManager().getProviderByName(newProviderName);
      this._searchComponent = this._render();
    }
  }, {
    key: 'toggleOmniSearchProvider',
    value: function toggleOmniSearchProvider() {
      require('./QuickSelectionActions').changeActiveProvider('OmniSearchResultProvider');
    }
  }, {
    key: 'toggleProvider',
    value: function toggleProvider(providerName) {
      analyticsSessionId = analyticsSessionId || Date.now().toString();
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.CHANGE_TAB, {
        'quickopen-provider': providerName,
        'quickopen-session': analyticsSessionId
      });
      var provider = getSearchResultManager().getProviderByName(providerName);
      // "toggle" behavior
      if (this._searchPanel !== null && this._searchPanel.isVisible() && providerName === this._currentProvider.name) {
        this.closeSearchPanel();
        return;
      }

      this._currentProvider = provider;
      if (this._searchComponent) {
        this._searchComponent = this._render();
      }
      this.showSearchPanel();
    }
  }, {
    key: 'showSearchPanel',
    value: function showSearchPanel() {
      this._previousFocus = document.activeElement;
      if (this._searchComponent && this._searchPanel) {
        // Start a new search "session" for analytics purposes.
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.OPEN_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        // showSearchPanel gets called when changing providers even if it's already shown.
        var isAlreadyVisible = this._searchPanel.isVisible();
        this._searchPanel.show();
        this._searchComponent.focus();
        if ((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
          var selectedText = this._getFirstSelectionText();
          if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
            this._searchComponent.setInputValue(selectedText.split('\n')[0]);
          }
        }
        this._searchComponent.selectInput();
      }
    }
  }, {
    key: 'closeSearchPanel',
    value: function closeSearchPanel() {
      if (this._searchComponent && this._searchPanel) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)(AnalyticsEvents.CLOSE_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        this._searchPanel.hide();
        this._searchComponent.blur();
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
  listeners = new (_atom2 || _atom()).CompositeDisposable();
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