'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.registerProvider = registerProvider;
exports.consumeCWD = consumeCWD;
exports.consumeDeepLinkService = consumeDeepLinkService;
exports.getHomeFragments = getHomeFragments;

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _QuickSelectionComponent;

function _load_QuickSelectionComponent() {
  return _QuickSelectionComponent = _interopRequireDefault(require('./QuickSelectionComponent'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _SearchResultManager;

function _load_SearchResultManager() {
  return _SearchResultManager = _interopRequireDefault(require('./SearchResultManager'));
}

var _QuickOpenProviderRegistry;

function _load_QuickOpenProviderRegistry() {
  return _QuickOpenProviderRegistry = _interopRequireDefault(require('./QuickOpenProviderRegistry'));
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Don't pre-fill search input if selection is longer than this:
const MAX_SELECTION_LENGTH = 1000; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */

const ANALYTICS_CHANGE_SELECTION_DEBOUCE = 100;

class Activation {

  constructor() {
    this._analyticsSessionId = null;
    this._previousFocus = null;
    this._searchComponent = null;
    this._searchPanel = null;
    this._quickOpenProviderRegistry = new (_QuickOpenProviderRegistry || _load_QuickOpenProviderRegistry()).default();
    this._quickSelectionDispatcher = new (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).default();
    this._quickSelectionActions = new (_QuickSelectionActions || _load_QuickSelectionActions()).default(this._quickSelectionDispatcher);
    this._searchResultManager = new (_SearchResultManager || _load_SearchResultManager()).default(this._quickOpenProviderRegistry);
    this._dispatcherToken = this._quickSelectionDispatcher.register(this._handleActions.bind(this));
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', {
      'nuclide-quick-open:find-anything-via-omni-search': () => {
        this._quickSelectionActions.changeActiveProvider('OmniSearchResultProvider');
      }
    }));

    this._handleSelectionChanged = (0, (_debounce || _load_debounce()).default)(this._handleSelectionChanged.bind(this), ANALYTICS_CHANGE_SELECTION_DEBOUCE);

    this._handleSelection = this._handleSelection.bind(this);
    this._closeSearchPanel = this._closeSearchPanel.bind(this);
  }

  _handleActions(action) {
    switch (action.actionType) {
      case (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.ACTIVE_PROVIDER_CHANGED:
        this._handleActiveProviderChange(action.providerName);
        break;
      case (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.QUERY:
        this._searchResultManager.executeQuery(action.query);
        break;
    }
  }

  _handleSelection(selections, providerName, query) {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      if (selection.callback != null) {
        selection.callback();
      } else {
        (0, (_goToLocation || _load_goToLocation()).goToLocation)(selection.path, selection.line, selection.column);
      }
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('quickopen-select-file', {
        'quickopen-filepath': selection.path,
        'quickopen-query': query,
        // The currently open "tab".
        'quickopen-provider': providerName,
        'quickopen-session': this._analyticsSessionId || '',
        // Because the `provider` is usually OmniSearch, also track the original provider.
        // flowlint-next-line sketchy-null-mixed:off
        'quickopen-provider-source': selection.sourceProvider || ''
      });
    }
    this._closeSearchPanel();
  }

  _handleSelectionChanged(selectionIndex, providerName, query) {
    // Only track user-initiated selection-change events.
    if (this._analyticsSessionId != null) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('quickopen-change-selection', {
        'quickopen-selected-index': selectionIndex.selectedItemIndex.toString(),
        'quickopen-selected-service': selectionIndex.selectedService,
        'quickopen-selected-directory': selectionIndex.selectedDirectory,
        'quickopen-session': this._analyticsSessionId
      });
    }
  }

  _handleActiveProviderChange(newProviderName) {
    /**
     * A "session" for the purpose of analytics. It exists from the moment the
     * quick-open UI becomes visible until it gets closed, either via file
     * selection or cancellation.
     */
    this._analyticsSessionId =
    // flowlint-next-line sketchy-null-string:off
    this._analyticsSessionId || Date.now().toString();
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('quickopen-change-tab', {
      'quickopen-provider': newProviderName,
      'quickopen-session': this._analyticsSessionId
    });
    if (this._searchPanel != null && this._searchPanel.isVisible() && this._searchResultManager.getActiveProviderName() === newProviderName) {
      // Search panel is already open. Just focus on the query textbox.
      if (!(this._searchComponent != null)) {
        throw new Error('Invariant violation: "this._searchComponent != null"');
      }

      this._searchComponent.selectAllText();
    } else {
      this._searchResultManager.setActiveProvider(newProviderName);
      this._showSearchPanel();
    }
  }

  _showSearchPanel(initialQuery) {
    if (this._searchPanel == null) {
      this._searchPanel = atom.workspace.addModalPanel({
        item: document.createElement('div'),
        visible: false,
        className: 'nuclide-quick-open'
      });
    }

    const searchPanel = this._searchPanel;

    if (!(searchPanel != null)) {
      throw new Error('Invariant violation: "searchPanel != null"');
    }

    const searchComponent = _reactDom.default.render(_react.createElement((_QuickSelectionComponent || _load_QuickSelectionComponent()).default, {
      quickSelectionActions: this._quickSelectionActions,
      searchResultManager: this._searchResultManager,
      onSelection: this._handleSelection,
      onCancellation: this._closeSearchPanel
    }), searchPanel.getItem());

    if (!(searchComponent instanceof (_QuickSelectionComponent || _load_QuickSelectionComponent()).default)) {
      throw new Error('Invariant violation: "searchComponent instanceof QuickSelectionComponent"');
    }

    if (this._searchComponent != null && this._searchComponent !== searchComponent) {
      throw new Error('Only one QuickSelectionComponent can be rendered at a time.');
    }

    // Start a new search "session" for analytics purposes.
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('quickopen-open-panel', {
      'quickopen-session': this._analyticsSessionId || ''
    });

    if (this._searchComponent == null) {
      this._searchComponent = searchComponent;
      this._previousFocus = document.activeElement;
    }

    if (initialQuery != null) {
      searchComponent.setInputValue(initialQuery);
    } else if (!searchPanel.isVisible() && (_featureConfig || _load_featureConfig()).default.get('nuclide-quick-open.useSelection')) {
      // Only on initial render should you use the current selection as a query.
      const editor = atom.workspace.getActiveTextEditor();
      const selectedText = editor != null && editor.getSelections()[0].getText();
      if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
        searchComponent.setInputValue(selectedText.split('\n')[0]);
      }
    }

    if (!searchPanel.isVisible()) {
      searchPanel.show();
      searchComponent.focus();
    }
  }

  _closeSearchPanel() {
    if (this._searchComponent != null) {
      if (!(this._searchPanel != null)) {
        throw new Error('Invariant violation: "this._searchPanel != null"');
      }

      _reactDom.default.unmountComponentAtNode(this._searchPanel.getItem());
      this._searchComponent = null;
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('quickopen-close-panel', {
        'quickopen-session': this._analyticsSessionId || ''
      });
      this._analyticsSessionId = null;
    }

    if (this._searchPanel != null && this._searchPanel.isVisible()) {
      this._searchPanel.hide();
    }

    if (this._previousFocus != null) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
  }

  registerProvider(service) {
    const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._quickOpenProviderRegistry.addProvider(service));

    // If the provider is renderable and specifies a keybinding, wire it up with
    // the toggle command.
    if (service.display != null && service.display.action != null) {
      subscriptions.add(atom.commands.add('atom-workspace', {
        [service.display.action]: () => {
          this._quickSelectionActions.changeActiveProvider(service.name);
        }
      }));
    }

    return subscriptions;
  }

  consumeCWDService(service) {
    const disposable = service.observeCwd(dir => {
      this._searchResultManager.setCurrentWorkingRoot(dir);
    });
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumeDeepLinkService(service) {
    const disposable = service.subscribeToPath('quick-open-query', params => {
      const { query } = params;
      if (typeof query === 'string') {
        this._showSearchPanel(query);
      }
    });
    this._subscriptions.add(disposable);
    return disposable;
  }

  dispose() {
    this._subscriptions.dispose();
    this._quickSelectionDispatcher.unregister(this._dispatcherToken);
    this._closeSearchPanel();
    if (this._searchPanel != null) {
      this._searchPanel.destroy();
      this._searchPanel = null;
    }
    // SearchResultManager's disposal causes QuickSelectionComponent to do work,
    // so dispose of SearchResultManager after unmounting QuickSelectionComponent.
    this._searchResultManager.dispose();
  }
}

let activation = null;

function activate() {
  activation = new Activation();
}

function deactivate() {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  activation.dispose();
  activation = null;
}

function registerProvider(service) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.registerProvider(service);
}

function consumeCWD(cwd) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.consumeCWDService(cwd);
}

function consumeDeepLinkService(service) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.consumeDeepLinkService(service);
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