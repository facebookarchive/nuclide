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

type Props = {
  className: string;
  disabled: boolean;
  isFlat: boolean;
  menuItems: Array<{label: React.Children; value: mixed}>;
  selectedIndex: number;
  /**
   * A function that gets called with the new selected index on change.
   */
  onSelectedChange: (newIndex: number) => void;
  /**
   * Size of dropdown. Sizes match .btn classes in Atom's style guide. Default is medium (which
   * does not have an associated 'size' string).
   */
  size?: 'xs' | 'sm' | 'lg';
  title: string;
};

export class Dropdown extends React.Component {
  props: Props;

  static defaultProps = {
    className: '',
    disabled: false,
    isFlat: false,
    menuItems: [],
    onSelectedChange: (newIndex: number) => {},
    selectedIndex: 0,
    title: '',
  };

  constructor(props: Props) {
    super(props);
    (this: any)._onChange = this._onChange.bind(this);
  }

  _onChange(event: SyntheticMouseEvent): void {
    if (event.target.selectedIndex != null) {
      const selectedIndex = event.target.selectedIndex;
      this.props.onSelectedChange(selectedIndex);
    }
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
}
