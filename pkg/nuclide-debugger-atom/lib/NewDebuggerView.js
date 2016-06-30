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
import type Multimap from './Multimap';
import type {
  WatchExpressionListStore,
} from './WatchExpressionListStore';
import type {
  Callstack,
  DebuggerModeType,
  FileLineBreakpoints,
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

type Props = {
  model: DebuggerModel;
  watchExpressionListStore: WatchExpressionListStore;
};

function storeBreakpointsToViewBreakpoints(
  storeBreakpoints: Multimap<string, number>,
): FileLineBreakpoints {
  const breakpoints: FileLineBreakpoints = [];
  storeBreakpoints.forEach((line: number, path: string) => {
    breakpoints.push({
      path,
      line,
      // TODO jxg add enabled/disable functionality to store & consume it here.
      enabled: true,
      // TODO jxg sync unresolved breakpoints from Chrome Dev tools & consume them here.
      resolved: true,
    });
  });
  return breakpoints;
}

export class NewDebuggerView extends React.Component {
  props: Props;
  state: {
    debuggerMode: DebuggerModeType;
    callstack: ?Callstack;
    breakpoints: ?FileLineBreakpoints;
  };
  _watchExpressionComponentWrapped: ReactClass<any>;
  _localsComponentWrapped: ReactClass<any>;
  _disposables: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._watchExpressionComponentWrapped = bindObservableAsProps(
      props.model.getWatchExpressionListStore().getWatchExpressions().map(
        watchExpressions => ({watchExpressions})
      ),
      WatchExpressionComponent
    );
    this._localsComponentWrapped = bindObservableAsProps(
      props.model.getLocalsStore().getLocals().map(
        locals => ({locals})
      ),
      LocalsComponent
    );
    this._disposables = new CompositeDisposable();
    this.state = {
      debuggerMode: props.model.getStore().getDebuggerMode(),
      callstack: props.model.getCallstackStore().getCallstack(),
      breakpoints: storeBreakpointsToViewBreakpoints(
        props.model.getBreakpointStore().getAllBreakpoints()
      ),
    };
  }

  componentDidMount(): void {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(
      debuggerStore.onChange(() => {
        this.setState({
          debuggerMode: debuggerStore.getDebuggerMode(),
        });
      })
    );
    const callstackStore = this.props.model.getCallstackStore();
    this._disposables.add(
      callstackStore.onChange(() => {
        this.setState({
          callstack: callstackStore.getCallstack(),
        });
      })
    );
    const breakpointStore = this.props.model.getBreakpointStore();
    this._disposables.add(
      breakpointStore.onChange(() => {
        this.setState({
          breakpoints: storeBreakpointsToViewBreakpoints(breakpointStore.getAllBreakpoints()),
        });
      })
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
    return (
      <div className="nuclide-debugger-container-new">
        <Section collapsable={true} headline="Debugger Controls">
          <DebuggerSteppingComponent
            actions={actions}
            debuggerMode={this.state.debuggerMode}
          />
        </Section>
        <Section collapsable={true} headline="Call Stack">
          <DebuggerCallstackComponent
            actions={actions}
            callstack={this.state.callstack}
          />
        </Section>
        <Section collapsable={true} headline="Breakpoints">
          <BreakpointListComponent
            actions={actions}
            breakpoints={this.state.breakpoints}
          />
        </Section>
        <Section collapsable={true} headline="Locals">
          <LocalsComponentWrapped
            watchExpressionStore={model.getWatchExpressionStore()}
          />
        </Section>
        <Section collapsable={true} headline="Watch Expressions">
          <WatchExpressionComponentWrapped
            onAddWatchExpression={actions.addWatchExpression.bind(model)}
            onRemoveWatchExpression={actions.removeWatchExpression.bind(model)}
            onUpdateWatchExpression={actions.updateWatchExpression.bind(model)}
            watchExpressionStore={model.getWatchExpressionStore()}
          />
        </Section>
      </div>
    );
  }

  _dispose(): void {
    this._disposables.dispose();
  }
}
