'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ConnectionState;

function _load_ConnectionState() {
  return _ConnectionState = _interopRequireDefault(require('./ConnectionState'));
}

var _notification;

function _load_notification() {
  return _notification = require('./notification');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StatusBarTile extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onStatusBarTileClicked = () => {
      // flowlint-next-line sketchy-null-string:off
      if (!this.props.fileUri) {
        return;
      }
      switch (this.props.connectionState) {
        case (_ConnectionState || _load_ConnectionState()).default.LOCAL:
          (0, (_notification || _load_notification()).notifyLocalDiskFile)(this.props.fileUri);
          break;
        case (_ConnectionState || _load_ConnectionState()).default.CONNECTED:
          (0, (_notification || _load_notification()).notifyConnectedRemoteFile)(this.props.fileUri);
          break;
        case (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED:
          (0, (_notification || _load_notification()).notifyDisconnectedRemoteFile)(this.props.fileUri);
          break;
      }
    }, _temp;
  }

  render() {
    let iconName = null;
    switch (this.props.connectionState) {
      case (_ConnectionState || _load_ConnectionState()).default.NONE:
        break;
      case (_ConnectionState || _load_ConnectionState()).default.CONNECTED:
        iconName = 'cloud-upload';
        break;
      case (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED:
        iconName = 'alert';
        break;
    }
    // When the active pane isn't a text editor, e.g. diff view, preferences, ..etc.,
    // We don't show a connection status bar.
    if (!iconName) {
      return null;
    }
    return _react.createElement('span', {
      className: `icon icon-${iconName} nuclide-remote-projects-status-icon`,
      onClick: this._onStatusBarTileClicked
    });
  }

}
exports.default = StatusBarTile; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */