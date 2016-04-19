'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {HighlightedLines, OffsetMap} from './types';
import type {UIElement} from '../../nuclide-diff-ui-provider-interfaces';

import {CompositeDisposable} from 'atom';
import {debounce} from '../../nuclide-commons';
import {
  React,
} from 'react-for-atom';
import DiffViewEditor from './DiffViewEditor';
import {AtomTextEditor} from '../../nuclide-ui/lib/AtomTextEditor';
import invariant from 'assert';

const CHANGE_DEBOUNCE_DELAY_MS = 5;

type Props = {
  filePath: NuclideUri;
  textBuffer: atom$TextBuffer;
  offsets: OffsetMap;
  highlightedLines: {
    added: Array<number>;
    removed: Array<number>;
  };
  initialTextContent: string;
  savedContents: string;
  inlineElements: Array<UIElement>;
  readOnly: boolean;
  onChange: (newContents: string) => any;
  onDidUpdateTextEditorElement: () => mixed;
};

export default class DiffViewEditorPane extends React.Component {
  props: Props;

  _diffViewEditor: ?DiffViewEditor;
  _subscriptions: CompositeDisposable;
  _editorSubscriptions: ?CompositeDisposable;
  // TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
  // All view changes should be pushed from the model/store through subscriptions.
  _isMounted: boolean;

  constructor(props: Props) {
    super(props);
    this._subscriptions = new CompositeDisposable();
    this._isMounted = false;
  }

  componentDidMount(): void {
    this._isMounted = true;
    this._setupDiffEditor();
  }

  _setupDiffEditor(): void {
    const editorSubscriptions = this._editorSubscriptions = new CompositeDisposable();
    this._subscriptions.add(editorSubscriptions);

    this._diffViewEditor = new DiffViewEditor(this.getEditorDomElement());
    const textEditor = this.getEditorModel();
    const textBuffer = textEditor.getBuffer();

    const debouncedOnChange = debounce(
      () => {
        if (!this._isMounted || textBuffer !== this.props.textBuffer) {
          return;
        }
        const textContent = textBuffer.getText();
        if (textContent === this.props.initialTextContent) {
          return;
        }
        if (this.props.onChange) {
          this.props.onChange(textContent);
        }
      },
      CHANGE_DEBOUNCE_DELAY_MS,
      false,
    );
    editorSubscriptions.add(textBuffer.onDidChange(debouncedOnChange));
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

    if (this.props.onDidUpdateTextEditorElement) {
      this.props.onDidUpdateTextEditorElement();
    }
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
    if (this._diffViewEditor != null) {
      this._diffViewEditor.destroy();
      this._diffViewEditor = null;
    }
    this._isMounted = false;
  }

  render(): React.Element {
    return (
      <div className="nuclide-diff-editor-container">
        <div className="nuclide-diff-editor-wrapper">
          <AtomTextEditor
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
    const diffEditorUpdated = oldProps.textBuffer !== newProps.textBuffer;
    if (diffEditorUpdated || oldProps.initialTextContent !== this.props.initialTextContent) {
      this._setTextContent(newProps.filePath, newProps.initialTextContent);
    }
    if (diffEditorUpdated || oldProps.highlightedLines !== newProps.highlightedLines) {
      this._setHighlightedLines(newProps.highlightedLines);
    }
    if (diffEditorUpdated || oldProps.offsets !== newProps.offsets) {
      this._setOffsets(newProps.offsets);
    }
    if (oldProps.inlineElements !== newProps.inlineElements) {
      this._renderComponentsInline(newProps.inlineElements);
    }
  }

  scrollToScreenLine(screenLine: number): void {
    invariant(this._diffViewEditor, 'diffViewEditor has not been setup yet.');
    this._diffViewEditor.scrollToScreenLine(screenLine);
  }

  _setTextContent(filePath: string, text: string): void {
    invariant(this._diffViewEditor);
    this._diffViewEditor.setFileContents(filePath, text);
  }

  _setHighlightedLines(highlightedLines: HighlightedLines): void {
    invariant(this._diffViewEditor);
    this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
  }

  _setOffsets(offsets: OffsetMap): void {
    invariant(this._diffViewEditor);
    this._diffViewEditor.setOffsets(offsets);
  }

  _renderComponentsInline(elements: Array<UIElement>): void {
    if (!this._isMounted || elements.length === 0) {
      return;
    }
    invariant(this._diffViewEditor, 'diffViewEditor has not been setup yet.');
    this._diffViewEditor.setUIElements(elements);
  }

  getEditorModel(): atom$TextEditor {
    return this.refs['editor'].getModel();
  }

  getEditorDomElement(): atom$TextEditorElement {
    return this.refs['editor'].getElement();
  }
}
