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
import type {DebuggerModeType} from './DebuggerStore';
import type {
  WatchExpressionListStore,
} from './WatchExpressionListStore';
import type {Callstack} from './DebuggerCallstackComponent';

import {CompositeDisposable} from 'atom';
import {
  React,
} from 'react-for-atom';
import {Section} from '../../nuclide-ui/lib/Section';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import {WatchExpressionComponent} from './WatchExpressionComponent';
import {DebuggerSteppingComponent} from './DebuggerSteppingComponent';
import {DebuggerCallstackComponent} from './DebuggerCallstackComponent';

type Props = {
  model: DebuggerModel;
  watchExpressionListStore: WatchExpressionListStore;
};

export class NewDebuggerView extends React.Component {
  props: Props;
  state: {
    debuggerMode: DebuggerModeType;
    callstack: Callstack;
  };
  _wrappedComponent: ReactClass<any>;
  _disposables: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._wrappedComponent = bindObservableAsProps(
      props.watchExpressionListStore.getWatchExpressions().map(
        watchExpressions => ({watchExpressions})
      ),
      WatchExpressionComponent
    );
    this._disposables = new CompositeDisposable();
    this.state = {
      debuggerMode: props.model.getStore().getDebuggerMode(),
      callstack: [], // TODO get actual stack from Chrome dev tools
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
  }

  componentWillUnmount(): void {
    this._dispose();
  }

  render(): React.Element<any> {
    const {
      model,
    } = this.props;
    const actions = model.getActions();
    const WatchExpressionComponentWrapped = this._wrappedComponent;
    return (
      <div className="nuclide-debugger-container-new">
        <Section headline="Debugger Controls">
          <DebuggerSteppingComponent
            actions={actions}
            debuggerMode={this.state.debuggerMode}
          />
        </Section>
        <Section headline="Call Stack">
          <DebuggerCallstackComponent
            callstack={this.state.callstack}
          />
        </Section>
        <Section headline="Watch Expressions">
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
