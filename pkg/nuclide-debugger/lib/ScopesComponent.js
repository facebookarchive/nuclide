/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {RemoteObjectId} from 'nuclide-debugger-common/protocol-types';
import type DebuggerModel from './DebuggerModel';
import type {
  EvaluationResult,
  ExpansionResult,
  ScopesMap,
  ScopeSection,
} from './types';
import invariant from 'assert';
import {WatchExpressionStore} from './WatchExpressionStore';
import type {Observable} from 'rxjs';

import * as React from 'react';
import {LazyNestedValueComponent} from 'nuclide-commons-ui/LazyNestedValueComponent';
import SimpleValueComponent from 'nuclide-commons-ui/SimpleValueComponent';
import {Section} from '../../nuclide-ui/Section';

type Props = {|
  +scopes: ScopesMap,
  +watchExpressionStore: WatchExpressionStore,
  +model: DebuggerModel,
|};

const NO_VARIABLES = (
  <div className="nuclide-debugger-expression-value-row">
    <span className="nuclide-debugger-expression-value-content">
      (no variables)
    </span>
  </div>
);

const LOADING = (
  <div className="nuclide-debugger-expression-value-row">
    <span className="nuclide-debugger-expression-value-content">
      Loading...
    </span>
  </div>
);

export class ScopesComponent extends React.Component<Props> {
  _expansionStates: Map<
    string /* expression */,
    Object /* unique reference for expression */,
  >;

  constructor(props: Props) {
    super(props);
    this._expansionStates = new Map();
  }

  _getExpansionStateIdForExpression(expression: string): Object {
    let expansionStateId = this._expansionStates.get(expression);
    if (expansionStateId == null) {
      expansionStateId = {};
      this._expansionStates.set(expression, expansionStateId);
    }
    return expansionStateId;
  }

  _setVariable = (
    scopeObjectId: RemoteObjectId,
    scopeName: string,
    expression: ?string,
    newValue: ?string,
  ): void => {
    if (Boolean(expression) && Boolean(newValue)) {
      invariant(expression != null);
      invariant(newValue != null);
      this.props.model.sendSetVariableRequest(
        scopeObjectId,
        scopeName,
        expression,
        newValue,
      );
    }
  };

  _renderExpression = (
    fetchChildren: (objectId: string) => Observable<?ExpansionResult>,
    setVariable: ?(expression: ?string, newValue: ?string) => void,
    binding: {
      name: string,
      value: EvaluationResult,
    },
    index: number,
  ): ?React.Element<any> => {
    if (binding == null) {
      // `binding` might be `null` while switching threads.
      return null;
    }
    const {name, value} = binding;

    return (
      <div
        className="nuclide-debugger-expression-value-row nuclide-debugger-scope"
        key={index}>
        <div className="nuclide-debugger-expression-value-content">
          <LazyNestedValueComponent
            expression={name}
            evaluationResult={value}
            fetchChildren={fetchChildren}
            simpleValueComponent={SimpleValueComponent}
            expansionStateId={this._getExpansionStateIdForExpression(name)}
            setVariable={setVariable}
          />
        </div>
      </div>
    );
  };

  _renderScopeSection(
    fetchChildren: (objectId: string) => Observable<?ExpansionResult>,
    scope: ScopeSection,
  ): ?React.Element<any> {
    const {loaded, expanded, name, scopeObjectId, scopeVariables} = scope;
    // Non-local scopes should be collapsed by default since users typically care less about them.

    const setVariableHandler = this.props.model.supportsSetVariable()
      ? this._setVariable.bind(this, scopeObjectId, name)
      : null;

    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      <Section
        collapsable={true}
        collapsed={!expanded}
        onChange={isCollapsed =>
          this.props.model.setExpanded(name, !isCollapsed)
        }
        headline={name}
        size="small">
        {!expanded
          ? null
          : !loaded
            ? LOADING
            : scopeVariables.length > 0
              ? scopeVariables.map(
                  this._renderExpression.bind(
                    this,
                    fetchChildren,
                    setVariableHandler,
                  ),
                )
              : NO_VARIABLES}
      </Section>
    );
  }

  render(): React.Node {
    const {watchExpressionStore, scopes} = this.props;
    if (scopes == null || scopes.size === 0) {
      return <span>(no variables)</span>;
    }
    const fetchChildren = watchExpressionStore.getProperties.bind(
      watchExpressionStore,
    );
    const scopeSections = Array.from(scopes.values()).map(
      this._renderScopeSection.bind(this, fetchChildren),
    );
    return (
      <div className="nuclide-debugger-expression-value-list">
        {scopeSections}
      </div>
    );
  }
}
