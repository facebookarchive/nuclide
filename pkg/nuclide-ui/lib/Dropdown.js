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

type DefaultProps = {
  className: string;
  disabled: boolean;
  isFlat: boolean;
  onChange: (value: any) => void;
  options: Array<{label: React.Children; value: any}>;
  value: any;
  title: string;
};

type Props = {
  className: string;
  disabled: boolean;
  isFlat: boolean;
  options: Array<{label: React.Children; value: any}>;
  value: any;
  /**
   * A function that gets called with the new value on change.
   */
  onChange: (value: any) => void;
  /**
   * Size of dropdown. Sizes match .btn classes in Atom's style guide. Default is medium (which
   * does not have an associated 'size' string).
   */
  size?: 'xs' | 'sm' | 'lg';
  title: string;
};

export class Dropdown extends React.Component {
  props: Props;

  static defaultProps: DefaultProps = {
    className: '',
    disabled: false,
    isFlat: false,
    onChange(value: any) {},
    options: [],
    value: null,
    title: '',
  };

  constructor(props: Props) {
    super(props);
    (this: any)._handleChange = this._handleChange.bind(this);
  }

  _handleChange(event: SyntheticMouseEvent): void {
    const selectedIndex = (event.currentTarget: any).selectedIndex;
    const option = this.props.options[selectedIndex];
    this.props.onChange(option == null ? null : option.value);
  }

  render(): React.Element<any> {
    const options = this.props.options.map((item, index) =>
      // Use indexes for values. This allows us to have non-string values in our options object.
      <option key={index} value={index}>{item.label}</option>
    );
    const selectClassName = classnames('nuclide-dropdown', {
      'btn': !this.props.isFlat,
      [`btn-${this.props.size}`]: !this.props.isFlat && this.props.size != null,
      'nuclide-dropdown-flat': this.props.isFlat,
    });

    const selectedIndex = this.props.options.findIndex(option => option.value === this.props.value);

    return (
      <div className={'nuclide-dropdown-container ' + this.props.className}>
        <select
          className={selectClassName}
          disabled={this.props.disabled}
          onChange={this._handleChange}
          title={this.props.title}
          value={selectedIndex === -1 ? '' : selectedIndex}>
          {options}
        </select>
        <i className="icon icon-triangle-down text-center" />
      </div>
    );
  }
}
