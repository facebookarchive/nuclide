/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {IDebugService, IThread} from '../types';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import * as React from 'react';
import {TreeList} from 'nuclide-commons-ui/Tree';
import MultiTargettedDebuggerTreeNode from './MultiTargettedDebuggerTreeNode';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {fastDebounce} from 'nuclide-commons/observable';
import {Observable} from 'rxjs';

/*
const helloWorldItemsLocals = [
  <TreeItem key={0}>a</TreeItem>,
  <TreeItem key={1}>b</TreeItem>,
];

<MultiTargettedDebuggerTreeNode
  key={0}
  title="Mario.js"
  childItems={[]}
/>,
*/

type Props = {
  service: IDebugService,
};

type State = {
  threadList: Array<IThread>,
};

/*
const treeItems = [
  <MultiTargettedDebuggerTreeNode
    key={0}
    title="MobileApp"
    childItems={[
      <MultiTargettedDebuggerTreeNode
        key={0}
        title="ThreadID=235"
        childItems={[
          <MultiTargettedDebuggerTreeNode
            key={0}
            title="HelloWorld.js"
            childItems={[
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Locals"
                childItems={[
                  <TreeItem key={0}>a</TreeItem>,
                  <TreeItem key={1}>b</TreeItem>,
                ]}
              />,
              <MultiTargettedDebuggerTreeNode
                key={1}
                title="Globals"
                childItems={[<TreeItem key={0}>FACEBOOK_URI</TreeItem>]}
              />,
            ]}
          />,
          <MultiTargettedDebuggerTreeNode
            key={1}
            title="Mario.js"
            childItems={[
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Locals"
                childItems={[
                  <TreeItem key={0}>bowser_hp</TreeItem>,
                  <TreeItem key={1}>mario_hp</TreeItem>,
                ]}
              />,
              <MultiTargettedDebuggerTreeNode
                key={1}
                title="Globals"
                childItems={[]}
              />,
            ]}
          />,
        ]}
      />,
    ]}
  />,
  <MultiTargettedDebuggerTreeNode
    key={1}
    title="FacebookServer"
    childItems={[
      <MultiTargettedDebuggerTreeNode
        key={0}
        title="ThreadID=142"
        childItems={[
          <MultiTargettedDebuggerTreeNode
            key={0}
            title="Zuck.js"
            childItems={[
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Locals"
                childItems={[
                  <TreeItem key={0}>age</TreeItem>,
                  <TreeItem key={1}>isQuenched</TreeItem>,
                ]}
              />,
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Globals"
                childItems={[]}
              />,
            ]}
          />,
        ]}
      />,
      <MultiTargettedDebuggerTreeNode
        key={1}
        title="ThreadID=512"
        childItems={[
          <MultiTargettedDebuggerTreeNode
            key={0}
            title="Ads.js"
            childItems={[
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Locals"
                childItems={[<TreeItem key={0}>size</TreeItem>]}
              />,
              <MultiTargettedDebuggerTreeNode
                key={0}
                title="Globals"
                childItems={[<TreeItem key={0}>popularity</TreeItem>]}
              />,
            ]}
          />,
        ]}
      />,
    ]}
  />,
];
*/

export default class MultiTargettedDebuggerComponent extends React.PureComponent<
  Props,
  State,
> {
  _disposables: UniversalDisposable;
  _treeView: ?TreeList;

  constructor(props: Props) {
    super(props);
    this.state = {
      threadList: [],
    };

    this._disposables = new UniversalDisposable();
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount(): void {
    const {service} = this.props;
    const {viewModel} = service;
    const model = service.getModel();
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(
          viewModel.onDidFocusStackFrame.bind(viewModel),
        ),
        observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model)),
      )
        .let(fastDebounce(150))
        .subscribe(this._handleThreadsChanged),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _handleThreadsChanged = (): void => {
    this.setState(this._getState());
  };

  _getState(): $Shape<State> {
    const {focusedProcess} = this.props.service.viewModel;
    return {
      threadList: focusedProcess == null ? [] : focusedProcess.getAllThreads(),
    };
  }

  handleSelect = () => {};

  //  Use handleConfirm() for double clicking.

  render(): React.Node {
    const {threadList} = this.state;
    const threadItems = threadList.map((thread, index) => {
      return (
        <MultiTargettedDebuggerTreeNode
          title={'Thread ID: ' + thread.threadId + ', Name: ' + thread.name}
          key={index}
          childItems={[]}
        />
      );
    });

    return (
      <TreeList showArrows={true}>
        <MultiTargettedDebuggerTreeNode
          key={0}
          title="Main Process"
          childItems={threadItems}
          ref={treeView => {
            this._treeView = treeView;
          }}
        />
      </TreeList>
    );
  }
}
