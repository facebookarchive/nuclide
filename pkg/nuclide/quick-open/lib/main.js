'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  GroupedResult,
} from './types';

import type {
  QuickSelectionComponent,
} from './QuickSelectionComponent';

var {track} = require('nuclide-analytics');
var {
  debounce,
} = require('nuclide-commons');

var SearchResultManager = require('./SearchResultManager');
var QuickSelectionProvider = require('./QuickSelectionProvider');
var {
  debounce,
} = require('nuclide-commons');

var DEFAULT_PROVIDER = 'FileListProvider';
var MAX_MODAL_WIDTH = 800;

/**
 * A "session" for the purpose of analytics. It exists from the moment the quick-open UI becomes
 * visible until it gets closed, either via file selection or cancellation.
 */
var analyticsSessionId = null;
var AnalyticsEvents = {
  CHANGE_SELECTION: 'quickopen-change-selection',
  CHANGE_TAB:       'quickopen-change-tab',
  CLOSE_PANEL:      'quickopen-close-panel',
  OPEN_PANEL:       'quickopen-open-panel',
  SELECT_FILE:      'quickopen-select-file',
};
var AnalyticsDebounceDelays = {
  CHANGE_TAB: 100,
  CHANGE_SELECTION: 100,
};

var _quickSelectionComponent: ?QuickSelectionComponent = null;
function getQuickSelectionComponentLazily() {
  if (!_quickSelectionComponent) {
    _quickSelectionComponent = require('./QuickSelectionComponent');
  }
  return _quickSelectionComponent;
}

var _react = null;
function getReactLazily() {
  if (_react === null) {
    _react = require('react-for-atom');
  }
  return _react;
}

class Activation {
  _currentProvider: QuickSelectionProvider;
  _previousFocus: ?Element;
  _reactDiv: Element;
  _searchComponent: QuickSelectionComponent;
  _searchPanel: atom$Panel;
  _subscriptions: atom$CompositeDisposable;
  _debouncedUpdateModalPosition: () => void;

  constructor(state: ?Object) {
    this._previousFocus = null;

    var {CompositeDisposable} = require('atom');
    this._subscriptions = new CompositeDisposable();
    this._currentProvider = SearchResultManager.getProvider(DEFAULT_PROVIDER);
    this._reactDiv = document.createElement('div');
    this._searchPanel = atom.workspace.addModalPanel({item: this._reactDiv, visible: false});
    this._debouncedUpdateModalPosition = debounce(this._updateModalPosition.bind(this), 200);
    window.addEventListener('resize', this._debouncedUpdateModalPosition);
    this._updateModalPosition();

    this._searchComponent = this._render();
    this._searchComponent.onSelection((selection) => {
      var options = {};
      if (selection.line) {
        options.initialLine = selection.line;
      }
      if (selection.column) {
        options.initialColumn = selection.column;
      }
      atom.workspace.open(selection.path, options);
      var query = this._searchComponent.getInputTextEditor().textContent;
      var providerName = this._currentProvider.constructor.name;
      track(
        AnalyticsEvents.SELECT_FILE,
        {
          'quickopen-filepath': selection.path,
          'quickopen-query': query,
          'quickopen-provider': providerName,
          'quickopen-session': analyticsSessionId,
        }
      );
      this.closeSearchPanel();
    });

    this._searchComponent.onCancellation(() => this.closeSearchPanel());
    this._searchComponent.onTabChange(debounce(providerName => {
      analyticsSessionId = analyticsSessionId || Date.now().toString();
      track(
        AnalyticsEvents.CHANGE_TAB,
        {
          'quickopen-provider': providerName,
          'quickopen-session': analyticsSessionId,
        }
      );
      this.toggleProvider(providerName);
    }, AnalyticsDebounceDelays.CHANGE_TAB));
    this._searchComponent.onSelectionChanged(debounce((selection: any) => {
      track(
        AnalyticsEvents.CHANGE_SELECTION,
        {

          'quickopen-selected-index': selection.selectedItemIndex.toString(),
          'quickopen-selected-service': Number.prototype.toString.call(selection.selectedItemIndex),
          'quickopen-selected-directory': selection.selectedDirectory,
          'quickopen-session': analyticsSessionId,
        }
      );
    }, AnalyticsDebounceDelays.CHANGE_SELECTION));
    this._subscriptions.add(
      atom.commands.add('atom-workspace', 'nuclide-quick-open:toggle-omni-search', () => {
        this.toggleProvider('OmniSearchResultProvider');
      }),
      atom.commands.add('atom-workspace', 'nuclide-quick-open:toggle-quick-open', () => {
        this.toggleProvider('FileListProvider');
      }),
      atom.commands.add('atom-workspace', 'nuclide-quick-open:toggle-symbol-search', () => {
        this.toggleProvider('SymbolListProvider');
      }),
      atom.commands.add('atom-workspace', 'nuclide-quick-open:toggle-biggrep-search', () => {
        this.toggleProvider('BigGrepListProvider');
      }),
      atom.commands.add('atom-workspace', 'nuclide-quick-open:toggle-openfilename-search', () => {
        this.toggleProvider('OpenFileListProvider');
      })
    );
  }

  _updateModalPosition() {
    // Customize modal element
    var modalElement = this._searchPanel.getItem().parentNode;
    var {width, height} = document.documentElement.getBoundingClientRect();
    var modalWidth = Math.min(MAX_MODAL_WIDTH, width);
    modalElement.style.setProperty('width', modalWidth + 'px');
    modalElement.style.setProperty('margin-left', (-modalWidth / 2) + 'px');
  }

  _render() {
    var QuickSelectionComponent = getQuickSelectionComponentLazily();
    var React = getReactLazily();
    return React.render(
      <QuickSelectionComponent
        provider={this._currentProvider}
      />,
      this._reactDiv
    );
  }

  dispose() {
    this._subscriptions.dispose();
    window.removeEventListener('resize', this._debouncedUpdateModalPosition);
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
    var provider = SearchResultManager.getProvider(providerName);
    // "toggle" behavior
    if (
      this._searchPanel !== null &&
      this._searchPanel.isVisible() &&
      provider === this._currentProvider
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
      this._searchPanel.show();
      this._searchComponent.focus();
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
}

var activation: ?Activation = null;

module.exports = {

  activate(state: ?Object): void {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  deactivate(): void {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  }
};
