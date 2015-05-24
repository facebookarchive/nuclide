'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

class Activation {
  constructor(state: ?Object) {
    this._previousFocus = null;
    this._currentProvider = null;

    var {CompositeDisposable} = require('atom');
    this._subscriptions = new CompositeDisposable();

    var {QuickSelectionComponent} = require('./QuickSelectionComponent');

    var reactDiv = document.createElement('div');
    this._searchPanel = atom.workspace.addModalPanel({item: reactDiv, visible:false});

    var React = require('react-for-atom');
    this._searchComponent = React.render(
      <QuickSelectionComponent/>,
      reactDiv
    );

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

    this._subscriptions.add(
      atom.commands.add('atom-workspace', 'nuclide-quick-open:toggle-quick-open', () => {
        var FileListProvider = require('./FileListProvider');
        this.toggleProvider(FileListProvider);
      }),
      atom.commands.add('atom-workspace', 'nuclide-quick-open:toggle-symbol-search', () => {
        var SymbolListProvider = require('./SymbolListProvider');
        this.toggleProvider(SymbolListProvider);
      }),
      atom.commands.add('atom-workspace', 'nuclide-quick-open:toggle-biggrep-search', () => {
        var BigGrepListProvider = require('./BigGrepListProvider');
        this.toggleProvider(BigGrepListProvider);
      })
    );
  }

  dispose() {
    this._subscriptions.dispose();
  }

  toggleProvider(provider) {
    if (this._searchPanel !== null && this._searchPanel.isVisible()) {
      if (provider === this._currentProvider) {
        this.closeSearchPanel();
      } else if (this._searchComponent) {
        this._currentProvider = provider;
        this._searchComponent.setProvider(new provider());
      }
    } else {
      if (provider !== this._currentProvider) {
        this._currentProvider = provider;
        if (this._searchComponent) {
          this._searchComponent.setProvider(new provider());
        }
      }
      this.showSearchPanel();
    }
  }

  showSearchPanel() {
    this._previousFocus = document.activeElement;
    if (this._searchComponent && this._searchPanel) {
      this._searchPanel.show();
      this._searchComponent.clear();
      this._searchComponent.focus();
    }
  }

  closeSearchPanel() {
    if (this._searchComponent && this._searchPanel) {
      this._searchPanel.hide();
      this._searchComponent.clear();
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
