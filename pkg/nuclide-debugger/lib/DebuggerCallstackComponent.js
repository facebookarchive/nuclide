/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import classnames from 'classnames';
import React from 'react';
import type {
  Callstack,
  CallstackItem,
} from './types';
import type DebuggerActions from './DebuggerActions';
import type CallstackStore from './CallstackStore';

import nuclideUri from '../../commons-node/nuclideUri';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {
  ListView,
  ListViewItem,
} from '../../nuclide-ui/ListView';
import Bridge from './Bridge';

type DebuggerCallstackComponentProps = {
  actions: DebuggerActions,
  bridge: Bridge,
  callstackStore: CallstackStore,
};

type DebuggerCallstackComponentState = {
  callstack: ?Callstack,
  selectedCallFrameIndex: number,
};

export class DebuggerCallstackComponent extends React.Component {
  props: DebuggerCallstackComponentProps;
  state: DebuggerCallstackComponentState;
  _disposables: UniversalDisposable;

  constructor(props: DebuggerCallstackComponentProps) {
    super(props);
    (this: any)._handleCallframeClick = this._handleCallframeClick.bind(this);
    this._disposables = new UniversalDisposable();
    this.state = {
      callstack: props.callstackStore.getCallstack(),
      selectedCallFrameIndex: props.callstackStore.getSelectedCallFrameIndex(),
    };
  }

  componentDidMount(): void {
    const {callstackStore} = this.props;
    this._disposables.add(
      callstackStore.onChange(() => {
        this.setState({
          selectedCallFrameIndex: callstackStore.getSelectedCallFrameIndex(),
          callstack: callstackStore.getCallstack(),
        });
      }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _handleCallframeClick(
    callFrameIndex: number,
    clickedCallframe: ?CallstackItem,
  ): void {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
    this.props.actions.setSelectedCallFrameIndex(callFrameIndex);
  }

  render(): ?React.Element<any> {
    const {callstack} = this.state;
    const items = callstack == null
      ? []
      : callstack.map((callstackItem, i) => {
        const {
          name,
          location,
        } = callstackItem;
        // Callstack paths may have a format like file://foo/bar, or
        // lldb://asm/0x1234. These are not valid paths that can be used to
        // construct a nuclideUri so we need to skip the protocol prefix.
        const path = nuclideUri.basename(location.path.replace(/^[a-zA-Z]+:\/\//, ''));
        const content = (
          <div className="nuclide-debugger-callstack-item" key={i}>
            <span className="nuclide-debugger-callstack-name">
              {name}
            </span>
            <span>
              {path}:{location.line + 1}
            </span>
          </div>
        );
        const itemClassNames = classnames(
          {
            'nuclide-debugger-callstack-item-selected':
              this.state.selectedCallFrameIndex === i,
          },
        );
        return <ListViewItem
                  key={i}
                  className={itemClassNames}
                  value={callstackItem}>
                  {content}
                </ListViewItem>;
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
