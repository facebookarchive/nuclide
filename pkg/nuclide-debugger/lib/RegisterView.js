/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {RegisterInfo} from './types';

import * as React from 'react';
import CallstackStore from './CallstackStore';
import DebuggerModel from './DebuggerModel';
import {Table} from 'nuclide-commons-ui/Table';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

type Props = {
  model: DebuggerModel,
};

type State = {
  registerInfo: ?RegisterInfo,
};

export class RegisterView extends React.Component<Props, State> {
  _state: State;
  _callstackStore: CallstackStore;
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);

    (this: any)._callStackUpdated = this._callStackUpdated.bind(this);

    this._disposables = new UniversalDisposable();
    this._callstackStore = this.props.model.getCallstackStore();
    this.state = {
      registerInfo: null,
    };
  }

  componentDidMount(): void {
    this._disposables.add(
      this._callstackStore.onChange(() => {
        this._callStackUpdated();
      }),
    );

    this._callStackUpdated();
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _callStackUpdated(): void {
    const callstack = this._callstackStore.getCallstack();
    if (callstack == null || callstack.length === 0) {
      this.setState({
        registerInfo: null,
      });
    } else {
      const selectedFrame = this._callstackStore.getSelectedCallFrameIndex();
      const selectedFrameInfo = callstack[selectedFrame];
      this.setState({
        registerInfo:
          selectedFrameInfo != null ? selectedFrameInfo.registers : null,
      });
    }
  }

  render(): React.Element<any> {
    const {registerInfo} = this.state;

    if (registerInfo == null) {
      return (
        <div className="nuclide-debugger-registers-empty">
          No register info available.
        </div>
      );
    }

    const columns = [
      {
        title: 'Register',
        key: 'register',
        width: 0.25,
      },
      {
        title: 'Value',
        key: 'value',
        width: 0.75,
      },
    ];

    const emptyComponent = () => (
      <div className="nuclide-debugger-registers-empty">
        registers unavailable.
      </div>
    );

    const groups = registerInfo.map(group => {
      const rows = group.registers
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(register => {
          return {
            data: {
              register: register.name,
              value: register.value,
            },
          };
        });

      return (
        <div
          className="nuclide-debugger-registers-view"
          key={`registerGroup_${group.groupName}`}>
          <div className="nuclide-debugger-registers-group">
            {group.groupName}
          </div>
          <Table
            columns={columns}
            emptyComponent={emptyComponent}
            rows={rows}
            selectable={false}
            resizable={true}
            sortable={false}
          />
        </div>
      );
    });

    return (
      <div className="nuclide-debugger-container-new">
        <div className="nuclide-debugger-pane-content">{groups}</div>
      </div>
    );
  }
}
