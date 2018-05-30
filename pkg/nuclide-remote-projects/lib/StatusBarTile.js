'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../../modules/nuclide-commons-ui/addTooltip'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireWildcard(require('react'));

var _ConnectionState;

function _load_ConnectionState() {
  return _ConnectionState = _interopRequireDefault(require('./ConnectionState'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StatusBarTile extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onStatusBarTileClicked = () => {
      const { connectionStates } = this.props;
      if (connectionStates.size === 0) {
        return;
      }
      const grouped = (0, (_collection || _load_collection()).collect)(Array.from(connectionStates).map(([hostname, state]) => [state, hostname]));
      const disconnectedHosts = grouped.get((_ConnectionState || _load_ConnectionState()).default.DISCONNECTED);
      if (disconnectedHosts != null) {
        atom.notifications.addWarning(`Lost connection to ${disconnectedHosts.join(', ')}. Attempting to reconnect...`);
      } else {
        const connectedHosts = (0, (_nullthrows || _load_nullthrows()).default)(grouped.get((_ConnectionState || _load_ConnectionState()).default.CONNECTED));
        atom.notifications.addInfo(`Connected to ${connectedHosts.join(', ')}.`);
      }
    }, _temp;
  }

  render() {
    const { connectionStates } = this.props;
    if (connectionStates.size === 0) {
      return null;
    }
    const isDisconnected = (0, (_collection || _load_collection()).someOfIterable)(connectionStates.values(), x => x === (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED);
    const iconName = isDisconnected ? 'alert' : 'cloud-upload';
    return _react.createElement('span', {
      className: `icon icon-${iconName} nuclide-remote-projects-status-icon`,
      onClick: this._onStatusBarTileClicked
      // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      , ref: (0, (_addTooltip || _load_addTooltip()).default)({ title: 'Click for connection details.' })
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