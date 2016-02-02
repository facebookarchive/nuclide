'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rx';
import type {Outline, OutlineTree} from './main';

import {React} from 'react-for-atom';

import invariant from 'assert';

export function createOutlineViewClass(outlines: Observable<?Outline>): typeof React.Component {
  return class OutlineView extends React.Component {
    static gadgetId = 'nuclide-outline-view';
    static defaultLocation = 'right';

    subscription: ?IDisposable;

    constructor(props) {
      super(props);
      this.state = {outline: null};
    }

    componentDidMount(): void {
      invariant(this.subscription == null);
      this.subscription = outlines.subscribe(outline => {
        // If the outline view has focus, we don't want to re-render anything.
        if (this !== atom.workspace.getActivePaneItem()) {
          this.setState({outline});
        }
      });
    }

    componentWillUnmount(): void {
      invariant(this.subscription != null);
      this.subscription.dispose();
      this.subscription = null;
    }

    render(): ?ReactElement {
      let contents;
      if (this.state.outline == null) {
        contents = (
          <span>
            No outline available
          </span>
        );
      } else {
        contents = (
          <OutlineViewComponent outline={this.state.outline} />
        );
      }
      return (
        <div className="pane-item padded nuclide-outline-view">
          {contents}
        </div>
      );
    }

    getTitle(): string {
      return 'Outline View';
    }

    getIconName(): string {
      return 'list-unordered';
    }
  };
}

class OutlineViewComponent extends React.Component {
  static propTypes = {
    outline: React.PropTypes.object.isRequired,
  };

  render(): ReactElement {
    return (
      <div>
        {this.props.outline.outlineTrees.map(this._renderTree.bind(this))}
      </div>
    );
  }

  _renderTree(outline: OutlineTree): ReactElement {
    const onClick = () => {
      atom.workspace.open(this.props.outline.file, {
        initialLine: outline.startPosition.row,
        initialColumn: outline.startPosition.column,
        searchAllPanes: true,
      });
    };
    return (
      <ul className="list-tree">
        <li className="list-nested-item">
          <div className="list-item nuclide-outline-view-item" onClick={onClick}>
            {outline.displayText}
          </div>
          {outline.children.map(this._renderTree.bind(this))}
        </li>
      </ul>
    );
  }
}
