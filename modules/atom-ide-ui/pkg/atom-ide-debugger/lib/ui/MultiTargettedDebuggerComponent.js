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

import type {IDebugService, IProcess} from '../types';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import * as React from 'react';
import {TreeList, TreeItem} from 'nuclide-commons-ui/Tree';
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
  processList: Array<IProcess>,
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
      processList: [],
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
      processList: focusedProcess == null ? [] : [focusedProcess],
    };
  }

  handleSelect = () => {};

  //  Use handleConfirm() for double clicking.

  render(): React.Node {
    const {processList} = this.state;

    const processElements = processList.map((process, processIndex) => {
      const threadElements = process
        .getAllThreads()
        .map((thread, threadIndex) => {
          const stackFrameElements = thread
            .getCallStack()
            .map((frame, frameIndex) => {
              return (
                <TreeItem key={frameIndex}>
                  {'Frame ID: ' + frame.frameId + ', Name: ' + frame.name}
                </TreeItem>
              );
            });
          return (
            <MultiTargettedDebuggerTreeNode
              title={'Thread ID: ' + thread.threadId + ', Name: ' + thread.name}
              key={threadIndex}
              childItems={stackFrameElements}
            />
          );
        });
      return (
        <MultiTargettedDebuggerTreeNode
          title={
            'Process command: ' +
            (process == null
              ? ''
              : process.configuration.adapterExecutable == null
                ? 'Main Process'
                : process.configuration.adapterExecutable.command)
          }
          key={processIndex}
          childItems={threadElements}
        />
      );
    });

    return <TreeList showArrows={true}>{processElements}</TreeList>;
  }
}
