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

// Globally unique ID used as the "name" attribute to group radio inputs.
var uid = 0;

/**
 * A managed radio group component. Accepts arbitrary react elements as labels.
 */
var NuclideRadioGroup = React.createClass({

  propTypes: {
    optionLabels: PropTypes.arrayOf(PropTypes.node).isRequired,
    selectedIndex: React.PropTypes.number.isRequired,
    onSelectedChange: React.PropTypes.func.isRequired,
  },

  getDefaultProps(): any {
    return {
      optionLabels: [],
      onSelectedChange: () => {},
      selectedIndex: 0,
    };
  },

  getInitialState(): any {
    return {
      uid: uid++,
    };
  },

  render: function(): ReactElement {
    var checkboxes = this.props.optionLabels.map((labelContent, i) => {
      var id = 'nuclide-radiogroup-' + uid + '-' + i;
      return (
        <div key={i}>
          <input
            type="radio"
            checked={i === this.props.selectedIndex}
            name={'radiogroup-' + this.state.uid}
            id={id}
            onChange={this.props.onSelectedChange.bind(this, i)}
          />
          <label
            className="nuclide-ui-radiogroup-label"
            htmlFor={id}>
            {labelContent}
          </label>
        </div>
      );
    });
    return (
      <div>
        {checkboxes}
      </div>
    );
  }
});

module.exports = NuclideRadioGroup;
