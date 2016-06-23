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
import type {Callstack} from './CallstackStore';
import type DebuggerActions from './DebuggerActions';

import nuclideUri from '../../nuclide-remote-uri';

type DebuggerCallstackComponentProps = {
  actions: DebuggerActions;
  callstack: ?Callstack;
};

export class DebuggerCallstackComponent extends React.Component {
  props: DebuggerCallstackComponentProps;

  constructor(props: DebuggerCallstackComponentProps) {
    super(props);
  }

  _handleCallframeClick(
    sourceURL: string,
    lineNumber: number,
    event: SyntheticMouseEvent,
  ): void {
    const options = {
      sourceURL,
      lineNumber,
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
          <div
            className="nuclide-debugger-atom-callstack-item"
            onClick={this._handleCallframeClick.bind(this, location.path, location.line)}
            key={i}>
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
      <div>
        {renderedCallstack}
      </div>
    );
  }
}
