'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import type {HighlightedLines, OffsetMap, InlineComponent} from './types';

import {CompositeDisposable} from 'atom';
import {debounce} from '../../commons';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import DiffViewEditor from './DiffViewEditor';
import AtomTextEditor from '../../ui/atom-text-editor';
import invariant from 'assert';

const CHANGE_DEBOUNCE_DELAY_MS = 5;

type Props = {
  headerTitle: string,
  filePath: NuclideUri,
  textBuffer: atom$TextBuffer,
  offsets: OffsetMap,
  highlightedLines: {
    added: Array<number>,
    removed: Array<number>,
  },
  initialTextContent: string,
  savedContents: string,
  inlineElements: Array<InlineComponent>,
  handleNewOffsets: (newOffsets: OffsetMap) => any,
  readOnly: boolean,
  onChange: (newContents: string) => any,
  onDidUpdateTextEditorElement: () => mixed,
};

type State = {
  textContent: string,
};

/* eslint-disable react/prop-types */
export default class DiffViewEditorPane extends React.Component {
  props: Props;
  state: State;

  _diffViewEditor: ?DiffViewEditor;
  _subscriptions: CompositeDisposable;
  _editorSubscriptions: ?CompositeDisposable;
  // TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
  // All view changes should be pushed from the model/store through subscriptions.
  _isMounted: boolean;

  constructor(props: Props) {
    super(props);
    this.state = {
      textContent: this.props.initialTextContent,
    };
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

    const debouncedOnChange = debounce(
      () => {
        if (!this._isMounted || textEditor !== this.getEditorModel()) {
          return;
        }
        const textContent = textEditor.getText();
        if (textContent === this.state.textContent) {
          return;
        }
        this.setState({textContent});
        if (this.props.onChange) {
          this.props.onChange(textContent);
        }
      },
      CHANGE_DEBOUNCE_DELAY_MS,
      false,
    );
    editorSubscriptions.add(textEditor.onDidChange(debouncedOnChange));
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
      const textEditor = this.getEditorModel();
      textEditor.destroy();
      this._diffViewEditor = null;
    }
    this._isMounted = false;
  }

  render(): ReactElement {
    return (
      <div className="nuclide-diff-editor-container">
        <div className="panel-heading text-center nuclide-diff-editor-header">
          {this.props.headerTitle}
        </div>
        <div className="nuclide-diff-editor-wrapper">
          <AtomTextEditor
            ref="editor"
            readOnly={this.props.readOnly}
            textBuffer={this.props.textBuffer}
          />
        </div>
      </div>
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.initialTextContent !== nextProps.initialTextContent) {
      this.setState({textContent: nextProps.initialTextContent});
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.textBuffer !== this.props.textBuffer) {
      const oldEditorSubscriptions = this._editorSubscriptions;
      if (oldEditorSubscriptions != null) {
        oldEditorSubscriptions.dispose();
        this._subscriptions.remove(oldEditorSubscriptions);
        this._editorSubscriptions = null;
      }
      this._setupDiffEditor();
    }
    this._updateDiffView(prevProps, prevState);
  }

  _updateDiffView(oldProps: Props, oldState: State): void {
    const newProps = this.props;
    const newState = this.state;
    const diffEditorUpdated = oldProps.textBuffer !== newProps.textBuffer;
    // Cache latest disk contents for an accurate `isModified` functionality.
    newProps.textBuffer.cachedDiskContents = this.props.savedContents;
    if (diffEditorUpdated || oldProps.filePath !== newProps.filePath) {
      // Loading a new file should clear the undo history.
      this._setTextContent(newProps.filePath, newState.textContent, true /*clearHistory*/);
    } else if (newState.textContent !== oldState.textContent) {
      this._setTextContent(newProps.filePath, newState.textContent, false /*clearHistory*/);
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

  _setTextContent(filePath: string, text: string, clearHistory: boolean): void {
    invariant(this._diffViewEditor);
    this._diffViewEditor.setFileContents(filePath, text, clearHistory);
  }

  _setHighlightedLines(highlightedLines: HighlightedLines): void {
    invariant(this._diffViewEditor);
    this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
  }

  _setOffsets(offsets: OffsetMap): void {
    invariant(this._diffViewEditor);
    this._diffViewEditor.setOffsets(offsets);
  }

  async _renderComponentsInline(elements: Array<Object>): Promise {
    const diffViewEditor = this._diffViewEditor;
    invariant(diffViewEditor);
    const components = await diffViewEditor.renderInlineComponents(elements);
    if (!this._isMounted || elements.length === 0) {
      return;
    }

    diffViewEditor.attachInlineComponents(components);
    const offsetsFromComponents = new Map();

    // TODO(gendron):
    // The React components aren't actually rendered in the DOM until the
    // associated decorations are attached to the TextEditor.
    // (see DiffViewEditor.attachInlineComponents)
    // There's no easy way to listen for this event, so just wait 0.5s per component.
    setTimeout(() => {
      if (!this._isMounted) {
        return;
      }
      const editorWidth = this.getEditorDomElement().clientWidth;
      components.forEach(element => {
        const domNode = ReactDOM.findDOMNode(element.component);
        // get the height of the component after it has been rendered in the DOM
        const componentHeight = domNode.clientHeight;
        const lineHeight = diffViewEditor.getLineHeightInPixels();

        // TODO(gendron):
        // Set the width of the overlay so that it won't resize when we
        // type comment replies into the text editor.
        domNode.style.width = (editorWidth - 70) + 'px';

        // calculate the number of lines we need to insert in the buffer to make room
        // for the component to be displayed
        const offset = Math.ceil(componentHeight / lineHeight);
        const offsetRow = element.bufferRow;
        offsetsFromComponents.set(offsetRow, offset);

        // PhabricatorCommentsList is rendered with visibility: hidden.
        domNode.style.visibility = 'visible';
      });
      this.props.handleNewOffsets(offsetsFromComponents);
    }, components.length * 500);
  }

  getEditorModel(): atom$TextEditor {
    return this.refs['editor'].getModel();
  }

  getEditorDomElement(): atom$TextEditorElement {
    return this.refs['editor'].getElement();
  }
}
