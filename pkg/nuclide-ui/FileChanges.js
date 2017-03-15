/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {AtomTextEditor} from './AtomTextEditor';
import invariant from 'assert';
import {pluralize} from '../commons-node/string';
import {
  Range,
  TextBuffer,
} from 'atom';
import React from 'react';
import UniversalDisposable from '../commons-node/UniversalDisposable';
import {viewableFromReactElement} from '../commons-atom/viewableFromReactElement';

type Props = {
  diff: diffparser$FileDiff,
  checkboxFactory?:
    (fileName: string, hunkOldStartLine?: number, line?: number) => React.Element<any>,
};

type HunkProps = {
  fileName: string,
  checkboxFactory: ?(fileName: string, hunkOldStartLine: number, line?: number)
    => React.Element<any>,
  grammar: atom$Grammar,
  hunk: diffparser$Hunk,
};

function getHighlightClass(type: diffparser$ChangeType): ?string {
  if (type === 'add') {
    return 'nuclide-ui-hunk-diff-insert';
  }
  if (type === 'del') {
    return 'nuclide-ui-hunk-diff-delete';
  }
  return null;
}

class HunkDiff extends React.Component {
  props: HunkProps;
  _disposables: UniversalDisposable;

  constructor(props: HunkProps) {
    super(props);
    this._disposables = new UniversalDisposable();
  }

  componentDidMount(): void {
    if (this.props.checkboxFactory != null) {
      this._createCheckboxGutter(this.refs.editor.getModel());
    }
    this._createLineMarkers(this.refs.editor.getModel());
  }

  // This is a read-only component– no need to update the underlying TextEditor.
  shouldComponentUpdate(nextProps: HunkProps): boolean {
    return false;
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _createCheckboxGutter(editor: atom$TextEditor): void {
    const {checkboxFactory} = this.props;
    invariant(checkboxFactory != null);
    const gutter = editor.addGutter({name: 'checkboxes'});
    let firstChangedLineNumber = 0;
    let hunkIndex = 0;

    for (const line of this.props.hunk.changes) {
      const lineNumber = hunkIndex++;
      if (line.type === 'normal') {
        continue;
      } else if (firstChangedLineNumber === 0) {
        firstChangedLineNumber = lineNumber;
      }
      const range = new Range(
        [lineNumber, 0],
        [lineNumber + 1, 0],
      );
      const item = viewableFromReactElement(checkboxFactory(
        this.props.fileName,
        this.props.hunk.oldStart,
        lineNumber - firstChangedLineNumber,
      ));

      const marker = editor.markBufferRange(range, {invalidate: 'never'});
      const gutterDecoration = gutter.decorateMarker(marker, {
        type: 'gutter',
        item,
      });

      this._disposables.add(() => {
        item.destroy();
        gutterDecoration.destroy();
      });
    }

    this._disposables.add(() => gutter.destroy());
  }

  /**
   * @param lineNumber A buffer line number to be highlighted.
   * @param type The type of highlight to be applied to the line.
   *             Could be a value of: ['insert', 'delete'].
   */
  _createLineMarkers(editor: atom$TextEditor): void {
    let hunkIndex = 0;
    for (const hunkChanges of this.props.hunk.changes) {
      const lineNumber = hunkIndex++;
      const range = new Range(
        [lineNumber, 0],
        [lineNumber + 1, 0],
      );
      const marker = editor.markBufferRange(range, {invalidate: 'never'});
      const className = getHighlightClass(hunkChanges.type);
      if (className == null) {
        // No need to highlight normal lines.
        continue;
      }
      const decoration = editor.decorateMarker(marker, {
        type: 'highlight',
        class: className,
      });

      this._disposables.add(() => {
        decoration.destroy();
      });
    }
  }

  render(): React.Element<any> {
    const {
      hunk,
      grammar,
    } = this.props;
    const {
      content,
      changes,
      oldStart,
    } = hunk;
    // Remove the first character in each line (/[+- ]/) which indicates addition / deletion
    const text = changes.map(change => change.content.slice(1)).join('\n');
    const textBuffer = new TextBuffer();
    textBuffer.setText(text);

    let checkbox;
    if (this.props.checkboxFactory != null) {
      checkbox = this.props.checkboxFactory(this.props.fileName, oldStart);
    }
    return (
      <div key={content}>
        {checkbox}
        {content}
         <AtomTextEditor
           autoGrow={true}
           className="nuclide-ui-hunk-diff-text-editor"
           correctContainerWidth={false}
           grammar={grammar}
           gutterHidden={true}
           readOnly={true}
           ref="editor"
           textBuffer={textBuffer}
         />
      </div>
    );
  }
}

/* Renders changes to a single file. */
export default class FileChanges extends React.Component {
  props: Props;

  render(): ?React.Element<any> {
    const {diff} = this.props;
    const {
      to: fileName,
      chunks,
      deletions,
      additions,
    } = diff;
    const grammar = atom.grammars.selectGrammar(fileName, '');
    let checkbox;
    if (this.props.checkboxFactory != null) {
      checkbox = this.props.checkboxFactory(fileName);
    }
    const hunks = chunks.map(chunk =>
      <HunkDiff
        checkboxFactory={this.props.checkboxFactory}
        fileName={fileName}
        key={chunk.content}
        grammar={grammar}
        hunk={chunk}
      />,
    );
    return (
      <div className="nuclide-ui-file-changes">
        <h3>
          {checkbox}
          {fileName}
        </h3>
        <div>
          {additions} {pluralize('addition', additions)},{' '}
          {deletions} {pluralize('deletion', deletions)}
        </div>
        <div>{hunks}</div>
      </div>
    );
  }
}
