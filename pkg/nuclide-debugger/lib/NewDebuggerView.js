/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type DebuggerModel from './DebuggerModel';
import type {
  WatchExpressionListStore,
} from './WatchExpressionListStore';

import {CompositeDisposable} from 'atom';
import {
  React,
} from 'react-for-atom';
import {Section} from '../../nuclide-ui/Section';
import {bindObservableAsProps} from '../../nuclide-ui/bindObservableAsProps';
import {
  FlexDirections,
  ResizableFlexContainer,
  ResizableFlexItem,
} from '../../nuclide-ui/ResizableFlexContainer';
import {WatchExpressionComponent} from './WatchExpressionComponent';
import {ScopesComponent} from './ScopesComponent';
import {BreakpointListComponent} from './BreakpointListComponent';
import {DebuggerSteppingComponent} from './DebuggerSteppingComponent';
import {DebuggerCallstackComponent} from './DebuggerCallstackComponent';
import {DebuggerThreadsComponent} from './DebuggerThreadsComponent';
import type {ThreadColumn} from '../../nuclide-debugger-base/lib/types';

type Props = {
  model: DebuggerModel,
  watchExpressionListStore: WatchExpressionListStore,
};

export class NewDebuggerView extends React.PureComponent {
  props: Props;
  state: {
    showThreadsWindow: boolean,
    customThreadColumns: Array<ThreadColumn>,
  };
  _watchExpressionComponentWrapped: ReactClass<any>;
  _scopesComponentWrapped: ReactClass<any>;
  _disposables: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._watchExpressionComponentWrapped = bindObservableAsProps(
      props.model.getWatchExpressionListStore().getWatchExpressions().map(
        watchExpressions => ({watchExpressions}),
      ),
      WatchExpressionComponent,
    );
    this._scopesComponentWrapped = bindObservableAsProps(
      props.model.getScopesStore().getScopes().map(
        scopes => ({scopes}),
      ),
      ScopesComponent,
    );
    this._disposables = new CompositeDisposable();
    const debuggerStore = props.model.getStore();
    this.state = {
      showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
      customThreadColumns: (debuggerStore.getSettings().get('CustomThreadColumns'): any) || [],
    };
  }

  componentDidMount(): void {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(
      debuggerStore.onChange(() => {
        this.setState({
          showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
          customThreadColumns: (debuggerStore.getSettings().get('CustomThreadColumns'): any) || [],
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
    const ScopesComponentWrapped = this._scopesComponentWrapped;
    const threadsSection = this.state.showThreadsWindow
      ? <ResizableFlexItem initialFlexScale={1}>
          <Section headline="Threads"
            className="nuclide-debugger-section-header">
            <div className="nuclide-debugger-section-content">
              <DebuggerThreadsComponent
                bridge={this.props.model.getBridge()}
                threadStore={model.getThreadStore()}
                customThreadColumns={this.state.customThreadColumns}
              />
            </div>
          </Section>
        </ResizableFlexItem>
      : null;
    return (
      <div className="nuclide-debugger-container-new">
        <div className="nuclide-debugger-section-header nuclide-debugger-controls-section">
          <div className="nuclide-debugger-section-content">
            <DebuggerSteppingComponent
              actions={actions}
              debuggerStore={model.getStore()}
            />
          </div>
        </div>
        <ResizableFlexContainer direction={FlexDirections.VERTICAL}>
          {threadsSection}
          <ResizableFlexItem initialFlexScale={1}>
            <Section headline="Call Stack"
              key="callStack"
              className="nuclide-debugger-section-header">
              <div className="nuclide-debugger-section-content">
                <DebuggerCallstackComponent
                  actions={actions}
                  bridge={model.getBridge()}
                  callstackStore={model.getCallstackStore()}
                />
              </div>
            </Section>
          </ResizableFlexItem>
          <ResizableFlexItem initialFlexScale={1}>
            <Section headline="Breakpoints"
              key="breakpoints"
              className="nuclide-debugger-section-header">
              <div className="nuclide-debugger-section-content">
                <BreakpointListComponent
                  actions={actions}
                  breakpointStore={model.getBreakpointStore()}
                />
              </div>
            </Section>
          </ResizableFlexItem>
          <ResizableFlexItem initialFlexScale={1}>
            <Section headline="Scopes"
              key="scopes"
              className="nuclide-debugger-section-header">
              <div className="nuclide-debugger-section-content">
                <ScopesComponentWrapped
                  watchExpressionStore={model.getWatchExpressionStore()}
                />
              </div>
            </Section>
          </ResizableFlexItem>
          <ResizableFlexItem initialFlexScale={1}>
            <Section headline="Watch Expressions"
              key="watchExpressions"
              className="nuclide-debugger-section-header">
              <div className="nuclide-debugger-section-content">
                <WatchExpressionComponentWrapped
                  onAddWatchExpression={actions.addWatchExpression.bind(model)}
                  onRemoveWatchExpression={actions.removeWatchExpression.bind(model)}
                  onUpdateWatchExpression={actions.updateWatchExpression.bind(model)}
                  watchExpressionStore={model.getWatchExpressionStore()}
                />
              </div>
            </Section>
          </ResizableFlexItem>
        </ResizableFlexContainer>
      </div>
    );
  }

  _dispose(): void {
    this._disposables.dispose();
  }
}
