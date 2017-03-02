/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {
  Range,
  TextBuffer,
} from 'atom';
import {React} from 'react-for-atom';
import {pluralize} from '../commons-node/string';
import UniversalDisposable from '../commons-node/UniversalDisposable';
import {AtomTextEditor} from './AtomTextEditor';

// Format returned by `diffparser`:
type Hunk = {
  content: string, // e.g. "@@ -1,2 +1,2 @@"
  changes: Array<{
    type: 'add' | 'del' | 'normal',
    del: boolean,
    ln: number,
    position: number,
    content: string,
  }>,
  oldStart: number,
  oldLines: number,
  newStart: number,
  newLines: number,
};
type FileName = string;
type FileDiff = {
  from: FileName,
  to: FileName,
  chunks: Array<Hunk>,
  deletions: number,
  additions: number,
  index?: Array<string>,
};
type Props = {
  diff: FileDiff,
};

type HunkProps = {
  hunk: Hunk,
  grammar: atom$Grammar,
};

function getHighlightClass(type: string): ?string {
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
    this._createLineMarkers(this.refs.editor.getModel());
  }

  // This is a read-only component– no need to update the underlying TextEditor.
  shouldComponentUpdate(nextProps: HunkProps): boolean {
    return false;
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
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
    } = hunk;
    // Remove the first character in each line (/[+- ]/) which indicates addition / deletion
    const text = changes.map(change => change.content.slice(1)).join('\n');
    const textBuffer = new TextBuffer();
    textBuffer.setText(text);
    return (
      <div key={content}>
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
      to,
      chunks,
      deletions,
      additions,
    } = diff;
    const grammar = atom.grammars.selectGrammar(to, '');
    const hunks = chunks.map(chunk =>
      <HunkDiff
        key={chunk.content}
        grammar={grammar}
        hunk={chunk}
      />,
    );
    return (
      <div className="nuclide-ui-file-changes">
        <h3>{to}</h3>
        <div>
          {additions} {pluralize('addition', additions)},{' '}
          {deletions} {pluralize('deletion', deletions)}
        </div>
        <div>{hunks}</div>
      </div>
    );
  }
}
