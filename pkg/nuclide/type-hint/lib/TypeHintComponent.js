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

import React from 'react-for-atom';

type TypeHintComponentProps = {
  content: string | HintTree;
}

/* eslint-disable react/prop-types */
export class TypeHintComponent extends React.Component {

  constructor(props: TypeHintComponentProps) {
    super(props);
  }

  getDefaultProps(): TypeHintComponentProps {
    return {
      content: '<type unavailable>',
    };
  }

  renderPrimitive(value: string): ReactElement {
    return (
      <li className="list-item">
        <span>{value}</span>
      </li>
    );
  }

  renderHierarchical(tree: HintTree): ReactElement {
    if (tree.children == null) {
      return this.renderPrimitive(tree.value);
    }
    const children = tree.children.map(child => this.renderHierarchical(child));
    return (
      <li className="list-nested-item">
        <div className="list-item">
          <span className="icon icon-chevron-right">{tree.value}</span>
        </div>
        <ul className="list-tree">
          {children}
        </ul>
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
