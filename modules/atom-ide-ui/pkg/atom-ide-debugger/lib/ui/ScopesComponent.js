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

import type {IDebugService, IScope, IVariable} from '../types';
import type {Expected} from 'nuclide-commons/expected';

import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import * as React from 'react';
import {LazyNestedValueComponent} from 'nuclide-commons-ui/LazyNestedValueComponent';
import SimpleValueComponent from 'nuclide-commons-ui/SimpleValueComponent';
import invariant from 'assert';
import {Observable} from 'rxjs';
import {Section} from 'nuclide-commons-ui/Section';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {
  fetchChildrenForLazyComponent,
  expressionAsEvaluationResult,
} from '../utils';
import {Expect} from 'nuclide-commons/expected';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';

type Props = {|
  +service: IDebugService,
|};

const NO_VARIABLES = (
  <div className="debugger-expression-value-row">
    <span className="debugger-expression-value-content">(no variables)</span>
  </div>
);

const LOADING = (
  <div className="debugger-expression-value-row">
    <span className="debugger-expression-value-content">
      <LoadingSpinner size="MEDIUM" />
    </span>
  </div>
);

type State = {|
  scopes: Expected<Array<IScope>>,
  expandedScopes: Set<string>,
|};

export default class ScopesComponent extends React.Component<Props, State> {
  _disposables: UniversalDisposable;
  _expansionStates: Map<
    string /* expression */,
    Object /* unique reference for expression */,
  >;

  constructor(props: Props) {
    super(props);
    this.state = {
      scopes: Expect.value([]),
      // UX: Local scope names should be expanded by default.
      expandedScopes: new Set(['Local', 'Locals']),
    };
    this._expansionStates = new Map();
    this._disposables = new UniversalDisposable();
  }

  componentDidMount(): void {
    const {viewModel} = this.props.service;
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(
          viewModel.onDidFocusStackFrame.bind(viewModel),
        ),
        observableFromSubscribeFunction(
          viewModel.onDidChangeExpressionContext.bind(viewModel),
        ),
      )
        .debounceTime(100)
        .startWith(null)
        .switchMap(() => this._getScopes())
        .subscribe(scopes => {
          this.setState({scopes});
        }),
    );
  }

  _getScopes(): Observable<Expected<Array<IScope>>> {
    const {focusedStackFrame} = this.props.service.viewModel;
    if (focusedStackFrame == null) {
      return Observable.of(Expect.value([]));
    } else {
      return Observable.of(Expect.pending()).concat(
        Observable.fromPromise(
          focusedStackFrame
            .getScopes()
            .then(scopes => Expect.value(scopes), error => Expect.error(error)),
        ),
      );
    }
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _renderScopeSection(scope: IScope): ?React.Element<any> {
    // Non-local scopes should be collapsed by default since users typically care less about them.
    const expanded = this._isScopeExpanded(scope);
    const {focusedProcess} = this.props.service.viewModel;
    const canSetVariables =
      focusedProcess != null &&
      focusedProcess.session.capabilities.supportsSetVariable;

    let ScopeBodyComponent = () => null;
    if (expanded) {
      ScopeBodyComponent = bindObservableAsProps(
        this._getScopeVariables(scope).map(variables => ({
          variables,
          canSetVariables,
          getExpansionStateIdForExpression: this
            ._getExpansionStateIdForExpression,
        })),
        ScopeComponent,
      );
    }
    return (
      <Section
        key={scope.getId()}
        collapsable={true}
        collapsed={!expanded}
        onChange={isCollapsed => this._setScopeExpanded(scope, !isCollapsed)}
        headline={scope.name}
        size="small">
        <ScopeBodyComponent />
      </Section>
    );
  }

  _getExpansionStateIdForExpression = (expression: string): Object => {
    let expansionStateId = this._expansionStates.get(expression);
    if (expansionStateId == null) {
      expansionStateId = {};
      this._expansionStates.set(expression, expansionStateId);
    }
    return expansionStateId;
  };

  _getScopeVariables(scope: IScope): Observable<Expected<Array<IVariable>>> {
    return Observable.of(Expect.pending()).concat(
      Observable.fromPromise(
        scope
          .getChildren()
          .then(
            variables => Expect.value(variables),
            error => Expect.error(error),
          ),
      ),
    );
  }

  _isScopeExpanded(scope: IScope): boolean {
    return this.state.expandedScopes.has(scope.name);
  }

  _setScopeExpanded(scope: IScope, expanded: boolean): void {
    if (expanded === this.state.expandedScopes.has(scope.name)) {
      return;
    }
    // TODO: (wbinnssmith) T30771435 this setState depends on current state
    // and should use an updater function rather than an object
    // eslint-disable-next-line react/no-access-state-in-setstate
    const expandedScopes = new Set(this.state.expandedScopes);
    if (expanded) {
      expandedScopes.add(scope.name);
    } else {
      expandedScopes.delete(scope.name);
    }
    this.setState({expandedScopes});
  }

  render(): React.Node {
    const {scopes} = this.state;
    const {service} = this.props;
    if (scopes.isError) {
      return <span>Error fetching scopes: {scopes.error.toString()}</span>;
    } else if (scopes.isPending) {
      return LOADING;
    } else if (scopes.value.length === 0) {
      return <span>(no variables)</span>;
    }
    const scopeSections = scopes.value.map(scope =>
      this._renderScopeSection(scope),
    );
    const processName =
      (service.viewModel.focusedProcess == null ||
      service.viewModel.focusedProcess.configuration.processName == null
        ? 'Unknown Process'
        : service.viewModel.focusedProcess.configuration.processName) +
      (service.viewModel.focusedStackFrame == null
        ? ' (Unknown Frame)'
        : ' (' + service.viewModel.focusedStackFrame.name + ')');
    return (
      <div>
        <span>{processName}</span>
        <div className="debugger-expression-value-list">{scopeSections}</div>
      </div>
    );
  }
}

type ScopeProps = {
  variables: Expected<Array<IVariable>>,
  canSetVariables: boolean,
  getExpansionStateIdForExpression: (name: string) => Object,
};

class ScopeComponent extends React.Component<ScopeProps> {
  render() {
    const {variables} = this.props;
    if (variables.isError) {
      return (
        <div>Error fetching scope variables {variables.error.toString()}</div>
      );
    } else if (variables.isPending) {
      return LOADING;
    } else if (variables.value.length === 0) {
      return NO_VARIABLES;
    } else {
      return variables.value.map(variable => this._renderVariable(variable));
    }
  }

  _setVariable = (expression: ?string, newValue: ?string): void => {
    const {variables} = this.props;
    if (
      !Boolean(expression) ||
      !Boolean(newValue) ||
      variables.isError ||
      variables.isPending
    ) {
      return;
    }
    const variable = variables.value.find(v => v.name === expression);
    if (variable == null) {
      return;
    }
    invariant(newValue != null);
    variable.setVariable(newValue).then(() => this.forceUpdate());
  };

  _renderVariable(expression: IVariable): ?React.Element<any> {
    return (
      <div
        className="debugger-expression-value-row debugger-scope native-key-bindings"
        key={expression.getId()}>
        <div className="debugger-expression-value-content">
          <LazyNestedValueComponent
            expression={expression.name}
            evaluationResult={expressionAsEvaluationResult(expression)}
            fetchChildren={(fetchChildrenForLazyComponent: any)}
            simpleValueComponent={SimpleValueComponent}
            expansionStateId={this.props.getExpansionStateIdForExpression(
              expression.name,
            )}
            setVariable={this.props.canSetVariables ? this._setVariable : null}
          />
        </div>
      </div>
    );
  }
}
