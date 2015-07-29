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
var emptyfunction = require('emptyfunction');

var {PropTypes} = React;

var NuclideDropdown = React.createClass({

  propTypes: {
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    menuItems: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.any,
    })).isRequired,
    initialSelectedIndex: PropTypes.number,
    /**
     * A function that gets called with the new selected value on change.
     */
    onSelectedChange: PropTypes.func.isRequired,
    /**
     * Size of dropdown. Sizes match .btn classes in Atom's style guide. Default is medium (which
     * does not have an associated 'size' string).
     */
    size: PropTypes.oneOf(['xs', 'sm', 'lg']),
    title: PropTypes.string.isRequired,
  },

  getDefaultProps(): any {
    return {
      className: '',
      disabled: false,
      initialSelectedIndex: 0,
      menuItems: [],
      onSelectedChange: emptyfunction,
      title: '',
    };
  },

  getInitialState(): any {
    return {
      selectedIndex: this.props.initialSelectedIndex,
    };
  },

  render(): ReactElement {
    var options = this.props.menuItems.map(item =>
      <option key={item.value} value={item.value}>{item.label}</option>
    );
    var selectClassName = 'btn nuclide-dropdown';
    if (this.props.size) {
      selectClassName = `${selectClassName} btn-${this.props.size}`;
    }
    return (
      <div className={'nuclide-dropdown-container ' + this.props.className}>
        <select
          className={selectClassName}
          disabled={this.props.disabled}
          onChange={this._onChange}
          title={this.props.title}
          value={this.getSelectedValue()}>
          {options}
        </select>
        <i className="icon icon-triangle-down" />
      </div>
    );
  },

  _onChange(event: SyntheticMouseEvent) {
    var selectedIndex = event.target.selectedIndex;
    this.setState({selectedIndex});
    this.props.onSelectedChange(this._getValue(selectedIndex));
  },

  _getValue(index: number): ?any {
    if (this.props.menuItems[index] === undefined) {
      return null;
    }
    return this.props.menuItems[index].value;
  },

  getSelectedValue(): ?any {
    return this._getValue(this.state.selectedIndex);
  },
});

module.exports = NuclideDropdown;
