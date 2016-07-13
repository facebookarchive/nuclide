function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ConnectionState2;

function _ConnectionState() {
  return _ConnectionState2 = _interopRequireDefault(require('./ConnectionState'));
}

var _notification2;

function _notification() {
  return _notification2 = require('./notification');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var StatusBarTile = (_reactForAtom2 || _reactForAtom()).React.createClass({
  propTypes: {
    connectionState: (_reactForAtom2 || _reactForAtom()).React.PropTypes.number.isRequired,
    fileUri: (_reactForAtom2 || _reactForAtom()).React.PropTypes.string
  },

  render: function render() {
    var iconName = null;
    switch (this.props.connectionState) {
      case (_ConnectionState2 || _ConnectionState()).default.NONE:
        break;
      case (_ConnectionState2 || _ConnectionState()).default.LOCAL:
        iconName = 'device-desktop';
        break;
      case (_ConnectionState2 || _ConnectionState()).default.CONNECTED:
        iconName = 'cloud-upload';
        break;
      case (_ConnectionState2 || _ConnectionState()).default.DISCONNECTED:
        iconName = 'alert';
        break;
    }
    // When the active pane isn't a text editor, e.g. diff view, preferences, ..etc.,
    // We don't show a connection status bar.
    if (!iconName) {
      return null;
    }
    return (_reactForAtom2 || _reactForAtom()).React.createElement('span', {
      className: 'icon icon-' + iconName + ' nuclide-remote-projects-status-icon',
      onClick: this.onStatusBarTileClicked
    });
  },

  onStatusBarTileClicked: function onStatusBarTileClicked() {
    if (!this.props.fileUri) {
      return;
    }
    switch (this.props.connectionState) {
      case (_ConnectionState2 || _ConnectionState()).default.LOCAL:
        (0, (_notification2 || _notification()).notifyLocalDiskFile)(this.props.fileUri);
        break;
      case (_ConnectionState2 || _ConnectionState()).default.CONNECTED:
        (0, (_notification2 || _notification()).notifyConnectedRemoteFile)(this.props.fileUri);
        break;
      case (_ConnectionState2 || _ConnectionState()).default.DISCONNECTED:
        (0, (_notification2 || _notification()).notifyDisconnectedRemoteFile)(this.props.fileUri);
        break;
    }
  }
});

module.exports = StatusBarTile;