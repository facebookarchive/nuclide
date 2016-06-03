'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Dropdown} from '../../nuclide-ui/lib/Dropdown';
import {React, ReactDOM} from 'react-for-atom';
import {Toolbar} from '../../nuclide-ui/lib/Toolbar';
import {ToolbarLeft} from '../../nuclide-ui/lib/ToolbarLeft';

export default class SideBarPanelComponent extends React.Component {
  props: {
    children?: React.Element;
    menuItems: Array<{label: string; value: string}>;
    onSelectedViewMenuItemChange: (value: ?string) => void;
    selectedViewMenuItemValue: ?string;
  };

  focus() {
    ReactDOM.findDOMNode(this.refs.child).focus();
  }

  render() {
    let toolbar;
    if (this.props.menuItems.length > 1) {
      toolbar = (
        <Toolbar location="top">
          <ToolbarLeft>
            <Dropdown
              isFlat={true}
              options={this.props.menuItems}
              onChange={this.props.onSelectedViewMenuItemChange}
              value={this.props.selectedViewMenuItemValue}
            />
          </ToolbarLeft>
        </Toolbar>
      );
    }

    return (
      <div style={{display: 'flex', flex: 1, flexDirection: 'column'}} tabIndex={0}>
        {toolbar}
        {React.cloneElement(React.Children.only(this.props.children), {ref: 'child'})}
      </div>
    );
  }

}
