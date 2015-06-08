'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var SearchResultManager = require('./SearchResultManager');

var DEFAULT_PROVIDER = 'FileListProvider';

var _quickSelectionComponent = null;
function getQuickSelectionComponentLazily() {
  if (_quickSelectionComponent === null) {
    _quickSelectionComponent = require('./QuickSelectionComponent');;
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
  constructor(state: ?Object) {
    this._previousFocus = null;

    var {CompositeDisposable} = require('atom');
    this._subscriptions = new CompositeDisposable();
    this._currentProvider = SearchResultManager.getProvider(DEFAULT_PROVIDER);
    this._reactDiv = document.createElement('div');
    this._searchPanel = atom.workspace.addModalPanel({item: this._reactDiv, visible:false});
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
      this.closeSearchPanel();
    });

    this._searchComponent.onCancellation(() => this.closeSearchPanel());
    this._searchComponent.onTabChange(providerName => this.toggleProvider(providerName));

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
  }

  toggleProvider(providerName) {
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
      this._searchPanel.show();
      this._searchComponent.focus();
      this._searchComponent.selectInput();
    }
  }

  closeSearchPanel() {
    if (this._searchComponent && this._searchPanel) {
      this._searchPanel.hide();
      this._searchComponent.blur();
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
