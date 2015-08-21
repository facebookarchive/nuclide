'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');
var {CompositeDisposable, Disposable, TextEditor} = require('atom');
var StatusBarTile = require('./ui/StatusBarTile');
var remoteUri = require('nuclide-remote-uri');
var ConnectionState = require('./ConnectionState');

class RemoteProjectsController {
  _statusBarDiv: ?Element;
  _statusBarTile: ?Element;
  _disposables: CompositeDisposable;

  constructor() {
    this._statusBarTile = null;
    this._disposables = new CompositeDisposable();

    this._statusSubscription = null;
    this._disposables.add(atom.workspace.observeActivePaneItem(this._updateConnectionStatus.bind(this)));
  }

  _updateConnectionStatus(paneItem: Object): void {
    if (this._statusSubscription) {
      this._statusSubscription.dispose();
      this._disposables.remove(this._statusSubscription);
      this._statusSubscription = null;
    }

    // That may not be generically ideal to check `instanceof`.
    // However, that's the way `pane.coffee` checks in `getActiveEditor()`.
    if (!(paneItem instanceof TextEditor)) {
      this._renderStatusBar(ConnectionState.NONE);
      return;
    }
    var textEditor = paneItem;
    var fileUri = textEditor.getPath();
    if (remoteUri.isLocal(fileUri)) {
      this._renderStatusBar(ConnectionState.LOCAL, fileUri);
      return;
    }

    var updateStatus = isConnected => {
      this._renderStatusBar(isConnected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED, fileUri);
    };

    var {getClient} = require('nuclide-client');
    var client = getClient(fileUri);
    if (!client || !client.eventbus) {
      updateStatus(false);
      return;
    }

    updateStatus(client.eventbus.socket.isConnected());
    client.eventbus.socket.on('status', updateStatus);

    this._statusSubscription = new Disposable(() => {
      client.eventbus.socket.removeListener('status', updateStatus);
    });
    this._disposables.add(this._statusSubscription);
  }

  consumeStatusBar(statusBar: Element): void {
    this._statusBarDiv = document.createElement('div');
    this._statusBarDiv.className = 'nuclide-remote-projects-status-container';

    var tooltip = atom.tooltips.add(
      this._statusBarDiv,
      {title: 'Click to show details.'}
    );
    var rightTile = statusBar.addRightTile({
      item: this._statusBarDiv,
      priority: -80,
    });

    this._disposables.add(new Disposable(() => {
      var parentNode = this._statusBarDiv.parentNode;
      if (parentNode) {
        parentNode.removeChild(this._statusBarDiv);
      }
      React.unmountComponentAtNode(this._statusBarDiv);
      this._statusBarDiv = null;
      rightTile.destroy();
      tooltip.dispose();
    }));

    this._updateConnectionStatus(atom.workspace.getActiveTextEditor());
  }

  _renderStatusBar(connectionState: number, fileUri?: string): void {
    if (!this._statusBarDiv) {
      return;
    }

    this._statusBarTile = React.render(
      <StatusBarTile
        connectionState={connectionState}
        fileUri={fileUri}
      />,
      this._statusBarDiv,
    );
  }

  destroy(): void {
    this._disposables.dispose();
  }
}

module.exports = RemoteProjectsController;
