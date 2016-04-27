

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var ConnectionState = require('../ConnectionState');

var _require = require('../notification');

var notifyLocalDiskFile = _require.notifyLocalDiskFile;
var notifyConnectedRemoteFile = _require.notifyConnectedRemoteFile;
var notifyDisconnectedRemoteFile = _require.notifyDisconnectedRemoteFile;

var _require2 = require('react-for-atom');

var React = _require2.React;
var PropTypes = React.PropTypes;

var StatusBarTile = React.createClass({
  displayName: 'StatusBarTile',

  propTypes: {
    connectionState: PropTypes.number.isRequired,
    fileUri: PropTypes.string
  },

  render: function render() {
    var iconName = null;
    switch (this.props.connectionState) {
      case ConnectionState.NONE:
        break;
      case ConnectionState.LOCAL:
        iconName = 'device-desktop';
        break;
      case ConnectionState.CONNECTED:
        iconName = 'cloud-upload';
        break;
      case ConnectionState.DISCONNECTED:
        iconName = 'alert';
        break;
    }
    // When the active pane isn't a text editor, e.g. diff view, preferences, ..etc.,
    // We don't show a connection status bar.
    if (!iconName) {
      return null;
    }
    return React.createElement('span', {
      className: 'icon icon-' + iconName + ' nuclide-remote-projects-status-icon',
      onClick: this.onStatusBarTileClicked
    });
  },

  onStatusBarTileClicked: function onStatusBarTileClicked() {
    if (!this.props.fileUri) {
      return;
    }
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
  }
});

module.exports = StatusBarTile;