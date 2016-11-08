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
exports.activate = activate;
exports.registerProvider = registerProvider;
exports.registerStore = registerStore;
exports.getHomeFragments = getHomeFragments;
exports.deactivate = deactivate;
exports.consumeCWD = consumeCWD;

var _reactForAtom = require('react-for-atom');

var _QuickSelectionComponent;

function _load_QuickSelectionComponent() {
  return _QuickSelectionComponent = _interopRequireDefault(require('./QuickSelectionComponent'));
}

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSearchResultManager() {
  return (_SearchResultManager || _load_SearchResultManager()).default.getInstance();
}

const DEFAULT_PROVIDER = 'OmniSearchResultProvider';
const TOPBAR_APPROX_HEIGHT = 100; // A reasonable heuristic that prevents us from having to measure.
const MODAL_MARGIN = 65;
// don't pre-fill search input if selection is longer than this
const MAX_SELECTION_LENGTH = 1000;

/**
 * A "session" for the purpose of analytics. It exists from the moment the quick-open UI becomes
 * visible until it gets closed, either via file selection or cancellation.
 */
let analyticsSessionId = null;
const AnalyticsEvents = Object.freeze({
  CHANGE_SELECTION: 'quickopen-change-selection',
  CHANGE_TAB: 'quickopen-change-tab',
  CLOSE_PANEL: 'quickopen-close-panel',
  OPEN_PANEL: 'quickopen-open-panel',
  SELECT_FILE: 'quickopen-select-file'
});
const AnalyticsDebounceDelays = Object.freeze({
  CHANGE_TAB: 100,
  CHANGE_SELECTION: 100
});

const trackProviderChange = (0, (_debounce || _load_debounce()).default)(providerName => {
  analyticsSessionId = analyticsSessionId || Date.now().toString();
  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.CHANGE_TAB, {
    'quickopen-provider': providerName,
    'quickopen-session': analyticsSessionId
  });
}, AnalyticsDebounceDelays.CHANGE_TAB);

let Activation = class Activation {

  constructor() {
    this._previousFocus = null;
    this._scrollableAreaHeightGap = MODAL_MARGIN + TOPBAR_APPROX_HEIGHT;
    this._subscriptions = new _atom.CompositeDisposable();
    this._currentProvider = getSearchResultManager().getProviderByName(DEFAULT_PROVIDER);
    (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).default.getInstance().register(action => {
      if (action.actionType === (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.ACTIVE_PROVIDER_CHANGED) {
        this._handleActiveProviderChange(action.providerName);
      }
    });

    this._subscriptions.add(atom.commands.add('body', 'core:cancel', () => {
      if (this._searchPanel && this._searchPanel.isVisible()) {
        this.closeSearchPanel();
      }
    }));

    this.closeSearchPanel = this.closeSearchPanel.bind(this);
  }

  _render() {
    if (this._reactDiv == null) {
      const _reactDiv = document.createElement('div');
      this._searchPanel = atom.workspace.addModalPanel({
        item: _reactDiv,
        visible: false
      });
      const modalView = atom.views.getView(this._searchPanel);
      // These styles are for Atom Dark, which sets a fixed width for modals.
      Object.assign(modalView.style, {
        marginLeft: '0',
        maxWidth: 'none',
        position: 'absolute',
        width: 'auto',
        left: `${ MODAL_MARGIN }px`,
        right: `${ MODAL_MARGIN }px`
      });
      this._reactDiv = _reactDiv;
    }

    const _searchComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_QuickSelectionComponent || _load_QuickSelectionComponent()).default, {
      activeProvider: this._currentProvider,
      scrollableAreaHeightGap: this._scrollableAreaHeightGap,
      onBlur: this.closeSearchPanel
    }), this._reactDiv);

    if (!(_searchComponent instanceof (_QuickSelectionComponent || _load_QuickSelectionComponent()).default)) {
      throw new Error('Invariant violation: "_searchComponent instanceof QuickSelectionComponent"');
    }

    if (this._searchComponent == null) {
      _searchComponent.onSelection(selection => {
        const options = {};
        if (selection.line) {
          options.initialLine = selection.line;
        }
        if (selection.column) {
          options.initialColumn = selection.column;
        }

        atom.workspace.open(selection.path, options).then(textEditor => {
          atom.commands.dispatch(atom.views.getView(textEditor), 'tabs:keep-preview-tab');
        });

        const query = _searchComponent.getInputTextEditor().textContent;
        const providerName = this._currentProvider.name;
        // default to empty string because `track` enforces string-only values
        const sourceProvider = selection.sourceProvider || '';
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.SELECT_FILE, {
          'quickopen-filepath': selection.path,
          'quickopen-query': query,
          'quickopen-provider': providerName, // The currently open "tab".
          'quickopen-session': analyticsSessionId || '',
          // Because the `provider` is usually OmniSearch, also track the original provider.
          'quickopen-provider-source': sourceProvider
        });
        this.closeSearchPanel();
      });

      _searchComponent.onCancellation(() => this.closeSearchPanel());
      _searchComponent.onSelectionChanged((0, (_debounce || _load_debounce()).default)(selection => {
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

  _handleActiveProviderChange(newProviderName) {
    trackProviderChange(newProviderName);
    // Toggle newProviderName before setting this._currentProvider to make
    // the search panel stay open.
    this.toggleProvider(newProviderName);
    this._currentProvider = getSearchResultManager().getProviderByName(newProviderName);
    this._render();
  }

  toggleOmniSearchProvider() {
    (_QuickSelectionActions || _load_QuickSelectionActions()).default.changeActiveProvider('OmniSearchResultProvider');
  }

  toggleProvider(providerName) {
    analyticsSessionId = analyticsSessionId || Date.now().toString();
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.CHANGE_TAB, {
      'quickopen-provider': providerName,
      'quickopen-session': analyticsSessionId
    });
    const provider = getSearchResultManager().getProviderByName(providerName);
    // "toggle" behavior
    if (this._searchPanel != null && this._searchPanel.isVisible() && providerName === this._currentProvider.name) {
      this.closeSearchPanel();
      return;
    }

    this._currentProvider = provider;
    this._render();
    this.showSearchPanel();
  }

  showSearchPanel() {
    this._previousFocus = document.activeElement;
    const _searchComponent = this._searchComponent,
          _searchPanel = this._searchPanel;

    if (_searchComponent != null && _searchPanel != null) {
      // Start a new search "session" for analytics purposes.
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(AnalyticsEvents.OPEN_PANEL, {
        'quickopen-session': analyticsSessionId || ''
      });
      // showSearchPanel gets called when changing providers even if it's already shown.
      const isAlreadyVisible = _searchPanel.isVisible();
      _searchPanel.show();
      _searchComponent.focus();
      if ((_featureConfig || _load_featureConfig()).default.get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
        const selectedText = this._getFirstSelectionText();
        if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
          _searchComponent.setInputValue(selectedText.split('\n')[0]);
        }
      }
      _searchComponent.selectInput();
    }
  }

  closeSearchPanel() {
    const _searchComponent = this._searchComponent,
          _searchPanel = this._searchPanel;

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

  _getFirstSelectionText() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      return editor.getSelections()[0].getText();
    }
  }

  dispose() {
    this._subscriptions.dispose();
    if (this._reactDiv != null) {
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._reactDiv);
      this._reactDiv = null;
    }
    if (this._searchPanel != null) {
      this._searchPanel.destroy();
      this._searchPanel = null;
    }
  }
};


let activation = null;
function getActivation() {
  if (activation == null) {
    activation = new Activation();
  }
  return activation;
}

let listeners = null;

function activate() {
  listeners = new _atom.CompositeDisposable();
  listeners.add(atom.commands.add('atom-workspace', {
    'nuclide-quick-open:find-anything-via-omni-search': () => {
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

function consumeCWD(cwd) {
  const disposable = cwd.observeCwd(dir => {
    getSearchResultManager().setCurrentWorkingRoot(dir);
  });

  if (!(listeners != null)) {
    throw new Error('Invariant violation: "listeners != null"');
  }

  listeners.add(disposable);
  return disposable;
}