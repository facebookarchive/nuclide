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
import React, {PropTypes} from 'react-for-atom';
import DiffViewEditor from './DiffViewEditor';
import invariant from 'assert';

const CHANGE_DEBOUNCE_DELAY_MS = 100;

type Props = {
  filePath: NuclideUri,
  offsets: OffsetMap,
  highlightedLines: {
    added: Array<number>;
    removed: Array<number>;
  },
  initialTextContent: string;
  inlineElements: Array<InlineComponent>;
  handleNewOffsets: (newOffsets: OffsetMap) => any,
  readOnly: boolean,
  onChange: (newContents: string) => any,
};

type State = {
  textContent: string;
};

/* eslint-disable react/prop-types */
export default class DiffViewEditorPane extends React.Component {
  props: Props;
  state: State;

  _diffViewEditor: ?DiffViewEditor;
  _subscriptions: CompositeDisposable;
  // TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
  // All view changes should be pushed from the model/store through subscriptions.
  _isMounted: boolean;

  constructor(props: Props) {
    super(props);
    this.state = {
      textContent: this.props.initialTextContent,
    };
    this._isMounted = false;
    this._subscriptions = new CompositeDisposable();
  }

  componentDidMount(): void {
    this._isMounted = true;
    const diffViewEditor = this._diffViewEditor = new DiffViewEditor(this.getEditorDomElement());
    const textEditor = this.getEditorModel();
    const debouncedOnChange = debounce(
      () => {
        const textContent = textEditor.getText();
        this.setState({textContent});
        if (this.props.onChange) {
          this.props.onChange(textContent);
        }
      },
      CHANGE_DEBOUNCE_DELAY_MS,
      false,
    );
    if (this.props.readOnly) {
      diffViewEditor.setReadOnly();
    }
    this._subscriptions.add(textEditor.onDidChange(debouncedOnChange));
    this._updateDiffView(this.props, this.state);
  }

  componentWillUnmount(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
    }
    if (this._diffViewEditor) {
      const textEditor = this.getEditorModel();
      textEditor.destroy();
      this._diffViewEditor = null;
    }
    this._isMounted = false;
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
    return false;
  }

  render(): ReactElement {
    return (
      <atom-text-editor ref="editor" style={{height: '100%', overflow: 'hidden'}} />
    );
  }

  componentWillReceiveProps(newProps: Object): void {
    let newState = this.state;
    if (newProps.initialTextContent !== this.state.textContent) {
      newState = {textContent: newProps.initialTextContent};
      this.setState(newState);
      this._setTextContent(newProps.filePath, newState.textContent, false /*clearHistory*/);
    }
    this._updateDiffView(newProps, newState);
  }

  _updateDiffView(newProps: Object, newState: Object): void {
    const oldProps = this.props;
    if (oldProps.filePath !== newProps.filePath) {
      // Loading a new file should clear the undo history.
      this._setTextContent(newProps.filePath, newState.textContent, true /*clearHistory*/);
    }
    if (oldProps.highlightedLines !== newProps.highlightedLines) {
      this._setHighlightedLines(newProps.highlightedLines);
    }
    if (oldProps.offsets !== newProps.offsets) {
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
    if (!this._isMounted) {
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
        const domNode = React.findDOMNode(element.component);
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
    invariant(this._diffViewEditor);
    return this._diffViewEditor.getModel();
  }

  getEditorDomElement(): atom$TextEditorElement {
    return React.findDOMNode(this.refs['editor']);
  }
}
