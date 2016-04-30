'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {RemoteConnection} from '../../nuclide-remote-connection';
import {React, ReactDOM} from 'react-for-atom';
import {CompositeDisposable, Disposable} from 'atom';
import StatusBarTile from './ui/StatusBarTile';
import remoteUri from '../../nuclide-remote-uri';
import ConnectionState from './ConnectionState';
import {atomEventDebounce} from '../../nuclide-atom-helpers';

class RemoteProjectsController {
  _disposables: CompositeDisposable;
  _statusBarDiv: ?HTMLElement;
  _statusBarTile: ?StatusBarTile;
  _statusSubscription: ?Disposable;

  constructor() {
    this._statusBarTile = null;
    this._disposables = new CompositeDisposable();

    this._statusSubscription = null;
    this._disposables.add(
      atom.workspace.onDidChangeActivePaneItem(this._disposeSubscription.bind(this)),
      atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem(
        this._updateConnectionStatus.bind(this)
      )
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

    if (!atom.workspace.isTextEditor(paneItem)) {
      this._renderStatusBar(ConnectionState.NONE);
      return;
    }
    const textEditor = paneItem;
    const fileUri = textEditor.getPath();
    if (!fileUri) {
      return;
    }
    if (remoteUri.isLocal(fileUri)) {
      this._renderStatusBar(ConnectionState.LOCAL, fileUri);
      return;
    }

    const updateStatus = isConnected => {
      this._renderStatusBar(
        isConnected ? ConnectionState.CONNECTED : ConnectionState.DISCONNECTED,
        fileUri,
      );
    };

    const connection = RemoteConnection.getForUri(fileUri);
    if (connection == null) {
      updateStatus(false);
      return;
    }

    const socket = connection.getConnection().getSocket();
    updateStatus(socket.isConnected());
    socket.on('status', updateStatus);

    this._statusSubscription = new Disposable(() => {
      socket.removeListener('status', updateStatus);
    });
    this._disposables.add(this._statusSubscription);
  }

  consumeStatusBar(statusBar: atom$StatusBar): void {
    this._statusBarDiv = document.createElement('div');
    this._statusBarDiv.className = 'nuclide-remote-projects inline-block';

    const tooltip = atom.tooltips.add(
      this._statusBarDiv,
      {title: 'Click to show details of connection.'}
    );
    invariant(this._statusBarDiv);
    const rightTile = statusBar.addLeftTile({
      item: this._statusBarDiv,
      priority: -99,
    });

    this._disposables.add(new Disposable(() => {
      invariant(this._statusBarDiv);
      const parentNode = this._statusBarDiv.parentNode;
      if (parentNode) {
        parentNode.removeChild(this._statusBarDiv);
      }
      ReactDOM.unmountComponentAtNode(this._statusBarDiv);
      this._statusBarDiv = null;
      rightTile.destroy();
      tooltip.dispose();
    }));

    const textEditor = atom.workspace.getActiveTextEditor();
    if (textEditor != null) {
      this._updateConnectionStatus(textEditor);
    }
  }

  _renderStatusBar(connectionState: number, fileUri?: string): void {
    if (!this._statusBarDiv) {
      return;
    }

    const component = ReactDOM.render(
      <StatusBarTile
        connectionState={connectionState}
        fileUri={fileUri}
      />,
      this._statusBarDiv,
    );
    invariant(component instanceof StatusBarTile);
    this._statusBarTile = component;
  }

  destroy(): void {
    this._disposables.dispose();
  }
}

module.exports = RemoteProjectsController;
