'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomInput = require('nuclide-ui-atom-input');
var {CompositeDisposable} = require('atom');
var React = require('react-for-atom');

var pathModule = require('path');

var {PropTypes} = React;

/**
 * Component that displays UI to create a new file.
 */
class FileDialogComponent extends React.Component {
  _subscriptions: CompositeDisposable;
  _isClosed: boolean;

  constructor() {
    super(...arguments);
    this._isClosed = false;
    this._subscriptions = new CompositeDisposable();
    this._close = this._close.bind(this);
    this._confirm = this._confirm.bind(this);
  }

  componentDidMount(): void {
    var input = this.refs.input;
    this._subscriptions.add(atom.commands.add(
      React.findDOMNode(input),
      {
        'core:confirm': this._confirm,
        'core:cancel': this._close,
      }
    ));
    var path = this.props.initialValue;
    input.focus();
    if (this.props.selectBasename) {
      var {name, dir} = pathModule.parse(path);
      var selectionStart = dir ? dir.length + 1 : 0;
      var selectionEnd = selectionStart + name.length;
      input.getTextEditor().setSelectedBufferRange([[0, selectionStart], [0, selectionEnd]]);
    }
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }

  render(): ReactElement {
    var labelClassName;
    if (this.props.iconClassName != null) {
      labelClassName = `icon ${this.props.iconClassName}`;
    }

    return (
      <atom-panel className="modal from-top" key="add-dialog">
        <label className={labelClassName}>{this.props.message}</label>
        <AtomInput ref="input" onBlur={this._close} />
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

FileDialogComponent.propTypes = {
  iconClassName: PropTypes.string,
  initialValue: PropTypes.string.isRequired,
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

module.exports = FileDialogComponent;
