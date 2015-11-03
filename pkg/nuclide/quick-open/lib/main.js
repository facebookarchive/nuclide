'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type QuickSelectionComponent from './QuickSelectionComponent';

import type {
  Provider,
} from 'nuclide-quick-open-interfaces';
import type {HomeFragments} from 'nuclide-home-interfaces';

let trackFunction;
function track(...args) {
  const trackFunc = trackFunction || (trackFunction = require('nuclide-analytics').track);
  trackFunc.apply(null, args);
}

let debounceFunction = null;
function debounce(...args) {
  const debounceFunc = debounceFunction || (debounceFunction = require('nuclide-commons').debounce);
  return debounceFunc.apply(null, args);
}

function getSearchResultManager() {
  return require('./SearchResultManager').default.getInstance();
}

const DEFAULT_PROVIDER = 'OmniSearchResultProvider';
const MAX_MODAL_WIDTH = 800;
// don't pre-fill search input if selection is longer than this
const MAX_SELECTION_LENGTH = 1000;

/**
 * A "session" for the purpose of analytics. It exists from the moment the quick-open UI becomes
 * visible until it gets closed, either via file selection or cancellation.
 */
let analyticsSessionId = null;
const AnalyticsEvents = {
  CHANGE_SELECTION: 'quickopen-change-selection',
  CHANGE_TAB:       'quickopen-change-tab',
  CLOSE_PANEL:      'quickopen-close-panel',
  OPEN_PANEL:       'quickopen-open-panel',
  SELECT_FILE:      'quickopen-select-file',
};
const AnalyticsDebounceDelays = {
  CHANGE_TAB: 100,
  CHANGE_SELECTION: 100,
};

let _quickSelectionComponent: ?QuickSelectionComponent = null;
function getQuickSelectionComponentLazily() {
  if (!_quickSelectionComponent) {
    _quickSelectionComponent = require('./QuickSelectionComponent');
  }
  return _quickSelectionComponent;
}

let _react = null;
function getReactLazily() {
  if (_react === null) {
    _react = require('react-for-atom');
  }
  return _react;
}

const trackProviderChange = debounce(providerName => {
  analyticsSessionId = analyticsSessionId || Date.now().toString();
  track(
    AnalyticsEvents.CHANGE_TAB,
    {
      'quickopen-provider': providerName,
      'quickopen-session': analyticsSessionId,
    }
  );
}, AnalyticsDebounceDelays.CHANGE_TAB);

class Activation {
  _currentProvider: Object;
  _previousFocus: ?Element;
  _reactDiv: Element;
  _searchComponent: QuickSelectionComponent;
  _searchPanel: atom$Panel;
  _subscriptions: atom$CompositeDisposable;
  _debouncedUpdateModalPosition: () => void;

  constructor() {
    this._previousFocus = null;

    const {CompositeDisposable} = require('atom');
    this._subscriptions = new CompositeDisposable();
    this._currentProvider = getSearchResultManager().getProviderByName(DEFAULT_PROVIDER);
    const QuickSelectionDispatcher = require('./QuickSelectionDispatcher');
    QuickSelectionDispatcher.getInstance().register(action => {
      if (action.actionType === QuickSelectionDispatcher.ActionType.ACTIVE_PROVIDER_CHANGED) {
        this.toggleProvider(action.providerName);
        this._render();
      }
    });
    this._reactDiv = document.createElement('div');
    this._searchPanel = atom.workspace.addModalPanel({item: this._reactDiv, visible: false});
    this._debouncedUpdateModalPosition = debounce(this._updateModalPosition.bind(this), 200);
    window.addEventListener('resize', this._debouncedUpdateModalPosition);
    this._updateModalPosition();

    this._searchComponent = this._render();

    this._searchComponent.onSelection((selection) => {
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

      const query = this._searchComponent.getInputTextEditor().textContent;
      const providerName = this._currentProvider.name;
      // default to empty string because `track` enforces string-only values
      const sourceProvider = selection.sourceProvider || '';
      track(
        AnalyticsEvents.SELECT_FILE,
        {
          'quickopen-filepath': selection.path,
          'quickopen-query': query,
          'quickopen-provider': providerName, // The currently open "tab".
          'quickopen-session': analyticsSessionId,
          // Because the `provider` is usually OmniSearch, also track the original provider.
          'quickopen-provider-source': sourceProvider,
        }
      );
      this.closeSearchPanel();
    });

    this._subscriptions.add(
      atom.commands.add('body', 'core:cancel', () => {
        if (this._searchPanel && this._searchPanel.isVisible()) {
          this.closeSearchPanel();
        }
      })
    );

    this._searchComponent.onCancellation(() => this.closeSearchPanel());
    this._searchComponent.onSelectionChanged(debounce((selection: any) => {
      // Only track user-initiated selection-change events.
      if (analyticsSessionId != null) {
        track(
          AnalyticsEvents.CHANGE_SELECTION,
          {
            'quickopen-selected-index': selection.selectedItemIndex.toString(),
            'quickopen-selected-service': selection.selectedService,
            'quickopen-selected-directory': selection.selectedDirectory,
            'quickopen-session': analyticsSessionId,
          }
        );
      }
    }, AnalyticsDebounceDelays.CHANGE_SELECTION));
  }

  _updateModalPosition() {
    // Customize modal element
    const modalElement = this._searchPanel.getItem().parentNode;
    const {width} = document.documentElement.getBoundingClientRect();
    const modalWidth = Math.min(MAX_MODAL_WIDTH, width);
    modalElement.style.setProperty('width', modalWidth + 'px');
    modalElement.style.setProperty('margin-left', (-modalWidth / 2) + 'px');
  }

  _render() {
    // Abbreviate to avoid shadowing flow type.
    const QSComponent = getQuickSelectionComponentLazily();
    const React = getReactLazily();
    return React.render(
      <QSComponent
        activeProvider={this._currentProvider}
        onProviderChange={this.handleActiveProviderChange.bind(this)}
      />,
      this._reactDiv
    );
  }

  handleActiveProviderChange(newProviderName: string): void {
    trackProviderChange(newProviderName);
    this._currentProvider = getSearchResultManager().getProviderByName(newProviderName);
    this._render();
  }

  toggleOmniSearchProvider(): void {
    require('./QuickSelectionActions').changeActiveProvider('OmniSearchResultProvider');
  }

  toggleProvider(providerName: string) {
    analyticsSessionId = analyticsSessionId || Date.now().toString();
    track(
      AnalyticsEvents.CHANGE_TAB,
      {
        'quickopen-provider': providerName,
        'quickopen-session': analyticsSessionId,
      }
    );
    const provider = getSearchResultManager().getProviderByName(providerName);
    // "toggle" behavior
    if (
      this._searchPanel !== null &&
      this._searchPanel.isVisible() &&
      providerName === this._currentProvider.name
    ) {
      this.closeSearchPanel();
      return;
    }

    this._currentProvider = provider;
    if (this._searchComponent) {
      this._searchComponent = this._render();
    }
    this.showSearchPanel();
  }

  showSearchPanel() {
    this._previousFocus = document.activeElement;
    if (this._searchComponent && this._searchPanel) {
      // Start a new search "session" for analytics purposes.
      track(
        AnalyticsEvents.OPEN_PANEL,
        {
          'quickopen-session': analyticsSessionId,
        }
      );
      // showSearchPanel gets called when changing providers even if it's already shown.
      const isAlreadyVisible = this._searchPanel.isVisible();
      this._searchPanel.show();
      this._searchComponent.focus();
      if (atom.config.get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
        const selectedText = this._getFirstSelectionText();
        if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
          this._searchComponent.setInputValue(selectedText.split('\n')[0]);
        }
      }
      this._searchComponent.selectInput();
    }
  }

  closeSearchPanel() {
    if (this._searchComponent && this._searchPanel) {
      track(
        AnalyticsEvents.CLOSE_PANEL,
        {
          'quickopen-session': analyticsSessionId,
        }
      );
      this._searchPanel.hide();
      this._searchComponent.blur();
      analyticsSessionId = null;
    }

    if (this._previousFocus !== null) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
  }

  _getFirstSelectionText(): ?string {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      return editor.getSelections()[0].getText();
    }
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}

const {CompositeDisposable} = require('atom');

let activation: ?Activation = null;
let listeners: ?CompositeDisposable = null;

function activateSearchUI(): void {
  if (!activation) {
    activation = new Activation();
  }
}

module.exports = {

  config: {
    useSelection: {
      type: 'boolean',
      default: true,
      description: 'Use current selection to pre-fill search input',
    },
  },

  activate(): void {
    listeners = new CompositeDisposable();
    listeners.add(
      atom.commands.add('atom-workspace', {
        'nuclide-quick-open:toggle-omni-search': () => {
          activateSearchUI();
          activation.toggleOmniSearchProvider();
        },
      })
    );
    activateSearchUI();
  },

  registerProvider(service: Provider ): atom$Disposable {
    return getSearchResultManager().registerProvider(service);
  },

  registerStore() {
    return getSearchResultManager();
  },

  getHomeFragments(): HomeFragments {
    return {
      feature: {
        title: 'Quick Open',
        icon: 'search',
        description: 'A powerful search box to quickly find local and remote files and content.',
        command: 'nuclide-quick-open:toggle-omni-search',
      },
      priority: 10,
    };
  },

  deactivate(): void {
    if (activation) {
      activation.dispose();
      activation = null;
    }
    if (listeners) {
      listeners.dispose();
      listeners = null;
    }
    if (searchResultManager) {
      searchResultManager.dispose();
      searchResultManager = null;
    }
  },
};
