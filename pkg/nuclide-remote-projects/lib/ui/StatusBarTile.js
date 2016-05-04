function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ConnectionState = require('../ConnectionState');

var _ConnectionState2 = _interopRequireDefault(_ConnectionState);

var _notification = require('../notification');

var _reactForAtom = require('react-for-atom');

var StatusBarTile = _reactForAtom.React.createClass({
  displayName: 'StatusBarTile',

  propTypes: {
    connectionState: _reactForAtom.React.PropTypes.number.isRequired,
    fileUri: _reactForAtom.React.PropTypes.string
  },

  render: function render() {
    var iconName = null;
    switch (this.props.connectionState) {
      case _ConnectionState2.default.NONE:
        break;
      case _ConnectionState2.default.LOCAL:
        iconName = 'device-desktop';
        break;
      case _ConnectionState2.default.CONNECTED:
        iconName = 'cloud-upload';
        break;
      case _ConnectionState2.default.DISCONNECTED:
        iconName = 'alert';
        break;
    }
    // When the active pane isn't a text editor, e.g. diff view, preferences, ..etc.,
    // We don't show a connection status bar.
    if (!iconName) {
      return null;
    }
    return _reactForAtom.React.createElement('span', {
      className: 'icon icon-' + iconName + ' nuclide-remote-projects-status-icon',
      onClick: this.onStatusBarTileClicked
    });
  },

  onStatusBarTileClicked: function onStatusBarTileClicked() {
    if (!this.props.fileUri) {
      return;
    }
    switch (this.props.connectionState) {
      case _ConnectionState2.default.LOCAL:
        (0, _notification.notifyLocalDiskFile)(this.props.fileUri);
        break;
      case _ConnectionState2.default.CONNECTED:
        (0, _notification.notifyConnectedRemoteFile)(this.props.fileUri);
        break;
      case _ConnectionState2.default.DISCONNECTED:
        (0, _notification.notifyDisconnectedRemoteFile)(this.props.fileUri);
        break;
    }
  }
});

module.exports = StatusBarTile;