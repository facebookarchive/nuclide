/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Provider} from './types';
import type {HomeFragments} from '../../nuclide-home/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {DeepLinkService, DeepLinkParams} from '../../nuclide-deep-link/lib/types';
import type {QuickSelectionAction} from './QuickSelectionDispatcher';

import invariant from 'assert';
import {React, ReactDOM} from 'react-for-atom';
import QuickSelectionComponent from './QuickSelectionComponent';
import featureConfig from '../../commons-atom/featureConfig';
import {goToLocation} from '../../commons-atom/go-to-location';
import {track} from '../../nuclide-analytics';
import debounce from '../../commons-node/debounce';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import SearchResultManager from './SearchResultManager';
import QuickOpenProviderRegistry from './QuickOpenProviderRegistry';
import QuickSelectionActions from './QuickSelectionActions';
import QuickSelectionDispatcher, {ActionTypes} from './QuickSelectionDispatcher';

const DEFAULT_PROVIDER = 'OmniSearchResultProvider';
// A reasonable heuristic that prevents us from having to measure:
const TOPBAR_APPROX_HEIGHT = 100;
const MODAL_MARGIN = 65;
// Don't pre-fill search input if selection is longer than this:
const MAX_SELECTION_LENGTH = 1000;
const ANALYTICS_CHANGE_SELECTION_DEBOUCE = 100;

class Activation {
  _analyticsSessionId: ?string;
  _currentProvider: Object;
  _dispatcherToken: string;
  _previousFocus: ?HTMLElement;
  _reactDiv: ?HTMLElement;
  _searchComponent: ?QuickSelectionComponent;
  _searchPanel: ?atom$Panel;
  _subscriptions: UniversalDisposable;
  _scrollableAreaHeightGap: number;
  _searchResultManager: SearchResultManager;
  _quickOpenProviderRegistry: QuickOpenProviderRegistry;
  _quickSelectionActions: QuickSelectionActions;
  _quickSelectionDispatcher: QuickSelectionDispatcher;

  constructor() {
    this._analyticsSessionId = null;
    this._previousFocus = null;
    this._scrollableAreaHeightGap = MODAL_MARGIN + TOPBAR_APPROX_HEIGHT;
    this._quickOpenProviderRegistry = new QuickOpenProviderRegistry();
    this._quickSelectionDispatcher = new QuickSelectionDispatcher();
    this._quickSelectionActions = new QuickSelectionActions(
      this._quickSelectionDispatcher,
    );
    this._searchResultManager = new SearchResultManager(
      this._quickOpenProviderRegistry,
    );
    this._currentProvider = this._searchResultManager.getProviderByName(DEFAULT_PROVIDER);
    this._dispatcherToken = this._quickSelectionDispatcher.register(
      this._handleActions.bind(this),
    );
    this._subscriptions = new UniversalDisposable(
      atom.commands.add('atom-workspace', {
        'nuclide-quick-open:find-anything-via-omni-search': () => {
          this._quickSelectionActions.changeActiveProvider('OmniSearchResultProvider');
        },
      }),
      atom.commands.add('body', 'core:cancel', () => {
        if (this._searchPanel && this._searchPanel.isVisible()) {
          this._closeSearchPanel();
        }
      }),
    );
    (this: any)._closeSearchPanel = this._closeSearchPanel.bind(this);
  }

  _handleActions(action: QuickSelectionAction): void {
    switch (action.actionType) {
      case ActionTypes.ACTIVE_PROVIDER_CHANGED:
        this._handleActiveProviderChange(action.providerName);
        this._searchResultManager.setActiveProvider(action.providerName);
        break;
      case ActionTypes.QUERY:
        this._searchResultManager.executeQuery(action.query);
        break;
    }
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
        quickSelectionActions={this._quickSelectionActions}
        searchResultManager={this._searchResultManager}
        onBlur={this._closeSearchPanel}
      />,
      this._reactDiv,
    );
    invariant(_searchComponent instanceof QuickSelectionComponent);

    if (this._searchComponent == null) {
      _searchComponent.onSelection(selection => {
        goToLocation(selection.path, selection.line, selection.column);
        track('quickopen-select-file', {
          'quickopen-filepath': selection.path,
          'quickopen-query': _searchComponent.getInputValue(),
          // The currently open "tab".
          'quickopen-provider': this._currentProvider.name,
          'quickopen-session': this._analyticsSessionId || '',
          // Because the `provider` is usually OmniSearch, also track the original provider.
          'quickopen-provider-source': selection.sourceProvider || '',
        });
        this._closeSearchPanel();
      });

      _searchComponent.onCancellation(this._closeSearchPanel);
      _searchComponent.onSelectionChanged(debounce((selection: any) => {
        // Only track user-initiated selection-change events.
        if (this._analyticsSessionId != null) {
          track('quickopen-change-selection', {
            'quickopen-selected-index': selection.selectedItemIndex.toString(),
            'quickopen-selected-service': selection.selectedService,
            'quickopen-selected-directory': selection.selectedDirectory,
            'quickopen-session': this._analyticsSessionId,
          });
        }
      }, ANALYTICS_CHANGE_SELECTION_DEBOUCE));
    }

    this._searchComponent = _searchComponent;
  }


  _handleActiveProviderChange(newProviderName: string): void {
    /**
     * A "session" for the purpose of analytics. It exists from the moment the
     * quick-open UI becomes visible until it gets closed, either via file
     * selection or cancellation.
     */
    this._analyticsSessionId = this._analyticsSessionId || Date.now().toString();
    track('quickopen-change-tab', {
      'quickopen-provider': newProviderName,
      'quickopen-session': this._analyticsSessionId,
    });
    if (
      this._searchPanel != null &&
      this._searchPanel.isVisible() &&
      newProviderName === this._currentProvider.name
    ) {
      this._closeSearchPanel();
    } else {
      const provider = this._searchResultManager.getProviderByName(newProviderName);
      this._currentProvider = provider;
      this._render();
      this._showSearchPanel();
    }
  }

  _showSearchPanel(initialQuery?: string): void {
    this._previousFocus = document.activeElement;
    const {_searchComponent, _searchPanel} = this;
    if (_searchComponent != null && _searchPanel != null) {
      // Start a new search "session" for analytics purposes.
      track('quickopen-open-panel', {
        'quickopen-session': this._analyticsSessionId || '',
      });
      // _showSearchPanel gets called when changing providers even if it's already shown.
      const isAlreadyVisible = _searchPanel.isVisible();
      _searchPanel.show();
      _searchComponent.focus();
      if (initialQuery != null) {
        _searchComponent.setInputValue(initialQuery);
      } else if (featureConfig.get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
        const editor = atom.workspace.getActiveTextEditor();
        const selectedText = editor != null && editor.getSelections()[0].getText();
        if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
          _searchComponent.setInputValue(selectedText.split('\n')[0]);
        }
      }
      _searchComponent.selectInput();
    }
  }

  _closeSearchPanel(): void {
    const {_searchComponent, _searchPanel} = this;
    if (_searchComponent != null && _searchPanel != null && _searchPanel.isVisible()) {
      track('quickopen-close-panel', {
        'quickopen-session': this._analyticsSessionId || '',
      });
      _searchPanel.hide();
      _searchComponent.blur();
      this._analyticsSessionId = null;
    }

    if (this._previousFocus != null) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
  }

  registerProvider(service: Provider): IDisposable {
    const subscriptions = new UniversalDisposable(
      this._quickOpenProviderRegistry.addProvider(service),
    );

    // If the provider is renderable and specifies a keybinding, wire it up with
    // the toggle command.
    const serviceAction =
      typeof service.isRenderable === 'function' &&
      service.isRenderable() &&
      typeof service.getAction === 'function' &&
      service.getAction();

    if (typeof serviceAction === 'string' && serviceAction.length > 0) {
      subscriptions.add(
        atom.commands.add('atom-workspace', {
          [serviceAction]: () => {
            const serviceName = service.getName();
            this._quickSelectionActions.changeActiveProvider(serviceName);
          },
        }),
      );
    }

    return subscriptions;
  }

  consumeCWDService(service: CwdApi): IDisposable {
    const disposable = service.observeCwd(dir => {
      this._searchResultManager.setCurrentWorkingRoot(dir);
    });
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumeDeepLinkService(service: DeepLinkService): IDisposable {
    const disposable = service.subscribeToPath(
      'quick-open-query',
      (params: DeepLinkParams): void => {
        const {query} = params;
        if (typeof query === 'string') {
          if (this._searchComponent == null) {
            this._render();
          }
          this._showSearchPanel(query);
        }
      },
    );
    this._subscriptions.add(disposable);
    return disposable;
  }

  dispose(): void {
    this._subscriptions.dispose();
    this._searchResultManager.dispose();
    this._quickSelectionDispatcher.unregister(this._dispatcherToken);
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

export function activate(): void {
  activation = new Activation();
}

export function deactivate(): void {
  invariant(activation != null);
  activation.dispose();
  activation = null;
}

export function registerProvider(service: Provider): IDisposable {
  invariant(activation != null);
  return activation.registerProvider(service);
}

export function consumeCWD(cwd: CwdApi): IDisposable {
  invariant(activation != null);
  return activation.consumeCWDService(cwd);
}

export function consumeDeepLinkService(service: DeepLinkService): IDisposable {
  invariant(activation != null);
  return activation.consumeDeepLinkService(service);
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
