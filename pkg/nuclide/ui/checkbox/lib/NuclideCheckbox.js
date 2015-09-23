'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react-for-atom';

/**
 * A checkbox component with an input checkbox and a label.
 */
class NuclideCheckbox extends React.Component {
  constructor(props: Object) {
    super(props);
    this._onChange = this._onChange.bind(this);
  }

  render(): ReactElement {
    return (
      <label className="nuclide-ui-checkbox-label">
        <input
          type="checkbox"
          checked={this.props.checked}
          onChange={this._onChange}
        />
        {this.props.children}
      </label>
    );
  }

  _onChange(event: SyntheticEvent) {
    var isChecked = ((event.target: any): HTMLInputElement).checked;
    this.props.onChange.call(null, isChecked);
  }
}

var {PropTypes} = React;

NuclideCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  children: PropTypes.node,
  onChange: PropTypes.func.isRequired,
};

module.exports = NuclideCheckbox;
