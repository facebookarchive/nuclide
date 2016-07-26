'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import type {ThreadItem} from './types';

import {Listview} from '../../nuclide-ui/lib/ListView';

type DebuggerThreadsComponentProps = {
  threadList: Array<ThreadItem>,
};

export class DebuggerThreadsComponent extends React.Component {
  props: DebuggerThreadsComponentProps;

  render(): ?React.Element<any> {
    const {threadList} = this.props;
    const renderedThreadList = threadList == null || threadList.length === 0
      ? '(threads unavailable)'
      : threadList.map((threadItem, i) => {
        const {
          id,
          name,
          address,
          location,
          stopReason,
          description,
        } = threadItem;
        // TODO polish this up much more nicely.
        return (
          <div key={i}>
            <div>{id}</div>
            <div>{name}</div>
            <div>{address}</div>
            <div>{JSON.stringify(location)}</div>
            <div>{stopReason}</div>
            <div>{description}</div>
          </div>
        );
      });
    return (
      <Listview
        alternateBackground={true}>
        {renderedThreadList}
      </Listview>
    );
  }
  }
