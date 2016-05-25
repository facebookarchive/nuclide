'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  EvaluationResult,
  ExpansionResult,
} from './Bridge';
import type {Observable} from 'rxjs';

import {React} from 'react-for-atom';
import invariant from 'assert';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import {highlightOnUpdate} from '../../nuclide-ui/lib/highlightOnUpdate';
import {
  TreeList,
  TreeItem,
  NestedTreeItem,
} from '../../nuclide-ui/lib/Tree';
import SimpleValueComponent from './SimpleValueComponent';

const NOT_AVAILABLE_MESSAGE = '<not available>';

function isObjectValue(result: EvaluationResult): boolean {
  return result._objectId != null;
}

// TODO allow passing action components (edit button, pin button) here
function renderValueLine(
  expression: React.Element | string,
  value: React.Element | string,
): React.Element {
  return <div>{expression}: {value}</div>;
}

type DebuggerValueComponentProps = {
  evaluationResult: ?EvaluationResult;
  fetchChildren: (objectId: string) => Observable<?ExpansionResult>;
  expression: string;
  isRoot?: boolean;
  expandedValuePaths: Set<string>;
  onExpandedStateChange: (path: string, expanded: boolean) => void;
  path: string;
};

type DebuggerValueComponentState = {
  isExpanded: boolean;
  children: ?Observable<?ExpansionResult>;
};

/**
 * A component that knows how to render recursive, interactive expression/evaluationResult pairs.
 * The rendering of non-expandable "leaf" values is delegated to the SimpleValueComponent.
 */
class ValueComponent extends React.Component {
  // $FlowIssue HOC
  props: DebuggerValueComponentProps;
  state: DebuggerValueComponentState;

  constructor(props: DebuggerValueComponentProps) {
    super(props);
    this.state = {
      isExpanded: false,
      children: null,
    };
    this.state.children = null;
    (this: any)._toggleExpand = this._toggleExpand.bind(this);
  }

  componentDidMount(): void {
    const {
      path,
      expandedValuePaths,
      fetchChildren,
      evaluationResult,
    } = this.props;
    if (
      !this.state.isExpanded &&
      expandedValuePaths.has(path) &&
      evaluationResult != null &&
      evaluationResult._objectId != null
    ) {
      invariant(evaluationResult._objectId != null);
      this.setState({
        children: fetchChildren(evaluationResult._objectId),
        isExpanded: true,
      });
    }
  }

  componentWillReceiveProps(nextProps: DebuggerValueComponentProps): void {
    if (this.state.isExpanded && nextProps.evaluationResult != null) {
      const {_objectId} = nextProps.evaluationResult;
      if (_objectId == null) {
        return;
      }
      this.setState({
        children: nextProps.fetchChildren(_objectId),
      });
    }
  }

  _toggleExpand(event: SyntheticMouseEvent): void {
    const {
      fetchChildren,
      evaluationResult,
      onExpandedStateChange,
      path,
    } = this.props;
    const newState: DebuggerValueComponentState = {
      children: null,
      isExpanded: !this.state.isExpanded,
    };
    if (!this.state.isExpanded) {
      if (
        typeof fetchChildren === 'function' &&
        evaluationResult != null &&
        evaluationResult._objectId != null
      ) {
        newState.children = fetchChildren(evaluationResult._objectId);
      }
    }
    onExpandedStateChange(path, newState.isExpanded);
    this.setState(newState);
    event.stopPropagation();
  }

  render(): ?React.Element {
    const {
      evaluationResult,
      expression,
      fetchChildren,
      isRoot,
      path,
      expandedValuePaths,
      onExpandedStateChange,
    } = this.props;
    if (evaluationResult == null) {
      return renderValueLine(expression, NOT_AVAILABLE_MESSAGE);
    }
    if (!isObjectValue(evaluationResult)) {
      const simpleValueElement = (
        <SimpleValueComponent
          expression={expression}
          evaluationResult={evaluationResult}
        />
      );
      return isRoot ? simpleValueElement : <TreeItem>{simpleValueElement}</TreeItem>;
    }
    const _description = evaluationResult._description || '<no description provided>';
    const {
      children,
      isExpanded,
    } = this.state;
    let childListElement = null;
    if (isExpanded) {
      if (children == null) {
        childListElement = null;
      } else {
        const ChildrenComponent = bindObservableAsProps(
          children.map(childrenValue => ({children: childrenValue})),
          // $FlowIssue HOC
          ValueComponent
        );
        childListElement = (
          <ChildrenComponent
            fetchChildren={fetchChildren}
            path={path}
            expandedValuePaths={expandedValuePaths}
            onExpandedStateChange={onExpandedStateChange}
          />
        );
      }
    }
    const title = renderValueLine(expression, _description);
    return (
      <TreeList showArrows={true}>
        <NestedTreeItem
          collapsed={!this.state.isExpanded}
          onClick={this._toggleExpand}
          title={title}>
          {childListElement}
        </NestedTreeItem>
      </TreeList>
    );
  }
}

type TopLevelValueComponentProps = {
  evaluationResult: ?EvaluationResult;
  fetchChildren: (objectId: string) => Observable<?ExpansionResult>;
  expression: string;
};

/**
 * TopLevelValueComponent wraps all expandable value components. It is in charge of keeping track
 * of the set of recursively expanded values. The set is keyed by a "path", which is a string
 * containing the concatenated object keys of all recursive parent object for a given item. This
 * is necessary to preserve the expansion state while the values are temporarily unavailable, such
 * as after stepping in the debugger, which triggers a recursive re-fetch.
 */
class TopLevelValueComponent extends React.Component {
  // $FlowIssue `evaluationResult` gets injected via HOC.
  props: TopLevelValueComponentProps;
  expandedValuePaths: Set<string>;

  constructor(props: TopLevelValueComponentProps) {
    super(props);
    this.expandedValuePaths = new Set();
    (this: any).handleExpansionChange = this.handleExpansionChange.bind(this);
  }

  handleExpansionChange(expandedValuePath: string, isExpanded: boolean): void {
    if (isExpanded) {
      this.expandedValuePaths.add(expandedValuePath);
    } else {
      this.expandedValuePaths.delete(expandedValuePath);
    }
  }

  render(): React.Element {
    return (
      <span className="nuclide-debugger-atom-value">
        <ValueComponent
          {...this.props}
          isRoot={true}
          expandedValuePaths={this.expandedValuePaths}
          onExpandedStateChange={this.handleExpansionChange}
          path="root"
        />
      </span>
    );
  }
}

function arePropsEqual(p1: DebuggerValueComponentProps, p2: DebuggerValueComponentProps): boolean {
  const evaluationResult1 = p1.evaluationResult;
  const evaluationResult2 = p2.evaluationResult;
  if (evaluationResult1 === evaluationResult2) {
    return true;
  }
  if (evaluationResult1 == null || evaluationResult2 == null) {
    return false;
  }
  return (
    evaluationResult1.value === evaluationResult2.value &&
    evaluationResult1._type === evaluationResult2._type &&
    evaluationResult1._description === evaluationResult2._description
  );
}
export const DebuggerValueComponent = highlightOnUpdate(
  TopLevelValueComponent,
  arePropsEqual,
  undefined, /* custom classname */
  undefined, /* custom delay */
);
