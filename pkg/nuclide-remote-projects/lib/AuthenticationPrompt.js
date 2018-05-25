'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireWildcard(require('react'));

var _AtomNotifications;

function _load_AtomNotifications() {
  return _AtomNotifications = require('./AtomNotifications');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Component to prompt the user for authentication information. */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

class AuthenticationPrompt extends _react.Component {

  constructor(props) {
    super(props);

    this._onKeyUp = e => {
      if (e.key === 'Enter') {
        this.props.onConfirm();
      }

      if (e.key === 'Escape') {
        this.props.onCancel();
      }
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    // Hitting enter when this panel has focus should confirm the dialog.
    this._disposables.add(atom.commands.add((0, (_nullthrows || _load_nullthrows()).default)(this._root), 'core:confirm', event => this.props.onConfirm()));

    // Hitting escape should cancel the dialog.
    this._disposables.add(atom.commands.add('atom-workspace', 'core:cancel', event => this.props.onCancel()));

    (0, (_nullthrows || _load_nullthrows()).default)(this._password).focus();

    const raiseNativeNotification = (0, (_AtomNotifications || _load_AtomNotifications()).getNotificationService)();
    if (raiseNativeNotification != null) {
      const pendingNotification = raiseNativeNotification('Nuclide Remote Connection', 'Nuclide requires additional action to authenticate your remote connection', 2000, false);
      if (pendingNotification != null) {
        this._disposables.add(pendingNotification);
      }
    }
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  focus() {
    (0, (_nullthrows || _load_nullthrows()).default)(this._password).focus();
  }

  getPassword() {
    return (0, (_nullthrows || _load_nullthrows()).default)(this._password).value;
  }

  render() {
    // * Need native-key-bindings so that delete works and we need `_onKeyUp` so that escape and
    //   enter work
    // * `instructions` are pre-formatted, so apply `whiteSpace: pre` to maintain formatting coming
    //   from the server.
    return _react.createElement(
      'div',
      {
        ref: el => {
          this._root = el;
        } },
      _react.createElement(
        'div',
        { className: 'block', style: { whiteSpace: 'pre' } },
        this.props.instructions
      ),
      _react.createElement('input', {
        tabIndex: '0',
        type: 'password',
        className: 'nuclide-password native-key-bindings',
        ref: el => {
          this._password = el;
        },
        onKeyPress: this._onKeyUp
      })
    );
  }
}
exports.default = AuthenticationPrompt;