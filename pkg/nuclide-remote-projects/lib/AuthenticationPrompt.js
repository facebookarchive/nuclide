'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

/** Component to prompt the user for authentication information. */
let AuthenticationPrompt = class AuthenticationPrompt extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._disposables = new _atom.CompositeDisposable();
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  componentDidMount() {
    // Hitting enter when this panel has focus should confirm the dialog.
    this._disposables.add(atom.commands.add(this.refs.root, 'core:confirm', event => this.props.onConfirm()));

    // Hitting escape should cancel the dialog.
    this._disposables.add(atom.commands.add('atom-workspace', 'core:cancel', event => this.props.onCancel()));

    this.refs.password.focus();
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  focus() {
    this.refs.password.focus();
  }

  getPassword() {
    return this.refs.password.value;
  }

  _onKeyUp(e) {
    if (e.key === 'Enter') {
      this.props.onConfirm();
    }

    if (e.key === 'Escape') {
      this.props.onCancel();
    }
  }

  render() {
    // * Need native-key-bindings so that delete works and we need `_onKeyUp` so that escape and
    //   enter work
    // * `instructions` are pre-formatted, so apply `whiteSpace: pre` to maintain formatting coming
    //   from the server.
    return _reactForAtom.React.createElement(
      'div',
      { ref: 'root' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'block', style: { whiteSpace: 'pre' } },
        this.props.instructions
      ),
      _reactForAtom.React.createElement('input', {
        tabIndex: '0',
        type: 'password',
        className: 'nuclide-password native-key-bindings',
        ref: 'password',
        onKeyPress: this._onKeyUp
      })
    );
  }
};
exports.default = AuthenticationPrompt;
module.exports = exports['default'];