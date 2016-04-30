'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

// Globally unique ID used as the "name" attribute to group radio inputs.
let uid = 0;

/**
 * A managed radio group component. Accepts arbitrary React elements as labels.
 */
export const RadioGroup = React.createClass({

  propTypes: {
    optionLabels: React.PropTypes.arrayOf(React.PropTypes.node).isRequired,
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

  render: function(): React.Element {
    const checkboxes = this.props.optionLabels.map((labelContent, i) => {
      const id = 'nuclide-radiogroup-' + uid + '-' + i;
      return (
        <div key={i}>
          <input
            type="radio"
            checked={i === this.props.selectedIndex}
            name={'radiogroup-' + this.state.uid}
            id={id}
            onChange={this.props.onSelectedChange.bind(null, i)}
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
  },
});
