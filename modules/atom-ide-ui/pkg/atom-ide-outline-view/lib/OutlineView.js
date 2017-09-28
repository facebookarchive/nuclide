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

import type {Observable} from 'rxjs';
import type {OutlineForUi, OutlineTreeForUi} from './createOutlines';
import type {TextToken} from 'nuclide-commons/tokenized-text';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import * as React from 'react';
import invariant from 'assert';
import classnames from 'classnames';

import analytics from 'nuclide-commons-atom/analytics';
import {
  goToLocation,
  goToLocationInEditor,
} from 'nuclide-commons-atom/go-to-location';
import {
  LoadingSpinner,
  LoadingSpinnerSizes,
} from 'nuclide-commons-ui/LoadingSpinner';
import {EmptyState} from 'nuclide-commons-ui/EmptyState';

import featureConfig from 'nuclide-commons-atom/feature-config';
import type {SearchResult} from './OutlineViewSearch';
import {OutlineViewSearchComponent} from './OutlineViewSearch';
import groupMatchIndexes from 'nuclide-commons/groupMatchIndexes';

const SEARCH_ENABLED_DEFAULT = true;

type State = {
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  outline: OutlineForUi,
  searchEnabled: boolean,
};

type Props = {
  outlines: Observable<OutlineForUi>,
};

const TOKEN_KIND_TO_CLASS_NAME_MAP = {
  keyword: 'syntax--keyword',
  'class-name': 'syntax--entity syntax--name syntax--class',
  constructor: 'syntax--entity syntax--name syntax--function',
  method: 'syntax--entity syntax--name syntax--function',
  param: 'syntax--variable',
  string: 'syntax--string',
  whitespace: '',
  plain: '',
  type: 'syntax--support syntax--type',
};

export class OutlineView extends React.PureComponent<Props, State> {
  subscription: ?UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this.state = {
      fontFamily: (atom.config.get('editor.fontFamily'): any),
      fontSize: (atom.config.get('editor.fontSize'): any),
      lineHeight: (atom.config.get('editor.lineHeight'): any),
      outline: {
        kind: 'empty',
      },
      searchEnabled: featureConfig.getWithDefaults(
        'atom-ide-outline-view.searchEnabled',
        SEARCH_ENABLED_DEFAULT,
      ),
    };
  }

  componentDidMount(): void {
    invariant(this.subscription == null);
    this.subscription = new UniversalDisposable(
      this.props.outlines.subscribe(outline => {
        this.setState({outline});
      }),
      featureConfig
        .observeAsStream('atom-ide-outline-view.searchEnabled')
        .subscribe((searchEnabled: mixed) => {
          if (typeof searchEnabled === 'boolean') {
            this.setState({searchEnabled});
          } else {
            this.setState({searchEnabled: SEARCH_ENABLED_DEFAULT});
          }
        }),
      atom.config.observe('editor.fontSize', (size: mixed) => {
        this.setState({fontSize: (size: any)});
      }),
      atom.config.observe('editor.fontFamily', (font: mixed) => {
        this.setState({fontFamily: (font: any)});
      }),
      atom.config.observe('editor.lineHeight', (size: mixed) => {
        this.setState({lineHeight: (size: any)});
      }),
    );
  }

  componentWillUnmount(): void {
    invariant(this.subscription != null);
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  render(): React.Node {
    return (
      <div className="outline-view">
        <OutlineViewComponent
          fontFamily={this.state.fontFamily}
          fontSize={this.state.fontSize}
          lineHeight={this.state.lineHeight}
          outline={this.state.outline}
          searchEnabled={this.state.searchEnabled}
        />
      </div>
    );
  }
}

type OutlineViewComponentProps = {
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  outline: OutlineForUi,
  searchEnabled: boolean,
};

class OutlineViewComponent extends React.PureComponent<
  OutlineViewComponentProps,
> {
  constructor(props: OutlineViewComponentProps) {
    super(props);
  }

  render(): React.Node {
    const {
      fontFamily,
      fontSize,
      lineHeight,
      outline,
      searchEnabled,
    } = this.props;

    switch (outline.kind) {
      case 'empty':
      case 'not-text-editor':
        return (
          <EmptyState
            title="No outline available"
            message="Open a file to see its outline."
          />
        );
      case 'loading':
        return (
          <div className="outline-view-loading">
            <LoadingSpinner
              className="inline-block"
              size={LoadingSpinnerSizes.MEDIUM}
            />
          </div>
        );
      case 'no-provider':
        return outline.grammar === 'Null Grammar' ? (
          <EmptyState
            title="No outline available"
            message="Atom doesn't recognize this file's language. Make sure this file has an extension and has been saved."
          />
        ) : (
          <EmptyState
            title="No outline available"
            message={
              <div>
                {outline.grammar} files do not currently support outlines.{' '}
                <a
                  href="#"
                  onClick={() =>
                    goToLocation(
                      `atom://config/install/package:ide-${outline.grammar}`,
                    )}>
                  Install an IDE package first.
                </a>
              </div>
            }
          />
        );
      case 'provider-no-outline':
        return (
          <EmptyState
            title="No outline available"
            message="This is likely an error with the language package."
          />
        );
      case 'outline':
        return (
          <OutlineViewCore
            fontFamily={fontFamily}
            fontSize={fontSize}
            lineHeight={lineHeight}
            outline={outline}
            searchEnabled={searchEnabled}
          />
        );
      default:
        (outline: empty);
    }
  }
}

type OutlineViewCoreProps = {
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  outline: OutlineForUi,
  searchEnabled: boolean,
};

/**
 * Contains both the search field and the scrollable outline tree
 */
class OutlineViewCore extends React.PureComponent<
  OutlineViewCoreProps,
  {
    searchResults: Map<OutlineTreeForUi, SearchResult>,
  },
> {
  state: {
    searchResults: Map<OutlineTreeForUi, SearchResult>,
  } = {
    searchResults: new Map(),
  };

  render() {
    const {
      fontFamily,
      fontSize,
      lineHeight,
      outline,
      searchEnabled,
    } = this.props;
    invariant(outline.kind === 'outline');

    return (
      <div className="outline-view-core">
        {searchEnabled ? (
          <OutlineViewSearchComponent
            outlineTrees={outline.outlineTrees}
            editor={outline.editor}
            updateSearchResults={searchResults => {
              this.setState({searchResults});
            }}
          />
        ) : null}
        <div className="outline-view-trees-scroller">
          <div className="outline-view-trees">
            {renderTrees(
              outline.editor,
              fontFamily,
              fontSize,
              lineHeight,
              outline.outlineTrees,
              this.state.searchResults,
            )}
          </div>
        </div>
      </div>
    );
  }
}

class OutlineTree extends React.PureComponent<{
  editor: atom$TextEditor,
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  outline: OutlineTreeForUi,
  searchResults: Map<OutlineTreeForUi, SearchResult>,
}> {
  onClick = e => {
    const {editor, outline} = this.props;
    const numberOfClicks = e.detail;

    if (numberOfClicks === 1) {
      // single click moves the cursor, but does not focus the editor
      analytics.track('atom-ide-outline-view:go-to-location');
      goToLocationInEditor(editor, {
        line: outline.startPosition.row,
        column: outline.startPosition.column,
      });
    } else if (numberOfClicks === 3) {
      // triple click selects the symbol's region
      const endPosition = outline.endPosition;
      if (endPosition != null) {
        editor.selectToBufferPosition(endPosition);
      }
    }

    if (numberOfClicks === 2 || numberOfClicks === 3) {
      // double and triple clicks focus the editor afterwards
      const pane = atom.workspace.paneForItem(editor);
      if (pane == null) {
        return;
      }

      // Assumes that the click handler has already run, which moves the
      // cursor to the start of the symbol. Let's activate the pane now.
      pane.activate();
      pane.activateItem(editor);
    }
  };

  render(): React.Node {
    const {
      editor,
      outline,
      searchResults,
      fontSize,
      fontFamily,
      lineHeight,
    } = this.props;

    const classNames = ['list-nested-item'];
    if (outline.kind) {
      classNames.push(`kind-${outline.kind}`);
    }
    const classes = classnames(classNames, {
      selected: outline.highlighted,
    });
    return (
      // Set fontSize for the li to make the highlighted region of selected
      // lines (set equal to 2em) look reasonable relative to size of the font.
      <li className={classes} style={{fontSize: fontSize * 0.7}}>
        <div
          className="list-item outline-view-item"
          onClick={this.onClick}
          style={{
            fontSize,
            fontFamily,
            lineHeight,
          }}>
          {renderItem(outline, searchResults.get(outline))}
        </div>
        {renderTrees(
          editor,
          fontFamily,
          fontSize,
          lineHeight,
          outline.children,
          searchResults,
        )}
      </li>
    );
  }
}

function renderItem(
  outline: OutlineTreeForUi,
  searchResult: ?SearchResult,
): Array<React.Element<any> | string> {
  const r = [];
  const icon =
    // flowlint-next-line sketchy-null-string:off
    outline.icon || (outline.kind && OUTLINE_KIND_TO_ICON[outline.kind]);

  if (icon != null) {
    r.push(<span key={`icon-${icon}`} className={`icon icon-${icon}`} />);
    // Note: icons here are fixed-width, so the text lines up.
  }

  if (outline.tokenizedText != null) {
    let offset = 0;
    r.push(
      ...outline.tokenizedText.map((token, i) => {
        const toReturn = renderTextToken(token, i, searchResult, offset);
        offset += token.value.length;
        return toReturn;
      }),
    );
  } else if (outline.plainText != null) {
    const textWithMatching =
      searchResult && searchResult.matchingCharacters
        ? groupMatchIndexes(
            outline.plainText,
            searchResult.matchingCharacters,
            renderMatchedSubsequence,
            renderUnmatchedSubsequence,
          )
        : outline.plainText;
    r.push(...textWithMatching);
  } else {
    r.push('Missing text');
  }
  return r;
}

function renderTextToken(
  token: TextToken,
  index: number,
  searchResult: ?SearchResult,
  offset: number,
): React.Element<any> {
  const className = TOKEN_KIND_TO_CLASS_NAME_MAP[token.kind];
  return (
    <span className={className} key={index}>
      {searchResult && searchResult.matchingCharacters
        ? groupMatchIndexes(
            token.value,
            searchResult.matchingCharacters
              .map(el => el - offset)
              .filter(el => el >= 0 && el < token.value.length),
            renderMatchedSubsequence,
            renderUnmatchedSubsequence,
          )
        : token.value}
    </span>
  );
}

function renderSubsequence(seq: string, props: Object): React.Element<any> {
  return <span {...props}>{seq}</span>;
}

function renderUnmatchedSubsequence(
  seq: string,
  key: number | string,
): React.Element<any> {
  return renderSubsequence(seq, {key});
}

function renderMatchedSubsequence(
  seq: string,
  key: number | string,
): React.Element<any> {
  return renderSubsequence(seq, {
    key,
    className: 'outline-view-match',
  });
}

function renderTrees(
  editor: atom$TextEditor,
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  outlines: Array<OutlineTreeForUi>,
  searchResults: Map<OutlineTreeForUi, SearchResult>,
): ?React.Element<any> {
  if (outlines.length === 0) {
    return null;
  }

  return (
    // Add `position: relative;` to let `li.selected` style position itself relative to the list
    // tree rather than to its container.
    <ul
      className="list-tree"
      style={{
        position: 'relative',
      }}>
      {outlines.map((outline, index) => {
        const result = searchResults.get(outline);
        return !result || result.visible ? (
          <OutlineTree
            editor={editor}
            fontSize={fontSize}
            fontFamily={fontFamily}
            lineHeight={lineHeight}
            outline={outline}
            key={index}
            searchResults={searchResults}
          />
        ) : null;
      })}
    </ul>
  );
}

const OUTLINE_KIND_TO_ICON = {
  array: 'type-array',
  boolean: 'type-boolean',
  class: 'type-class',
  constant: 'type-constant',
  constructor: 'type-constructor',
  enum: 'type-enum',
  field: 'type-field',
  file: 'type-file',
  function: 'type-function',
  interface: 'type-interface',
  method: 'type-method',
  module: 'type-module',
  namespace: 'type-namespace',
  number: 'type-number',
  package: 'type-package',
  property: 'type-property',
  string: 'type-string',
  variable: 'type-variable',
};
