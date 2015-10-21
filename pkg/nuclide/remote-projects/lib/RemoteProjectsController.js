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
var {CompositeDisposable, Disposable} = require('atom');
var StatusBarTile = require('./ui/StatusBarTile');
var {isTextEditor} = require('nuclide-atom-helpers');
var remoteUri = require('nuclide-remote-uri');
var ConnectionState = require('./ConnectionState');

var {onWorkspaceDidStopChangingActivePaneItem} =
  require('nuclide-atom-helpers').atomEventDebounce;

class RemoteProjectsController {
  _disposables: CompositeDisposable;
  _statusBarDiv: ?Element;
  _statusBarTile: ?Element;
  _statusSubscription: ?Disposable;

  constructor() {
    this._statusBarTile = null;
    this._disposables = new CompositeDisposable();

    this._statusSubscription = null;
    this._disposables.add(
      atom.workspace.onDidChangeActivePaneItem(this._disposeSubscription.bind(this)),
      onWorkspaceDidStopChangingActivePaneItem(this._updateConnectionStatus.bind(this))
    );
  }

  _disposeSubscription(): void {
    const subscription = this._statusSubscription;
    if (subscription) {
      this._disposables.remove(subscription);
      subscription.dispose();
      this._statusSubscription = null;
    }
  }

  _updateConnectionStatus(paneItem: Object): void {
    this._disposeSubscription();

    // That may not be generically ideal to check `instanceof`.
    // However, that's the way `pane.coffee` checks in `getActiveEditor()`.
    if (!isTextEditor(paneItem)) {
      this._renderStatusBar(ConnectionState.NONE);
      return;
    }
    var textEditor = paneItem;
    var fileUri = textEditor.getPath();
    if (!fileUri) {
      return;
    }
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
    this._statusBarDiv.className = 'nuclide-remote-projects inline-block';

    var tooltip = atom.tooltips.add(
      this._statusBarDiv,
      {title: 'Click to show details of connection.'}
    );
    var rightTile = statusBar.addLeftTile({
      item: this._statusBarDiv,
      priority: -99,
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
