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

import invariant from 'assert';
import nuclideUri from '../../nuclide-remote-uri';
import {Listview} from '../../nuclide-ui/lib/ListView';

type DebuggerCallstackComponentProps = {
  actions: DebuggerActions,
  callstack: ?Callstack,
};

export class DebuggerCallstackComponent extends React.Component {
  props: DebuggerCallstackComponentProps;

  constructor(props: DebuggerCallstackComponentProps) {
    super(props);
    (this: any)._handleCallframeClick = this._handleCallframeClick.bind(this);
  }

  _handleCallframeClick(callFrameIndex: number, event: SyntheticMouseEvent): void {
    invariant(this.props.callstack != null);
    const {location} = this.props.callstack[callFrameIndex];
    const options = {
      sourceURL: location.path,
      lineNumber: location.line,
    };
    this.props.actions.setSelectedCallFrameline(options);
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
          <div className="nuclide-debugger-atom-callstack-item" key={i}>
            <div className="nuclide-debugger-atom-callstack-name">
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
