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

type DebuggerCallstackComponentProps = {
  callstack: Callstack;
};

export class DebuggerCallstackComponent extends React.Component {
  props: DebuggerCallstackComponentProps;

  constructor(props: DebuggerCallstackComponentProps) {
    super(props);
  }

  render(): ?React.Element<any> {
    const {callstack} = this.props;
    const renderedCallstack = callstack.map((callstackItem, i) => {
      const {
        name,
        location,
      } = callstackItem;
      return (
        <div className="nuclide-debugger-atom-callstack-item" key={i}>
          <div className="nuclide-debugger-atom-callstack-name">
            {name}
          </div>
          <div>
            {location.path}:{location.line}
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
