'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const React = require('react-for-atom');
const emptyfunction = require('emptyfunction');

const {PropTypes} = React;

class NuclideDropdown extends React.Component {

  static propTypes = {
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    menuItems: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.any,
    })).isRequired,
    selectedIndex: PropTypes.number.isRequired,
    /**
     * A function that gets called with the new selected index on change.
     */
    onSelectedChange: PropTypes.func.isRequired,
    /**
     * Size of dropdown. Sizes match .btn classes in Atom's style guide. Default is medium (which
     * does not have an associated 'size' string).
     */
    size: PropTypes.oneOf(['xs', 'sm', 'lg']),
    title: PropTypes.string.isRequired,
  };

  static defaultProps = {
    className: '',
    disabled: false,
    selectedIndex: 0,
    menuItems: [],
    onSelectedChange: emptyfunction,
    title: '',
  };

  constructor(props: Object) {
    super(props);
    this._onChange = this._onChange.bind(this);
  }

  render(): ReactElement {
    const options = this.props.menuItems.map(item =>
      <option key={item.value} value={item.value}>{item.label}</option>
    );
    let selectClassName = 'btn nuclide-dropdown';
    if (this.props.size) {
      selectClassName = `${selectClassName} btn-${this.props.size}`;
    }
    const selectedItem = this.props.menuItems[this.props.selectedIndex];
    const selectedValue = selectedItem && selectedItem.value;
    return (
      <div className={'nuclide-dropdown-container ' + this.props.className}>
        <select
          className={selectClassName}
          disabled={this.props.disabled}
          onChange={this._onChange}
          title={this.props.title}
          value={selectedValue}>
          {options}
        </select>
        <i className="icon icon-triangle-down" />
      </div>
    );
  }

  _onChange(event: SyntheticMouseEvent): void {
    if (event.target.hasOwnProperty('selectedIndex')) {
      // $FlowIssue: We just checked hasOwnProperty!
      const selectedIndex = event.target.selectedIndex;
      this.props.onSelectedChange(selectedIndex);
    }
  }
}

module.exports = NuclideDropdown;
