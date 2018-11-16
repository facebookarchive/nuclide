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

import type {EvaluationResult, IExpression} from 'atom-ide-ui';
import type {Expected} from 'nuclide-commons/expected';

import * as React from 'react';
import classnames from 'classnames';
import {Expect} from 'nuclide-commons/expected';
import {expressionAsEvaluationResult} from '../utils';
import ignoreTextSelectionEvents from 'nuclide-commons-ui/ignoreTextSelectionEvents';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import {Observable} from 'rxjs';
import SimpleValueComponent from 'nuclide-commons-ui/SimpleValueComponent';
import {TreeList, TreeItem, NestedTreeItem} from 'nuclide-commons-ui/Tree';
import {ValueComponentClassNames} from 'nuclide-commons-ui/ValueComponentClassNames';

const NOT_AVAILABLE_MESSAGE = '<not available>';
const SPINNER_DELAY = 200; /* ms */

// This weak map tracks which node path(s) are expanded in a recursive expression
// value tree. These must be tracked outside of the React objects themselves, because
// expansion state is persisted even if the tree is destroyed and recreated (such as when
// stepping in a debugger). The root of each tree has a context, which is based on the
// component that contains the tree (such as a debugger pane, tooltip or console pane).
// When that component is destroyed, the WeakMap will remove the expansion state information
// for the entire tree.
const ExpansionStates: WeakMap<Object, Map<string, boolean>> = new WeakMap();

type ExpressionTreeNodeProps = {|
  expression: IExpression,
  value: Expected<EvaluationResult>,
  expansionCache: Map<string, boolean>,
  nodePath: string,
|};

type ExpressionTreeNodeState = {|
  expanded: boolean,
  children: Expected<IExpression[]>,
|};

export class ExpressionTreeNode extends React.Component<
  ExpressionTreeNodeProps,
  ExpressionTreeNodeState,
> {
  state: ExpressionTreeNodeState;
  _toggleNodeExpanded: (e: SyntheticMouseEvent<>) => void;
  _subscription: ?rxjs$ISubscription;

  constructor(props: ExpressionTreeNodeProps) {
    super(props);
    this._subscription = null;
    this._toggleNodeExpanded = ignoreTextSelectionEvents(
      this._toggleExpand.bind(this),
    );
    this.state = {
      expanded: this._isExpanded(),
      children: Expect.pending(),
    };
  }

  componentDidMount(): void {
    if (this.state.expanded) {
      this._fetchChildren();
    }
  }

  componentWillUnmount(): void {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }

  _isExpandable = (): boolean => {
    if (this.props.value.isPending || this.props.value.isError) {
      return false;
    }
    return this.props.expression.hasChildren();
  };

  _isExpanded = (): boolean => {
    if (!this._isExpandable()) {
      return false;
    }
    const {expansionCache, nodePath} = this.props;
    return Boolean(expansionCache.get(nodePath));
  };

  _setExpanded = (expanded: boolean) => {
    const {expansionCache, nodePath} = this.props;
    expansionCache.set(nodePath, expanded);

    if (expanded) {
      this._fetchChildren();
    } else {
      this._stopFetchingChildren();
    }

    this.setState({
      expanded,
    });
  };

  _stopFetchingChildren = (): void => {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  };

  _fetchChildren = (): void => {
    this._stopFetchingChildren();

    if (this._isExpandable()) {
      this._subscription = Observable.fromPromise(
        this.props.expression.getChildren(),
      )
        .catch(error => Observable.of([]))
        .map(children => Expect.value(((children: any): IExpression[])))
        .startWith(Expect.pending())
        .subscribe(children => {
          this.setState({
            children,
          });
        });
    }
  };

  _toggleExpand = (event: SyntheticMouseEvent<>): void => {
    this._setExpanded(!this.state.expanded);
    event.stopPropagation();
  };

  _renderValueLine = (
    expression: React.Element<any> | ?string,
    value: React.Element<any> | string,
  ): React.Element<any> => {
    if (expression == null) {
      return (
        <div className="nuclide-ui-lazy-nested-value-container">{value}</div>
      );
    } else {
      return (
        <div className="nuclide-ui-lazy-nested-value-container">
          <span className={ValueComponentClassNames.identifier}>
            {expression}
          </span>
          : {value}
        </div>
      );
    }
  };

  _renderChild = (child: IExpression): React.Node => {
    const nodePath = this.props.nodePath + '/' + child.name;
    return (
      <TreeItem key={nodePath}>
        <ExpressionTreeNode
          expression={child}
          value={Expect.value(expressionAsEvaluationResult(child))}
          expansionCache={this.props.expansionCache}
          nodePath={nodePath}
        />
      </TreeItem>
    );
  };

  render(): React.Node {
    const {value, expression} = this.props;
    if (value.isPending) {
      // Value not available yet. Show a delayed loading spinner.
      return (
        <TreeItem className="nuclide-ui-lazy-nested-value-spinner">
          <LoadingSpinner size="EXTRA_SMALL" delay={SPINNER_DELAY} />
        </TreeItem>
      );
    }

    if (value.isError) {
      return this._renderValueLine(
        expression.name,
        value.error != null ? value.error.toString() : NOT_AVAILABLE_MESSAGE,
      );
    }

    const evaluationResult = value.value;
    if (!this._isExpandable()) {
      // This is a simple value with no children.
      return (
        <SimpleValueComponent
          expression={expression.name}
          evaluationResult={evaluationResult}
        />
      );
    }

    const description =
      evaluationResult.description != null ? evaluationResult.description : '';

    // A node with a delayed spinner to display if we're expanded, but waiting for
    // children to be fetched.
    const pendingChildrenNode = (
      <ExpressionTreeNode
        expression={this.props.expression}
        value={Expect.pending()}
        expansionCache={this.props.expansionCache}
        nodePath={this.props.nodePath}
      />
    );

    // If collapsed, render no children. Otherwise either render the pendingChildrenNode
    // if the fetch hasn't completed, or the children if we've got them.
    let children;
    if (!this.state.expanded) {
      children = null;
    } else if (this.state.children.isPending) {
      children = pendingChildrenNode;
    } else if (this.state.children.isError) {
      this._renderValueLine(
        'Children',
        this.state.children.error != null
          ? this.state.children.error.toString()
          : NOT_AVAILABLE_MESSAGE,
      );
    } else {
      this.state.children.value.map(child => this._renderChild(child));
    }

    return (
      <TreeList
        showArrows={true}
        className="nuclide-ui-lazy-nested-value-treelist">
        <NestedTreeItem
          collapsed={!this.state.expanded}
          onSelect={this._toggleNodeExpanded}
          title={this._renderValueLine(expression.name, description)}>
          {children}
        </NestedTreeItem>
      </TreeList>
    );
  }
}

export type ExpressionTreeComponentProps = {|
  expression: IExpression,
  value: Expected<EvaluationResult>,
  containerContext: Object,
  className?: string,
|};

export class ExpressionTreeComponent extends React.Component<
  ExpressionTreeComponentProps,
> {
  constructor(props: ExpressionTreeComponentProps) {
    super(props);
  }

  _getExpansionCache = (): Map<string, boolean> => {
    let cache = ExpansionStates.get(this.props.containerContext);
    if (cache == null) {
      cache = new Map();
      ExpansionStates.set(this.props.containerContext, cache);
    }
    return cache;
  };

  render(): React.Node {
    const className = classnames(this.props.className, 'native-key-bindings', {
      'nuclide-ui-lazy-nested-value': this.props.className == null,
    });
    return (
      <span className={className} tabIndex={-1}>
        <ExpressionTreeNode
          expression={this.props.expression}
          value={this.props.value}
          nodePath="root"
          expansionCache={this._getExpansionCache()}
        />
      </span>
    );
  }
}
