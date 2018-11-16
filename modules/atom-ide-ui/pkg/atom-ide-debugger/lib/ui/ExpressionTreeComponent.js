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

import type {EvaluationResult} from 'atom-ide-ui';
import type {Expected} from 'nuclide-commons/expected';

import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';
import {ValueComponentClassNames} from 'nuclide-commons-ui/ValueComponentClassNames';
import {TreeList, TreeItem, NestedTreeItem} from 'nuclide-commons-ui/Tree';
import * as React from 'react';
import SimpleValueComponent from 'nuclide-commons-ui/SimpleValueComponent';
import classnames from 'classnames';

const NOT_AVAILABLE_MESSAGE = '<not available>';
const SPINNER_DELAY = 100; /* ms */

type ExpressionTreeNodeProps = {|
  expression: string,
  value: Expected<EvaluationResult>,
|};

type ExpressionTreeNodeState = {|
  expanded: boolean,
|};

export class ExpressionTreeNode extends React.Component<
  ExpressionTreeNodeProps,
  ExpressionTreeNodeState,
> {
  state: ExpressionTreeNodeState;

  constructor(props: ExpressionTreeNodeProps) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  _isExpandable = (): boolean => {
    if (this.props.value.isPending || this.props.value.isError) {
      return false;
    }
    return this.props.value.value.objectId != null;
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
        expression,
        value.error != null ? value.error.toString() : NOT_AVAILABLE_MESSAGE,
      );
    }

    const evaluationResult = value.value;
    if (!this._isExpandable()) {
      // This is a simple value with no children.
      return (
        <SimpleValueComponent
          expression={expression}
          evaluationResult={evaluationResult}
          simpleValueComponent={SimpleValueComponent}
        />
      );
    }

    const description =
      evaluationResult.description != null ? evaluationResult.description : '';
    const children = this.state.expanded ? [].map(child => null) : null;

    return (
      <TreeList
        showArrows={true}
        className="nuclide-ui-lazy-nested-value-treelist">
        <NestedTreeItem
          collapsed={!this.state.expanded}
          title={this._renderValueLine(expression, description)}>
          {children}
        </NestedTreeItem>
      </TreeList>
    );
  }
}

export type ExpressionTreeComponentProps = {|
  expression: string,
  value: Expected<EvaluationResult>,
  className?: string,
|};

export class ExpressionTreeComponent extends React.Component<
  ExpressionTreeComponentProps,
> {
  constructor(props: ExpressionTreeComponentProps) {
    super(props);
  }

  _getExpanded = (path: string): boolean => {
    return false;
  };

  render(): React.Node {
    const className = classnames(this.props.className, {
      'nuclide-ui-lazy-nested-value': this.props.className == null,
    });
    return (
      <span className={className} tabIndex={-1}>
        <ExpressionTreeNode
          expression={this.props.expression}
          value={this.props.value}
        />
      </span>
    );
  }
}
