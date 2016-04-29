'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import classnames from 'classnames';
import {React} from 'react-for-atom';

const {PropTypes} = React;

export class Dropdown extends React.Component {

  static propTypes = {
    className: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    isFlat: PropTypes.bool.isRequired,
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
    onSelectedChange: (newIndex: number) => {},
    title: '',
  };

  constructor(props: Object) {
    super(props);
    (this: any)._onChange = this._onChange.bind(this);
  }

  render(): React.Element {
    const options = this.props.menuItems.map(item =>
      <option key={item.value} value={item.value}>{item.label}</option>
    );
    const selectClassName = classnames('nuclide-dropdown', {
      'btn': !this.props.isFlat,
      [`btn-${this.props.size}`]: !this.props.isFlat && this.props.size != null,
      'nuclide-dropdown-flat': this.props.isFlat,
    });

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
        <i className="icon icon-triangle-down text-center" />
      </div>
    );
  }

  _onChange(event: SyntheticMouseEvent): void {
    if (event.target.selectedIndex != null) {
      const selectedIndex = event.target.selectedIndex;
      this.props.onSelectedChange(selectedIndex);
    }
  }
}
