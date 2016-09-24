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
import type {Callstack} from './types';
import type DebuggerActions from './DebuggerActions';

import nuclideUri from '../../commons-node/nuclideUri';
import {Listview} from '../../nuclide-ui/ListView';
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

  _handleCallframeClick(callFrameIndex: number, event: SyntheticMouseEvent): void {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
  }

  render(): ?React.Element<any> {
    const {callstack} = this.props;
    const renderedCallstack = callstack == null
      ? '(callstack unavailable)'
      : callstack.map((callstackItem, i) => {
        const {
          name,
          location,
        } = callstackItem;
        const path = nuclideUri.basename(location.path);
        return (
          <div className="nuclide-debugger-callstack-item" key={i}>
            <div className="nuclide-debugger-callstack-name">
              {name}
            </div>
            <div>
              {path}:{location.line + 1}
            </div>
          </div>
        );
      });
    return (
      <Listview
        alternateBackground={true}
        selectable={true}
        onSelect={this._handleCallframeClick}>
        {renderedCallstack}
      </Listview>
    );
  }
}
