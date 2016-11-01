'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {EditorElementsMap, HighlightedLines, LineMapper, OffsetMap} from './types';

import {mapEqual} from '../../commons-node/collection';
import {React} from 'react-for-atom';
import DiffViewEditor from './DiffViewEditor';
import {AtomTextEditor} from '../../nuclide-ui/AtomTextEditor';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {Observable} from 'rxjs';
import classnames from 'classnames';
import {
  LoadingSpinner,
  LoadingSpinnerSizes,
} from '../../nuclide-ui/LoadingSpinner';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {
  DIFF_EDITOR_MARKER_CLASS,
} from './constants';

const SPINNER_DELAY_MS = 50;
const DEBOUNCE_SCROLL_MS = 50;

type Props = {
  filePath: NuclideUri,
  isLoading: boolean,
  lineMapper: LineMapper,
  textBuffer: atom$TextBuffer,
  offsets: OffsetMap,
  highlightedLines: {
    added: Array<number>,
    removed: Array<number>,
  },
  textContent?: string,
  inlineElements: EditorElementsMap,
  inlineOffsetElements: EditorElementsMap,
  readOnly: boolean,
  onDidChangeScrollTop?: () => mixed,
  onDidUpdateTextEditorElement: () => mixed,
};

export default class DiffViewEditorPane extends React.Component {
  props: Props;

  _diffViewEditor: DiffViewEditor;
  _subscriptions: UniversalDisposable;
  _editorSubscriptions: ?UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._subscriptions = new UniversalDisposable();
  }

  componentDidMount(): void {
    this._setupDiffEditor();
  }

  _setupDiffEditor(): void {
    const editorSubscriptions = this._editorSubscriptions = new UniversalDisposable();
    this._subscriptions.add(editorSubscriptions);

    const editorDomElement = this.getEditorDomElement();
    editorDomElement.classList.add(DIFF_EDITOR_MARKER_CLASS);
    this._diffViewEditor = new DiffViewEditor(editorDomElement);
    const textEditor = this.getEditorModel();

    /*
     * Those should have been synced automatically, but an implementation limitation of creating
     * a <atom-text-editor> element assumes default settings for those.
     * Filed: https://github.com/atom/atom/issues/10506
     */
    editorSubscriptions.add(atom.config.observe('editor.tabLength', tabLength => {
      textEditor.setTabLength(tabLength);
    }));
    editorSubscriptions.add(atom.config.observe('editor.softTabs', softTabs => {
      textEditor.setSoftTabs(softTabs);
    }));

    if (this.props.onDidChangeScrollTop != null) {
      editorSubscriptions.add(
        // Debounce for smooth scrolling without hogging the CPU.
        observableFromSubscribeFunction(
          editorDomElement.onDidChangeScrollTop.bind(editorDomElement),
        ).debounceTime(DEBOUNCE_SCROLL_MS)
        .subscribe(this.props.onDidChangeScrollTop),
      );
    }

    process.nextTick(() => this.props.onDidUpdateTextEditorElement());
    // TODO(most): Fix by listening to text editor rendering.
    editorSubscriptions.add(Observable.interval(100).first()
      .subscribe(() => this._setOffsets(this.props.offsets)));

    editorSubscriptions.add(() => this._diffViewEditor.destroy());
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }

  render(): React.Element<any> {
    const {isLoading} = this.props;
    const rootClassName = classnames({
      'nuclide-diff-editor-container': true,
      'nuclide-diff-view-editor-loading': isLoading,
    });

    const loadingIndicator = isLoading
      ? <div className="nuclide-diff-view-pane-loading-indicator">
          <LoadingSpinner delay={SPINNER_DELAY_MS} size={LoadingSpinnerSizes.LARGE} />
        </div>
      : null;

    return (
      <div className={rootClassName}>
        {loadingIndicator}
        <div className="nuclide-diff-editor-wrapper">
          <AtomTextEditor
            _alwaysUpdate={true}
            ref="editor"
            readOnly={this.props.readOnly}
            textBuffer={this.props.textBuffer}
            syncTextContents={false}
          />
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.textBuffer !== this.props.textBuffer) {
      const oldEditorSubscriptions = this._editorSubscriptions;
      if (oldEditorSubscriptions != null) {
        oldEditorSubscriptions.dispose();
        this._subscriptions.remove(oldEditorSubscriptions);
        this._editorSubscriptions = null;
      }
      this._setupDiffEditor();
    }
    this._updateDiffView(prevProps);
  }

  _updateDiffView(oldProps: Props): void {
    const newProps = this.props;
    // The Diff View can never edit the edited buffer contents.
    if (newProps.readOnly &&
      newProps.textContent != null &&
      oldProps.textContent !== newProps.textContent
    ) {
      this._setTextContent(newProps.filePath, newProps.textContent);
    }
    if (!mapEqual(oldProps.offsets, newProps.offsets)) {
      this._setOffsets(newProps.offsets);
    }
    if (!mapEqual(oldProps.inlineElements, newProps.inlineElements)) {
      this._diffViewEditor.setUiElements(newProps.inlineElements);
    }
    if (!mapEqual(oldProps.inlineOffsetElements, newProps.inlineOffsetElements)) {
      this._diffViewEditor.setOffsetUiElements(
        newProps.inlineOffsetElements,
        newProps.lineMapper,
      );
    }
    this._setHighlightedLines(newProps.highlightedLines);
  }

  _setTextContent(filePath: string, text: string): void {
    this._diffViewEditor.setFileContents(filePath, text);
  }

  _setHighlightedLines(highlightedLines: HighlightedLines): void {
    this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
  }

  _setOffsets(offsets: OffsetMap): void {
    this._diffViewEditor.setOffsets(offsets);
  }

  getEditorModel(): atom$TextEditor {
    return this.refs.editor.getModel();
  }

  getDiffEditor(): DiffViewEditor {
    return this._diffViewEditor;
  }

  getEditorDomElement(): atom$TextEditorElement {
    return this.refs.editor.getElement();
  }
}
