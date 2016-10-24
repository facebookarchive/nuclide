'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  React,
} from 'react-for-atom';
import type {
  Callstack,
  CallstackItem,
} from './types';
import type DebuggerActions from './DebuggerActions';

import nuclideUri from '../../commons-node/nuclideUri';
import {
  ListView,
  ListViewItem,
} from '../../nuclide-ui/ListView';
import Bridge from './Bridge';

type DebuggerCallstackComponentProps = {
  actions: DebuggerActions,
  callstack: ?Callstack,
  bridge: Bridge,
};

export class DebuggerCallstackComponent extends React.Component {
  props: DebuggerCallstackComponentProps;

  constructor(props: DebuggerCallstackComponentProps) {
    super(props);
    (this: any)._handleCallframeClick = this._handleCallframeClick.bind(this);
  }

  _handleCallframeClick(
    callFrameIndex: number,
    clickedCallframe: ?CallstackItem,
  ): void {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
  }

  render(): ?React.Element<any> {
    const {callstack} = this.props;
    const items = callstack == null
      ? []
      : callstack.map((callstackItem, i) => {
        const {
          name,
          location,
        } = callstackItem;
        const path = nuclideUri.basename(location.path);
        const content = (
          <div className="nuclide-debugger-callstack-item" key={i}>
            <div className="nuclide-debugger-callstack-name">
              {name}
            </div>
            <div>
              {path}:{location.line + 1}
            </div>
          </div>
        );
        return <ListViewItem key={i} value={callstackItem}>{content}</ListViewItem>;
      });
    return callstack == null
      ? <span>(callstack unavailable)</span>
      : <ListView
          alternateBackground={true}
          selectable={true}
          onSelect={this._handleCallframeClick}>
          {items}
        </ListView>;
  }
}
