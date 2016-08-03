'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerModel from './DebuggerModel';
import type {
  WatchExpressionListStore,
} from './WatchExpressionListStore';
import type {
  Callstack,
  DebuggerModeType,
  FileLineBreakpoints,
  ThreadItem,
} from './types';

import {CompositeDisposable} from 'atom';
import {
  React,
} from 'react-for-atom';
import {Section} from '../../nuclide-ui/lib/Section';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import {WatchExpressionComponent} from './WatchExpressionComponent';
import {LocalsComponent} from './LocalsComponent';
import {BreakpointListComponent} from './BreakpointListComponent';
import {DebuggerSteppingComponent} from './DebuggerSteppingComponent';
import {DebuggerCallstackComponent} from './DebuggerCallstackComponent';
import {DebuggerThreadsComponent} from './DebuggerThreadsComponent';

type Props = {
  model: DebuggerModel,
  watchExpressionListStore: WatchExpressionListStore,
};

export class NewDebuggerView extends React.Component {
  props: Props;
  state: {
    togglePauseOnException: boolean,
    togglePauseOnCaughtException: boolean,
    debuggerMode: DebuggerModeType,
    callstack: ?Callstack,
    breakpoints: ?FileLineBreakpoints,
    showThreadsWindow: boolean,
    threadList: Array<ThreadItem>,
    selectedThreadId: number,
  };
  _watchExpressionComponentWrapped: ReactClass<any>;
  _localsComponentWrapped: ReactClass<any>;
  _disposables: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._watchExpressionComponentWrapped = bindObservableAsProps(
      props.model.getWatchExpressionListStore().getWatchExpressions().map(
        watchExpressions => ({watchExpressions}),
      ),
      WatchExpressionComponent,
    );
    this._localsComponentWrapped = bindObservableAsProps(
      props.model.getLocalsStore().getLocals().map(
        locals => ({locals}),
      ),
      LocalsComponent,
    );
    this._disposables = new CompositeDisposable();
    const debuggerStore = props.model.getStore();
    const threadStore = props.model.getThreadStore();
    this.state = {
      debuggerMode: debuggerStore.getDebuggerMode(),
      togglePauseOnException: debuggerStore.getTogglePauseOnException(),
      togglePauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
      showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
      callstack: props.model.getCallstackStore().getCallstack(),
      breakpoints: props.model.getBreakpointStore().getAllBreakpoints(),
      threadList: threadStore.getThreadList(),
      selectedThreadId: threadStore.getSelectedThreadId(),
    };
  }

  componentDidMount(): void {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(
      debuggerStore.onChange(() => {
        this.setState({
          debuggerMode: debuggerStore.getDebuggerMode(),
          togglePauseOnException: debuggerStore.getTogglePauseOnException(),
          togglePauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
          showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
        });
      }),
    );
    const callstackStore = this.props.model.getCallstackStore();
    this._disposables.add(
      callstackStore.onChange(() => {
        this.setState({
          callstack: callstackStore.getCallstack(),
        });
      }),
    );
    const breakpointStore = this.props.model.getBreakpointStore();
    this._disposables.add(
      breakpointStore.onNeedUIUpdate(() => {
        this.setState({
          breakpoints: breakpointStore.getAllBreakpoints(),
        });
      }),
    );
    const threadStore = this.props.model.getThreadStore();
    this._disposables.add(
      threadStore.onChange(() => {
        this.setState({
          threadList: threadStore.getThreadList(),
          selectedThreadId: threadStore.getSelectedThreadId(),
        });
      }),
    );
  }

  componentWillUnmount(): void {
    this._dispose();
  }

  render(): React.Element<any> {
    const {
      model,
    } = this.props;
    const actions = model.getActions();
    const WatchExpressionComponentWrapped = this._watchExpressionComponentWrapped;
    const LocalsComponentWrapped = this._localsComponentWrapped;
    const threadsSection = this.state.showThreadsWindow
      ? <Section collapsable={true} headline="Threads">
          <div className="nuclide-debugger-atom-section-content">
            <DebuggerThreadsComponent
              bridge={this.props.model.getBridge()}
              threadList={this.state.threadList}
              selectedThreadId={this.state.selectedThreadId}
            />
          </div>
        </Section>
      : null;
    return (
      <div className="nuclide-debugger-container-new">
        <Section collapsable={true} headline="Debugger Controls">
          <div className="nuclide-debugger-atom-section-content">
            <DebuggerSteppingComponent
              actions={actions}
              debuggerMode={this.state.debuggerMode}
              pauseOnException={this.state.togglePauseOnException}
              pauseOnCaughtException={this.state.togglePauseOnCaughtException}
            />
          </div>
        </Section>
        <Section collapsable={true} headline="Call Stack">
          <div className="nuclide-debugger-atom-section-content">
            <DebuggerCallstackComponent
              actions={actions}
              callstack={this.state.callstack}
            />
          </div>
        </Section>
        {threadsSection}
        <Section collapsable={true} headline="Breakpoints">
          <div className="nuclide-debugger-atom-section-content">
            <BreakpointListComponent
              actions={actions}
              breakpoints={this.state.breakpoints}
            />
          </div>
        </Section>
        <Section collapsable={true} headline="Locals">
          <div className="nuclide-debugger-atom-section-content">
            <LocalsComponentWrapped
              watchExpressionStore={model.getWatchExpressionStore()}
            />
          </div>
        </Section>
        <Section collapsable={true} headline="Watch Expressions">
          <div className="nuclide-debugger-atom-section-content">
            <WatchExpressionComponentWrapped
              onAddWatchExpression={actions.addWatchExpression.bind(model)}
              onRemoveWatchExpression={actions.removeWatchExpression.bind(model)}
              onUpdateWatchExpression={actions.updateWatchExpression.bind(model)}
              watchExpressionStore={model.getWatchExpressionStore()}
            />
          </div>
        </Section>
      </div>
    );
  }

  _dispose(): void {
    this._disposables.dispose();
  }
}
