Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var StatusBarTile = (function (_React$Component) {
  _inherits(StatusBarTile, _React$Component);

  function StatusBarTile(props) {
    _classCallCheck(this, StatusBarTile);

    _get(Object.getPrototypeOf(StatusBarTile.prototype), 'constructor', this).call(this, props);
    this._onStatusBarTileClicked = this._onStatusBarTileClicked.bind(this);
  }

  _createClass(StatusBarTile, [{
    key: 'render',
    value: function render() {
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
        onClick: this._onStatusBarTileClicked
      });
    }
  }, {
    key: '_onStatusBarTileClicked',
    value: function _onStatusBarTileClicked() {
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
  }]);

  return StatusBarTile;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = StatusBarTile;
module.exports = exports.default;