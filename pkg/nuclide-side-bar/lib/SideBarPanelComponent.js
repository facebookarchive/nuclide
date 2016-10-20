'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Tab} from '../../nuclide-ui/Tabs';

import {React, ReactDOM} from 'react-for-atom';
import Tabs from '../../nuclide-ui/Tabs';

type Props = {
  children?: React.Element<any>,
  menuItems: Array<{label: string, value: string}>,
  onSelectedViewMenuItemChange: (value: ?string) => void,
  selectedViewMenuItemValue: ?string,
};

export default class SideBarPanelComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleTabChange = this._handleTabChange.bind(this);
  }

  focus(): void {
    ReactDOM.findDOMNode(this.refs.child).focus();
  }

  _handleTabChange(newTab: Tab): void {
    const value = newTab.name;
    this.props.onSelectedViewMenuItemChange(value);
  }

  render(): React.Element<any> {
    const {
      menuItems,
      selectedViewMenuItemValue,
    } = this.props;
    const tabs = menuItems.map(menuItem => ({
      name: menuItem.value,
      tabContent: <span>{menuItem.label}</span>,
    }));
    const activeTabName = selectedViewMenuItemValue;
    return (
      <div className="nuclide-side-bar-tab-container" tabIndex={0}>
        <Tabs
          activeTabName={activeTabName}
          tabs={tabs}
          onActiveTabChange={this._handleTabChange}
        />
        {React.cloneElement(React.Children.only(this.props.children), {ref: 'child'})}
      </div>
    );
  }
}
