'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {IconButtonOption} from '../types';

import {React} from 'react-for-atom';
import remote from 'remote';

const Menu = remote.require('menu');
const MenuItem = remote.require('menu-item');

type Props = {
  value: ?string;
  icon: ?ReactClass<any>;
  options: Array<IconButtonOption>;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export class BuildSystemButton extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleClick = this._handleClick.bind(this);
  }

  _handleClick(event: MouseEvent): void {
    const currentWindow = remote.getCurrentWindow();
    const menu = new Menu();
    this.props.options.forEach(option => {
      menu.append(new MenuItem({
        type: 'checkbox',
        checked: this.props.value === option.value,
        label: option.label,
        click: () => {
          this.props.onChange(option.value);
        },
      }));
    });
    menu.popup(currentWindow, event.clientX, event.clientY);
  }

  render(): ?React.Element<any> {
    const {icon: Icon} = this.props;
    // Render the button, making sure that the icon is centered.
    return (
      <button
        className="btn nuclide-build-system-button inline-block"
        style={{display: 'flex', alignSelf: 'stretch'}}
        disabled={this.props.disabled === true}
        onClick={this._handleClick}>
        <div
          className="nuclide-build-system-button-icon-wrapper"
          style={{display: 'flex'}}>
          {Icon ? <Icon /> : null}
        </div>
        <div className="icon icon-triangle-down nuclide-build-system-button-arrow" />
      </button>
    );
  }

}
