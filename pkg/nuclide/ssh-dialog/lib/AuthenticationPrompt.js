'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import React from 'react-for-atom';

type DefaultProps = {};
type Props = {
  instructions: string;
  onConfirm: () => mixed;
  onCancel: () => mixed;
};
type State = {};

/** Component to prompt the user for authentication information. */
/* eslint-disable react/prop-types */
export default class AuthenticationPrompt extends React.Component<DefaultProps, Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    // Instructions may contain newlines that need to be converted to <br> tags.
    const safeHtml = this.props.instructions
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/\\n/g, '<br>');


    // We need native-key-bindings so that delete works and we need
    // _onKeyUp so that escape and enter work
    return (
      <div ref="root" className="password-prompt-container">
        <div
          className="block"
          style={{whiteSpace: 'pre'}}
          dangerouslySetInnerHTML={{__html: safeHtml}}
        />

        <input
          type="password"
          className="nuclide-password native-key-bindings"
          ref="password"
          onKeyUp={this._onKeyUp.bind(this)}
        />
      </div>
    );
  }

  _onKeyUp(e) {
    if (e.key === 'Enter') {
      this.props.onConfirm();
    }

    if (e.key === 'Escape') {
      this.props.onCancel();
    }
  }

  componentDidMount() {
    this._disposables = new CompositeDisposable();
    const root = React.findDOMNode(this.refs['root']);

    // Hitting enter when this panel has focus should confirm the dialog.
    this._disposables.add(atom.commands.add(
        root,
        'core:confirm',
        (event) => this.props.onConfirm()));

    // Hitting escape when this panel has focus should cancel the dialog.
    this._disposables.add(atom.commands.add(
        root,
        'core:cancel',
        (event) => this.props.onCancel()));

    React.findDOMNode(this.refs.password).focus();
  }

  componentWillUnmount() {
    if (this._disposables) {
      this._disposables.dispose();
      this._disposables = null;
    }
  }

  getPassword() {
    return React.findDOMNode(this.refs.password).value;
  }
}
/* eslint-enable react/prop-types */
