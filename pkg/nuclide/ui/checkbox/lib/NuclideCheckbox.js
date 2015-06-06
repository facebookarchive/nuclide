'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

var {PropTypes} = React;

/**
 * A checkbox component with an input checkbox and a label.
 */
var NuclideCheckbox = React.createClass({

  propTypes: {
    labelText: PropTypes.string,
    checked: PropTypes.bool,
  },

  getDefaultProps(): any {
    return {
      labelText: '',
      checked: false,
    };
  },

  getInitialState(): any {
    return {
      checked: this.props.checked,
    };
  },

  render(): ReactElement {
    return (
      <div className='nuclide-ui-checkbox'>
        <input
          type='checkbox'
          checked={this.isChecked()}
          onChange={this._onChange}
        />
        <label onClick={this._onChange}>
          {this.props.labelText}
        </label>
      </div>
    );
  },

  _onChange() {
    this.setState({
      checked: !this.state.checked,
    });
  },

  isChecked(): boolean {
    return this.state.checked;
  },

});

module.exports = NuclideCheckbox;
