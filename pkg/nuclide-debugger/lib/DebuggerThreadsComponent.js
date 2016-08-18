'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import classnames from 'classnames';
import {React} from 'react-for-atom';
import type {ThreadItem} from './types';
import type Bridge from './Bridge';

import {Icon} from '../../nuclide-ui/lib/Icon';

type DebuggerThreadsComponentProps = {
  bridge: Bridge,
  threadList: Array<ThreadItem>,
  selectedThreadId: number,
};

export class DebuggerThreadsComponent extends React.Component {
  props: DebuggerThreadsComponentProps;

  render(): ?React.Element<any> {
    const {
      bridge,
      threadList,
      selectedThreadId,
    } = this.props;
    const renderedThreadList = threadList == null || threadList.length === 0
      ? '(threads unavailable)'
      : threadList.map((threadItem, i) => {
        const {
          id,
          address,
          stopReason,
        } = threadItem;
        const isSelected = id === selectedThreadId;
        return (
          <tr
            className={classnames(
              'nuclide-debugger-thread-list-item',
              {
                'nuclide-debugger-thread-list-item-selected': isSelected,
                'nuclide-debugger-thread-list-table-row-odd': i % 2 === 1,
              },
            )}
            onClick={() => bridge.selectThread(id)}
            key={i}>
            <td className="nuclide-debugger-thread-list-item-current-indicator">
              {isSelected ? <Icon icon="arrow-right" title="Selected Thread" /> : null}
            </td>
            <td className="nuclide-debugger-thread-list-item-id" title={id}>{id}</td>
            <td className="nuclide-debugger-thread-list-item-address" title={address}>
              {address}
            </td>
            <td className="nuclide-debugger-thread-list-item-stop-reason" title={stopReason}>
              {stopReason}
            </td>
          </tr>
        );
      });
    return (
      <div>
        <table className="nuclide-debugger-thread-list-table">
          <thead>
            <tr className="nuclide-debugger-thread-list-item">
              <td className="nuclide-debugger-thread-list-item-current-indicator" />
              <td className="nuclide-debugger-thread-list-item-id">ID</td>
              <td className="nuclide-debugger-thread-list-item-address">Address</td>
              <td className="nuclide-debugger-thread-list-item-stop-reason">Stop Reason</td>
            </tr>
          </thead>
          <tbody>
            {renderedThreadList}
          </tbody>
        </table>
      </div>
    );
  }
  }
