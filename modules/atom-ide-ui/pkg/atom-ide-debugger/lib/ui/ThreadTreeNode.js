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

import type {IThread, IStackFrame, IDebugService} from '../types';
import type {Expected} from 'nuclide-commons/expected';

import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import {NestedTreeItem} from 'nuclide-commons-ui/Tree';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import * as React from 'react';
import {Observable, Subject} from 'rxjs';
import FrameTreeNode from './FrameTreeNode';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Expect} from 'nuclide-commons/expected';
import classnames from 'classnames';

const LOADING = (
  <div
    className={classnames(
      'debugger-expression-value-row',
      'debugger-tree-no-frames',
    )}>
    <span className="debugger-expression-value-content">
      <LoadingSpinner size="SMALL" />
    </span>
  </div>
);

const NO_FRAMES = (
  <span className="debugger-tree-no-frames">Call frames unavailable</span>
);

type Props = {
  thread: IThread,
  service: IDebugService,
  title: string,
};

type State = {
  isCollapsed: boolean,
  childItems: Expected<Array<IStackFrame>>,
};

export default class ThreadTreeNode extends React.Component<Props, State> {
  _disposables: UniversalDisposable;
  _selectTrigger: Subject<void>;

  constructor(props: Props) {
    super(props);
    this._selectTrigger = new Subject();
    this.state = this._getInitialState();
    this._disposables = new UniversalDisposable();
  }

  _computeIsFocused(): boolean {
    const {service, thread} = this.props;
    const focusedThread = service.viewModel.focusedThread;
    return focusedThread != null && thread.threadId === focusedThread.threadId;
  }

  _getInitialState() {
    return {
      isCollapsed: true,
      childItems: Expect.pending(),
    };
  }

  _getFrames(fetch: boolean = false): Observable<Expected<Array<IStackFrame>>> {
    const {thread} = this.props;
    const getValue = () => Observable.of(Expect.value(thread.getCallStack()));
    if (
      fetch ||
      (!this.state.childItems.isPending &&
        !this.state.childItems.isError &&
        this.state.childItems.value.length === 0)
    ) {
      return Observable.of(Expect.pending()).concat(
        Observable.fromPromise(
          (async () => {
            await thread.fetchCallStack();
            return Expect.value(thread.getCallStack());
          })(),
        ),
      );
    }
    return getValue();
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  componentDidMount(): void {
    const {service} = this.props;
    const model = service.getModel();
    const {viewModel} = service;
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(
          viewModel.onDidFocusStackFrame.bind(viewModel),
        ),
        observableFromSubscribeFunction(service.onDidChangeMode.bind(service)),
      ).subscribe(() => {
        const {isCollapsed} = this.state;

        const newIsCollapsed = isCollapsed && !this._computeIsFocused();
        this.setState({
          isCollapsed: newIsCollapsed,
        });
      }),
      this._selectTrigger
        .asObservable()
        .switchMap(() => this._getFrames(true))
        .subscribe(frames => {
          this.setState({
            childItems: frames,
          });
        }),
      observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model))
        .debounceTime(100)
        .startWith(null)
        .switchMap(() =>
          this._getFrames().switchMap(frames => {
            if (
              !this.state.isCollapsed &&
              !frames.isPending &&
              !frames.isError &&
              frames.value.length === 0
            ) {
              return this._getFrames(true);
            }
            return Observable.of(frames);
          }),
        )
        .subscribe(frames => {
          const {isCollapsed} = this.state;

          this.setState({
            childItems: frames,
            isCollapsed: isCollapsed && !this._computeIsFocused(),
          });
        }),
    );
  }

  handleSelect = () => {
    if (!this.state.isCollapsed) {
      this.setState({
        isCollapsed: true,
      });
    } else {
      this.setState({
        isCollapsed: false,
        childItems: Expect.pending(),
      });
      this._selectTrigger.next();
    }
  };

  render(): React.Node {
    const {thread, title, service} = this.props;
    const {childItems} = this.state;
    const isFocused = this._computeIsFocused();
    const formattedTitle = (
      <span
        className={isFocused ? 'debugger-tree-process-thread-selected' : ''}
        title={'Thread ID: ' + thread.threadId + ', Name: ' + thread.name}>
        {title}
      </span>
    );

    const callFramesElements = childItems.isPending ? (
      LOADING
    ) : childItems.isError ? (
      <span className="debugger-tree-no-frames">
        Error fetching stack frames {childItems.error.toString()}
      </span>
    ) : childItems.value.length === 0 ? (
      NO_FRAMES
    ) : (
      childItems.value.map((frame, frameIndex) => {
        return (
          <FrameTreeNode
            text={frame.name}
            frame={frame}
            key={frameIndex}
            service={service}
          />
        );
      })
    );

    return (
      <NestedTreeItem
        title={formattedTitle}
        collapsed={this.state.isCollapsed}
        onSelect={this.handleSelect}>
        {callFramesElements}
      </NestedTreeItem>
    );
  }
}
