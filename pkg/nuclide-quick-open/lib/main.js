'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Provider} from './types';
import type {HomeFragments} from '../../nuclide-home/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {DeepLinkService, DeepLinkParams} from '../../nuclide-deep-link/lib/types';

import invariant from 'assert';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import QuickSelectionComponent from './QuickSelectionComponent';
import {CompositeDisposable} from 'atom';
import featureConfig from '../../commons-atom/featureConfig';
import {track} from '../../nuclide-analytics';
import debounce from '../../commons-node/debounce';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import SearchResultManager from './SearchResultManager';
import QuickSelectionActions from './QuickSelectionActions';
import QuickSelectionDispatcher, {ActionTypes} from './QuickSelectionDispatcher';

function getSearchResultManager() {
  return SearchResultManager.getInstance();
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
  SELECT_FILE: 'quickopen-select-file',
});
const AnalyticsDebounceDelays = Object.freeze({
  CHANGE_TAB: 100,
  CHANGE_SELECTION: 100,
});

const trackProviderChange = debounce(providerName => {
  analyticsSessionId = analyticsSessionId || Date.now().toString();
  track(
    AnalyticsEvents.CHANGE_TAB,
    {
      'quickopen-provider': providerName,
      'quickopen-session': analyticsSessionId,
    },
  );
}, AnalyticsDebounceDelays.CHANGE_TAB);

class Activation {
  _currentProvider: Object;
  _previousFocus: ?HTMLElement;
  _reactDiv: ?HTMLElement;
  _searchComponent: ?QuickSelectionComponent;
  _searchPanel: ?atom$Panel;
  _subscriptions: atom$CompositeDisposable;
  _scrollableAreaHeightGap: number;

  constructor() {
    this._previousFocus = null;
    this._scrollableAreaHeightGap = MODAL_MARGIN + TOPBAR_APPROX_HEIGHT;
    this._subscriptions = new CompositeDisposable();
    this._currentProvider = getSearchResultManager().getProviderByName(DEFAULT_PROVIDER);
    QuickSelectionDispatcher.getInstance().register(action => {
      if (action.actionType === ActionTypes.ACTIVE_PROVIDER_CHANGED) {
        this._handleActiveProviderChange(action.providerName);
      }
    });

    this._subscriptions.add(
      atom.commands.add('body', 'core:cancel', () => {
        if (this._searchPanel && this._searchPanel.isVisible()) {
          this.closeSearchPanel();
        }
      }),
    );

    (this: any).closeSearchPanel = this.closeSearchPanel.bind(this);
    (this: any)._handleDeepLink = this._handleDeepLink.bind(this);
  }

  _render(): void {
    if (this._reactDiv == null) {
      const _reactDiv = document.createElement('div');
      this._searchPanel = atom.workspace.addModalPanel({
        item: _reactDiv,
        visible: false,
      });
      const modalView = atom.views.getView(this._searchPanel);
      // These styles are for Atom Dark, which sets a fixed width for modals.
      Object.assign(modalView.style, {
        marginLeft: '0',
        maxWidth: 'none',
        position: 'absolute',
        width: 'auto',
        left: `${MODAL_MARGIN}px`,
        right: `${MODAL_MARGIN}px`,
      });
      this._reactDiv = _reactDiv;
    }

    const _searchComponent = ReactDOM.render(
      <QuickSelectionComponent
        activeProvider={this._currentProvider}
        scrollableAreaHeightGap={this._scrollableAreaHeightGap}
        onBlur={this.closeSearchPanel}
      />,
      this._reactDiv,
    );
    invariant(_searchComponent instanceof QuickSelectionComponent);

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
        track(
          AnalyticsEvents.SELECT_FILE,
          {
            'quickopen-filepath': selection.path,
            'quickopen-query': query,
            'quickopen-provider': providerName, // The currently open "tab".
            'quickopen-session': analyticsSessionId || '',
            // Because the `provider` is usually OmniSearch, also track the original provider.
            'quickopen-provider-source': sourceProvider,
          },
        );
        this.closeSearchPanel();
      });

      _searchComponent.onCancellation(() => this.closeSearchPanel());
      _searchComponent.onSelectionChanged(debounce((selection: any) => {
        // Only track user-initiated selection-change events.
        if (analyticsSessionId != null) {
          track(
            AnalyticsEvents.CHANGE_SELECTION,
            {
              'quickopen-selected-index': selection.selectedItemIndex.toString(),
              'quickopen-selected-service': selection.selectedService,
              'quickopen-selected-directory': selection.selectedDirectory,
              'quickopen-session': analyticsSessionId,
            },
          );
        }
      }, AnalyticsDebounceDelays.CHANGE_SELECTION));
    }

    this._searchComponent = _searchComponent;
  }


  _handleActiveProviderChange(newProviderName: string): void {
    trackProviderChange(newProviderName);
    // Toggle newProviderName before setting this._currentProvider to make
    // the search panel stay open.
    this.toggleProvider(newProviderName);
    this._currentProvider = getSearchResultManager().getProviderByName(newProviderName);
    this._render();
  }

  toggleOmniSearchProvider(): void {
    QuickSelectionActions.changeActiveProvider('OmniSearchResultProvider');
  }

  toggleProvider(providerName: string) {
    analyticsSessionId = analyticsSessionId || Date.now().toString();
    track(
      AnalyticsEvents.CHANGE_TAB,
      {
        'quickopen-provider': providerName,
        'quickopen-session': analyticsSessionId,
      },
    );
    const provider = getSearchResultManager().getProviderByName(providerName);
    // "toggle" behavior
    if (
      this._searchPanel != null &&
      this._searchPanel.isVisible() &&
      providerName === this._currentProvider.name
    ) {
      this.closeSearchPanel();
      return;
    }

    this._currentProvider = provider;
    this._render();
    this.showSearchPanel();
  }

  showSearchPanel(initialQuery?: string) {
    this._previousFocus = document.activeElement;
    const {_searchComponent, _searchPanel} = this;
    if (_searchComponent != null && _searchPanel != null) {
      // Start a new search "session" for analytics purposes.
      track(
        AnalyticsEvents.OPEN_PANEL,
        {
          'quickopen-session': analyticsSessionId || '',
        },
      );
      // showSearchPanel gets called when changing providers even if it's already shown.
      const isAlreadyVisible = _searchPanel.isVisible();
      _searchPanel.show();
      _searchComponent.focus();
      if (initialQuery != null) {
        _searchComponent.setInputValue(initialQuery);
      } else if (featureConfig.get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
        const selectedText = this._getFirstSelectionText();
        if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
          _searchComponent.setInputValue(selectedText.split('\n')[0]);
        }
      }
      _searchComponent.selectInput();
    }
  }

  closeSearchPanel() {
    const {_searchComponent, _searchPanel} = this;
    if (_searchComponent != null && _searchPanel != null) {
      track(
        AnalyticsEvents.CLOSE_PANEL,
        {
          'quickopen-session': analyticsSessionId || '',
        },
      );
      _searchPanel.hide();
      _searchComponent.blur();
      analyticsSessionId = null;
    }

    if (this._previousFocus != null) {
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

  _handleDeepLink(message: DeepLinkParams): void {
    const {query} = message;
    if (typeof query === 'string') {
      if (this._searchComponent == null) {
        this._render();
      }
      this.showSearchPanel(query);
    }
  }

  consumeDeepLinkService(service: DeepLinkService): void {
    const subscription = new UniversalDisposable(
      service.subscribeToPath('quick-open-query', this._handleDeepLink),
    );
    this._subscriptions.add(subscription);
  }

  dispose(): void {
    this._subscriptions.dispose();
    if (this._reactDiv != null) {
      ReactDOM.unmountComponentAtNode(this._reactDiv);
      this._reactDiv = null;
    }
    if (this._searchPanel != null) {
      this._searchPanel.destroy();
      this._searchPanel = null;
    }
  }
}

let activation: ?Activation = null;
function getActivation(): Activation {
  if (activation == null) {
    activation = new Activation();
  }
  return activation;
}

let listeners: ?CompositeDisposable = null;

export function activate(): void {
  listeners = new CompositeDisposable();
  listeners.add(
    atom.commands.add('atom-workspace', {
      'nuclide-quick-open:find-anything-via-omni-search': () => {
        getActivation().toggleOmniSearchProvider();
      },
    }),
  );
  getActivation();
}

export function registerProvider(service: Provider): IDisposable {
  return getSearchResultManager().registerProvider(service);
}

export function registerStore() {
  return getSearchResultManager();
}

export function getHomeFragments(): HomeFragments {
  return {
    feature: {
      title: 'Quick Open',
      icon: 'search',
      description: 'A powerful search box to quickly find local and remote files and content.',
      command: 'nuclide-quick-open:find-anything-via-omni-search',
    },
    priority: 10,
  };
}

export function consumeDeepLinkService(service: DeepLinkService): void {
  return getActivation().consumeDeepLinkService(service);
}

export function deactivate(): void {
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

export function consumeCWD(cwd: CwdApi): IDisposable {
  const disposable = cwd.observeCwd(dir => {
    getSearchResultManager().setCurrentWorkingRoot(dir);
  });
  invariant(listeners != null);
  listeners.add(disposable);
  return disposable;
}
