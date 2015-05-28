'use babel';
/* flow */
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
var React = require('react-for-atom');
var {PropTypes} = React;

var DiffViewComponent = React.createClass({
  propTypes: {
    model: PropTypes.object.isRequired,
  },

  async componentDidMount(): Promise<void> {
    this._subscriptions = new CompositeDisposable();
    var {oldText, newText} = await this.props.model.getDiffState();
    // TODO(most): Initialize the diff editors with the model state and setup marker updates.
  },

  componentWillUnmount(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  },

  render(): ReactElement {
    return (
      <div className='diff-view-component'>
        <div className='split-pane'>
          <p>Old File</p>
          <atom-text-editor ref='old' style={{height: '100%'}} />
        </div>
        <div className='split-pane'>
          <p>New File</p>
          <atom-text-editor ref='new' style={{height: '100%'}} />
        </div>
      </div>
    );
  },

  _getOldTextEditorElement(): TextEditorElement {
    return this.refs['old'].getDOMNode();
  },

  _getNewTextEditorElement(): TextEditorElement {
    return this.refs['new'].getDOMNode();
  },

});

module.exports = DiffViewComponent;
