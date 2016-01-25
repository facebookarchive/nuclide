'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AtomInput from '../../ui/atom-input';
import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';

import pathModule from 'path';

const {PropTypes} = React;

/**
 * Component that displays UI to create a new file.
 */
class FileDialogComponent extends React.Component {
  _subscriptions: CompositeDisposable;
  _isClosed: boolean;

  static propTypes = {
    iconClassName: PropTypes.string,
    initialValue: PropTypes.string,
    // Message is displayed above the input.
    message: PropTypes.element.isRequired,
    // Will be called (before `onClose`) if the user confirms.
    onConfirm: PropTypes.func.isRequired,
    // Will be called regardless of whether the user confirms.
    onClose: PropTypes.func.isRequired,
    // Whether or not to initially select the base name of the path.
    // This is useful for renaming files.
    selectBasename: PropTypes.bool,
  };

  constructor() {
    super(...arguments);
    this._isClosed = false;
    this._subscriptions = new CompositeDisposable();
    this._close = this._close.bind(this);
    this._confirm = this._confirm.bind(this);
  }

  componentDidMount(): void {
    const input = this.refs.input;
    this._subscriptions.add(atom.commands.add(
      React.findDOMNode(input),
      {
        'core:confirm': this._confirm,
        'core:cancel': this._close,
      }
    ));
    const path = this.props.initialValue;
    input.focus();
    if (this.props.selectBasename) {
      const {dir, name} = pathModule.parse(path);
      const selectionStart = dir ? dir.length + 1 : 0;
      const selectionEnd = selectionStart + name.length;
      input.getTextEditor().setSelectedBufferRange([[0, selectionStart], [0, selectionEnd]]);
    }
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }

  render(): ReactElement {
    let labelClassName;
    if (this.props.iconClassName != null) {
      labelClassName = `icon ${this.props.iconClassName}`;
    }

    // `.tree-view-dialog` is unstyled but is added by Atom's tree-view package[1] and is styled by
    // 3rd-party themes. Add it to make this package's modals styleable the same as Atom's
    // tree-view.
    //
    // [1] https://github.com/atom/tree-view/blob/v0.200.0/lib/dialog.coffee#L7
    return (
      <atom-panel class="modal overlay from-top">
        <div className="tree-view-dialog">
          <label className={labelClassName}>{this.props.message}</label>
          <AtomInput
            initialValue={this.props.initialValue}
            onBlur={this._close}
            ref="input"
          />
        </div>
      </atom-panel>
    );
  }

  _confirm() {
    this.props.onConfirm(this.refs.input.getText());
    this._close();
  }

  _close() {
    if (!this._isClosed) {
      this._isClosed = true;
      this.props.onClose();
    }
  }
}

module.exports = FileDialogComponent;
