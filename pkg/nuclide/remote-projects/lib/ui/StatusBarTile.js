'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var ConnectionState = require('../ConnectionState');
var {
  notifyLocalDiskFile,
  notifyConnectedRemoteFile,
  notifyDisconnectedRemoteFile,
} = require('../notification');
var React = require('react-for-atom');
var {PropTypes} = React;

var StatusBarTile = React.createClass({
  propTypes: {
    connectionState: PropTypes.number.isRequired,
    fileUri: PropTypes.string,
  },

  render(): ?ReactElement {
    var message = null;
    var iconName = null;
    switch (this.props.connectionState) {
      case ConnectionState.NONE:
        break;
      case ConnectionState.LOCAL:
        message = 'Local';
        iconName = 'local';
        break;
      case ConnectionState.CONNECTED:
        message = 'Connected';
        iconName = 'connected';
        break;
      case ConnectionState.DISCONNECTED:
        message = 'Disconnected';
        iconName = 'disconnected';
        break;
    }
    // When the active pane isn't a text editor, e.g. diff view, preferences, ..etc.,
    // We don't show a connection status bar.
    if (!message) {
      return null;
    }
    var imageIconPath = `atom://nuclide-remote-projects/images/${iconName}_icon.png`;
    return (
      <div className="nuclide-remote-projects-status-btn"
        onClick={this.onStatusBarTileClicked}>
          <img src={imageIconPath}></img>
          <span>{message}</span>
      </div>
    );
  },

  onStatusBarTileClicked(): void {
    switch (this.props.connectionState) {
      case ConnectionState.LOCAL:
        notifyLocalDiskFile(this.props.fileUri);
        break;
      case ConnectionState.CONNECTED:
        notifyConnectedRemoteFile(this.props.fileUri);
        break;
      case ConnectionState.DISCONNECTED:
        notifyDisconnectedRemoteFile(this.props.fileUri);
        break;
    }
  },
});

module.exports = StatusBarTile;
