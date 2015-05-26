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
var path = require('path');
var React = require('react-for-atom');

var {PropTypes} = React;

/**
 * Component that displays UI to create a new file.
 */
var FileDialogComponent = React.createClass({
  propTypes: {
    rootDirectory: PropTypes.object.isRequired,
    // The File or Directory to prepopulate the input with.
    initialEntry: PropTypes.object.isRequired,
    // Label for the message above the input. Will be displayed to the user.
    message: PropTypes.element.isRequired,
    // Will be called if the user confirms the 'add' action. Will be called before `onClose`.
    onConfirm: PropTypes.func.isRequired,
    // Will be called regardless of whether the user confirms.
    onClose: PropTypes.func.isRequired,
    // Whether or not to initially select the base name of the path.
    // This is useful for renaming files.
    shouldSelectBasename: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      shouldSelectBasename: false,
    };
  },

  componentDidMount() {
    this._isClosed = false;

    this._subscriptions = new CompositeDisposable();

    var component = this.refs['entryPath'];
    var element = component.getDOMNode();
    this._subscriptions.add(atom.commands.add(
        element,
        {
          'core:confirm': this.confirm,
          'core:cancel': this.close,
        }));

    var entryPath = this.props.rootDirectory.relativize(this.props.initialEntry.getPath());
    if (entryPath !== '' && this.props.initialEntry.isDirectory()) {
      entryPath = path.normalize(entryPath + '/');
    }

    component.focus();

    var editor = component.getTextEditor();
    component.setText(entryPath);
    if (this.props.shouldSelectBasename) {
      var {base, name, dir} = path.parse(entryPath);
      var selectionStart = dir ? dir.length + 1 : 0;
      var selectionEnd = selectionStart + name.length;
      editor.setSelectedBufferRange([[0, selectionStart], [0, selectionEnd]]);
    }
  },

  componentWillUnmount() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  },

  render() {
    // The root element cannot have a 'key' property, so we use a dummy
    // <div> as the root. Ideally, the <atom-panel> would be the root.
    return (
      <div>
        <atom-panel className='modal from-top' key='add-dialog'>
          <label>{this.props.message}</label>
          <AtomInput ref='entryPath' onBlur={this.close} />
        </atom-panel>
      </div>
    );
  },

  confirm() {
    this.props.onConfirm(this.props.rootDirectory, this.refs['entryPath'].getText());
    this.close();
  },

  close() {
    if (!this._isClosed) {
      this._isClosed = true;
      this.props.onClose();
    }
  },
});

module.exports = FileDialogComponent;
