'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import invariant from 'assert';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import {TextBuffer} from 'atom';
import {createTextEditor} from '../../../atom-helpers';

const {PropTypes} = React;

function setupTextEditor(props: Object): atom$TextEditor {
  const textBuffer = props.textBuffer || new TextBuffer();
  if (props.path) {
    textBuffer.setPath(props.path);
  }

  const textEditorParams = {
    buffer: textBuffer,
    lineNumberGutterVisible: !props.gutterHidden,
  };
  const textEditor = createTextEditor(textEditorParams);

  // As of the introduction of atom.workspace.buildTextEditor(), it is no longer possible to
  // subclass TextEditor to create a ReadOnlyTextEditor. Instead, the way to achieve this effect
  // is to create an ordinary TextEditor and then override any methods that would allow it to
  // change its contents.
  // TODO: https://github.com/atom/atom/issues/9237.
  if (props.readOnly) {
    // Cancel insert events to prevent typing in the text editor and disallow editing (read-only).
    textEditor.onWillInsertText(event => {
      event.cancel();
    });

    const doNothing = () => {};

    // Make pasting in the text editor a no-op to disallow editing (read-only).
    textEditor.pasteText = doNothing;

    // Make delete key presses in the text editor a no-op to disallow editing (read-only).
    textEditor.delete = doNothing;

    // Make backspace key presses in the text editor a no-op to disallow editing (read-only).
    textEditor.backspace = doNothing;

    // Make duplicate lines, triggering a buffer insert a no-op to disallow editing (read-only).
    textEditor.getBuffer().insert = doNothing;
    textEditor.getBuffer().delete = doNothing;

    // Remove the cursor line decorations because that's distracting in read-only mode.
    textEditor.getDecorations({class: 'cursor-line'}).forEach(decoration => {
      decoration.destroy();
    });
  }

  return textEditor;
}

class AtomTextEditor extends React.Component {

  _textEditorElement: ?atom$TextEditorElement;

  static propTypes = {
    gutterHidden: PropTypes.bool.isRequired,
    path: PropTypes.string,
    readOnly: PropTypes.bool.isRequired,
    textBuffer: PropTypes.instanceOf(TextBuffer),
  };

  static defaultProps = {
    gutterHidden: false,
    lineNumberGutterVisible: true,
    readOnly: false,
  };

  constructor(props: Object) {
    super(props);
  }

  componentDidMount(): void {
    this._updateTextEditor(setupTextEditor(this.props));
  }

  _updateTextEditor(textEditor: atom$TextEditor): void {
    const container = ReactDOM.findDOMNode(this);
    const textEditorElement: atom$TextEditorElement = this._textEditorElement =
      (document.createElement('atom-text-editor'): any);
    textEditorElement.setModel(textEditor);
    // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
    // TextEditor (that we cannot override), which is responsible for creating the view associated
    // with the TextEditor that we create and adding a mapping for it in its private views map.
    // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
    // the map manually. Filed as https://github.com/atom/atom/issues/7954.
    // $FlowFixMe
    atom.views.views.set(textEditor, textEditorElement);
    // Attach to DOM.
    container.innerHTML = '';
    textEditorElement.style.height = '100%';
    textEditorElement.style.overflow = 'hidden';
    container.appendChild(textEditorElement);
  }

  componentWillReceiveProps(nextProps: Object): void {
    if (nextProps.textBuffer !== this.props.textBuffer) {
      this._updateTextEditor(setupTextEditor(nextProps));
    }
    if (nextProps.path !== this.props.path) {
      this.getTextBuffer().setPath(nextProps.path);
    }
    if (nextProps.gutterHidden !== this.props.gutterHidden) {
      this.getModel().setLineNumberGutterVisible(nextProps.gutterHidden);
    }
  }

  getTextBuffer(): atom$TextBuffer {
    return this.getModel().getBuffer();
  }

  getModel(): atom$TextEditor {
    return this.getElement().getModel();
  }

  getElement(): atom$TextEditorElement {
    invariant(this._textEditorElement);
    return this._textEditorElement;
  }

  render(): ReactElement {
    return (
      <div />
    );
  }

  // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
  // should always pass because this subtree won't change.
  shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
    return false;
  }

}

module.exports = AtomTextEditor;
