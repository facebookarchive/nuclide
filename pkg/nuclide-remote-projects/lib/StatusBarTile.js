"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _ConnectionState() {
  const data = _interopRequireDefault(require("./ConnectionState"));

  _ConnectionState = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class StatusBarTile extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onStatusBarTileClicked = () => {
      const {
        connectionStates
      } = this.props;

      if (connectionStates.size === 0) {
        return;
      }

      const grouped = (0, _collection().collect)(Array.from(connectionStates).map(([hostname, state]) => [state, hostname]));
      const disconnectedHosts = grouped.get(_ConnectionState().default.DISCONNECTED);

      if (disconnectedHosts != null) {
        atom.notifications.addWarning(`Lost connection to ${disconnectedHosts.join(', ')}. Attempting to reconnect...`);
      } else {
        const connectedHosts = (0, _nullthrows().default)(grouped.get(_ConnectionState().default.CONNECTED));
        atom.notifications.addInfo(`Connected to ${connectedHosts.join(', ')}.`);
      }
    }, _temp;
  }

  render() {
    const {
      connectionStates
    } = this.props;

    if (connectionStates.size === 0) {
      return null;
    }

    const isDisconnected = (0, _collection().someOfIterable)(connectionStates.values(), x => x === _ConnectionState().default.DISCONNECTED);
    const iconName = isDisconnected ? 'alert' : 'cloud-upload';
    return React.createElement("span", {
      className: `icon icon-${iconName} nuclide-remote-projects-status-icon`,
      onClick: this._onStatusBarTileClicked // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: (0, _addTooltip().default)({
        title: 'Click for connection details.'
      })
    });
  }

}

exports.default = StatusBarTile;