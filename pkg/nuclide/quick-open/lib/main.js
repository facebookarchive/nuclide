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
  QuickSelectionComponent,
} from './QuickSelectionComponent';

import type {
  QuickSelectionProvider,
} from './types';

var trackFunction;
function track(...args) {
  var trackFunc = trackFunction || (trackFunction = require('nuclide-analytics').track);
  trackFunc.apply(null, args);
}

var debounceFunction = null;
function debounce(...args) {
  var debounceFunc = debounceFunction || (debounceFunction = require('nuclide-commons').debounce);
  return debounceFunc.apply(null, args);
};

var searchResultManager = null;
function getSearchResultManager() {
  return searchResultManager || (searchResultManager = require('./SearchResultManager'));
};

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

  constructor() {
    this._previousFocus = null;

    var {CompositeDisposable} = require('atom');
    this._currentProvider = getSearchResultManager().getProvider(DEFAULT_PROVIDER);
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

  toggleProvider(providerName: string) {
    analyticsSessionId = analyticsSessionId || Date.now().toString();
    track(
      AnalyticsEvents.CHANGE_TAB,
      {
        'quickopen-provider': providerName,
        'quickopen-session': analyticsSessionId,
      }
    );
    var provider = getSearchResultManager().getProvider(providerName);
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

var {CompositeDisposable} = require('atom');

var activation: ?Activation = null;
var listeners: ?CompositeDisposable = null;
var projectRoots: ?Set = null;

function activateSearchUI(): void {
  if (!activation) {
    activation = new Activation();
  }
}

/**
 * @param projectPaths All the root directories in the Atom workspace.
 */
function initSearch(projectPaths: Array<string>): void {
  var {getClient} = require('nuclide-client');
  var newProjectRoots = new Set();
  projectRoots.forEach((projectPath) => {
    newProjectRoots.add(projectPath);
    if (projectRoots.has(projectPath)) {
      return;
    }
    var client = getClient(projectPath);
    if (client) {
      // It doesn't matter what the search term is. Empirically, doing an initial
      // search speeds up the next search much more than simply doing the setup
      // kicked off by 'fileSearchForDirectory'.
      client.searchDirectory(projectPath, 'a');
    }
  });
  projectRoots = newProjectRoots;
}

module.exports = {

  activate(): void {
    listeners = new CompositeDisposable();
    listeners.add(
      atom.commands.add('atom-workspace', {
        'nuclide-quick-open:toggle-omni-search': () => {
          activateSearchUI();
          activation.toggleProvider('OmniSearchResultProvider');
        },
        'nuclide-quick-open:toggle-quick-open': () => {
          activateSearchUI();
          activation.toggleProvider('FileListProvider');
        },
        'nuclide-quick-open:toggle-symbol-search': () => {
          activateSearchUI();
          activation.toggleProvider('SymbolListProvider');
        },
        'nuclide-quick-open:toggle-biggrep-search': () => {
          activateSearchUI();
          activation.toggleProvider('BigGrepListProvider');
        },
        'nuclide-quick-open:toggle-openfilename-search': () => {
          activateSearchUI();
          activation.toggleProvider('OpenFileListProvider');
        },
      })
    );

    // Do search preprocessing for all existing and future root directories.
    projectRoots = new Set();
    atom.project.getPaths(initSearch);
    listeners.add(atom.project.onDidChangePaths(initSearch));
  },

  deactivate(): void {
    if (activation) {
      activation = null;
    }
    if (listeners) {
      listeners.dispose();
      listeners = null;
    }
  }
};
