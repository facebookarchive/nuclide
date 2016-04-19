'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from '@reactivex/rxjs';
import type {OutlineForUi, OutlineTreeForUi} from './main';
import type {TextToken} from '../../nuclide-tokenized-text';

import {React} from 'react-for-atom';
import invariant from 'assert';
import classnames from 'classnames';

import {track} from '../../nuclide-analytics';
import {goToLocationInEditor} from '../../nuclide-atom-helpers';
import {getLogger} from '../../nuclide-logging';
const logger = getLogger();

type State = {
  outline: OutlineForUi;
};

type Props = {
  outlines: Observable<OutlineForUi>;
};

const TOKEN_KIND_TO_CLASS_NAME_MAP = {
  'keyword': 'keyword',
  'class-name': 'entity name class',
  'constructor': 'entity name function',
  'method': 'entity name function',
  'param': 'variable',
  'string': 'string',
  'whitespace': '',
  'plain': '',
};

export class OutlineView extends React.Component {
  state: State;
  props: Props;

  subscription: ?rx$ISubscription;

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
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  render(): React.Element {
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
};

class OutlineViewComponent extends React.Component {
  props: OutlineViewComponentProps;

  render(): ?React.Element {
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
        return renderTrees(outline.editor, outline.outlineTrees);
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

function renderTree(
  editor: atom$TextEditor,
  outline: OutlineTreeForUi,
  index: number,
): React.Element {
  const onClick = () => {
    const pane = atom.workspace.paneForItem(editor);
    if (pane == null) {
      return;
    }
    track('nuclide-outline-view:go-to-location');
    pane.activate();
    pane.activateItem(editor);
    goToLocationInEditor(editor, outline.startPosition.row, outline.startPosition.column);
  };

  const classes = classnames(
    'list-nested-item',
    { 'selected': outline.highlighted },
  );
  return (
    <li className={classes} key={index}>
      <div className="list-item nuclide-outline-view-item" onClick={onClick}>
        {renderItemText(outline)}
      </div>
      {renderTrees(editor, outline.children)}
    </li>
  );
}

function renderItemText(outline: OutlineTreeForUi): Array<React.Element> | string {
  if (outline.tokenizedText != null) {
    return outline.tokenizedText.map(renderTextToken);
  } else if (outline.plainText != null) {
    return outline.plainText;
  } else {
    return 'Missing text';
  }
}

function renderTextToken(token: TextToken, index: number): React.Element {
  const className = TOKEN_KIND_TO_CLASS_NAME_MAP[token.kind];
  return <span className={className} key={index}>{token.value}</span>;
}

function renderTrees(
  editor: atom$TextEditor,
  outlines: Array<OutlineTreeForUi>
): ?React.Element {
  if (outlines.length === 0) {
    return null;
  }
  return (
    // Add `position: relative;` to let `li.selected` style position itself relative to the list
    // tree rather than to its container.
    <ul className="list-tree" style={{position: 'relative'}}>
      {outlines.map((outline, index) => renderTree(editor, outline, index))}
    </ul>
  );
}
