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
import type {OutlineForUi, OutlineTree} from '..';

import {React} from 'react-for-atom';
import invariant from 'assert';

import {getLogger} from '../../nuclide-logging';
const logger = getLogger();

type State = {
  outline: OutlineForUi;
};

type Props = {
  outlines: Observable<OutlineForUi>;
};

export class OutlineView extends React.Component {
  state: State;
  props: Props;

  subscription: ?IDisposable;

  constructor(props: Props) {
    super(props);
    this.state = {
      outline: {
        kind: 'empty',
      },
    };
  }

  componentDidMount(): void {
    invariant(this.subscription == null);
    this.subscription = this.props.outlines.subscribe(outline => {
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

  render(): ReactElement {
    return (
      <div className="pane-item padded nuclide-outline-view">
        <OutlineViewComponent outline={this.state.outline} />
      </div>
    );
  }

  getTitle(): string {
    return 'Outline View';
  }

  getIconName(): string {
    return 'list-unordered';
  }
}

type OutlineViewComponentProps = {
  outline: OutlineForUi;
}

class OutlineViewComponent extends React.Component {
  props: OutlineViewComponentProps;

  render(): ?ReactElement {
    const outline = this.props.outline;
    switch (outline.kind) {
      case 'empty':
      case 'not-text-editor':
        return null;
      case 'no-provider':
        return (
          <span>
            Outline view does not currently support {outline.grammar}.
          </span>
        );
      case 'provider-no-outline':
        return (
          <span>
            No outline available.
          </span>
        );
      case 'outline':
        return (
          <div>
            {renderTrees(outline.editor, outline.outline.outlineTrees)}
          </div>
        );
      default:
        const errorText = `Encountered unexpected outline kind ${outline.kind}`;
        logger.error(errorText);
        return (
          <span>
            Internal Error:<br />
            {errorText}
          </span>
        );
    }
  }

}

function renderTree(editor: atom$TextEditor, outline: OutlineTree): ReactElement {
  const onClick = () => {
    const pane = atom.workspace.paneForItem(editor);
    if (pane == null) {
      return;
    }
    pane.activate();
    pane.activateItem(editor);
    editor.setCursorBufferPosition(outline.startPosition);
  };
  return (
    <ul className="list-tree">
      <li className="list-nested-item">
        <div className="list-item nuclide-outline-view-item" onClick={onClick}>
          {outline.displayText}
        </div>
        {renderTrees(editor, outline.children)}
      </li>
    </ul>
  );
}

function renderTrees(editor: atom$TextEditor, outlines: Array<OutlineTree>): Array<ReactElement> {
  return outlines.map(outline => renderTree(editor, outline));
}
