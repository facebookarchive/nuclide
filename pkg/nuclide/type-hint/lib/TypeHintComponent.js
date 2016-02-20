'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HintTree} from '../../type-hint-interfaces';

import {React} from 'react-for-atom';

type TypeHintComponentProps = {
  content: string | HintTree;
}

type TypeHintComponentState = {
  expandedNodes: Set<HintTree>;
}

/* eslint-disable react/prop-types */
export class TypeHintComponent extends React.Component {
  props: TypeHintComponentProps;
  state: TypeHintComponentState;

  constructor(props: TypeHintComponentProps) {
    super(props);
    this.state = {
      expandedNodes: new Set(),
    };
  }

  renderPrimitive(value: string): ReactElement {
    return (
      <li className="list-item">
        <span>{value}</span>
      </li>
    );
  }

  handleChevronClick(tree: HintTree, event: SyntheticEvent): void {
    const {expandedNodes} = this.state;
    if (expandedNodes.has(tree)) {
      expandedNodes.delete(tree);
    } else {
      expandedNodes.add(tree);
    }
    // Force update.
    this.forceUpdate();
  }

  renderHierarchical(tree: HintTree): ReactElement {
    if (tree.children == null) {
      return this.renderPrimitive(tree.value);
    }
    const children = tree.children.map(child => this.renderHierarchical(child));
    const isExpanded = this.state.expandedNodes.has(tree);
    const childrenList = isExpanded
      ? <ul className="list-tree">
          {children}
        </ul>
      : null;
    const className =
      'icon nuclide-type-hint-expandable-chevron ' +
      `icon-chevron-${isExpanded ? 'down' : 'right'}`;
    return (
      <li className="list-nested-item">
        <div className="list-item">
          <span>
            <span
              className={className}
              onClick={this.handleChevronClick.bind(this, tree)}
            />
            {tree.value}
          </span>
        </div>
        {childrenList}
      </li>
    );
  }

  render(): ReactElement {
    const result = typeof this.props.content === 'string'
      ? this.renderPrimitive(this.props.content)
      : this.renderHierarchical(this.props.content);
    return (
      <ul className="list-tree">
        {result}
      </ul>
    );
  }
}
/* eslint-enable react/prop-types */
