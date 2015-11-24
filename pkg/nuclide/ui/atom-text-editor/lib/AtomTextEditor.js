'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react-for-atom';
import {TextBuffer} from 'atom';
import {createTextEditor} from 'nuclide-atom-helpers';

const {PropTypes} = React;

class AtomTextEditor extends React.Component {

  _textBuffer: TextBuffer;
  _textEditorModel: TextEditor;

  // $FlowIssue t8486988
  static propTypes = {
    gutterHidden: PropTypes.bool.isRequired,
    path: PropTypes.string,
    readOnly: PropTypes.bool.isRequired,
    textBuffer: PropTypes.instanceOf(TextBuffer),
  };

  // $FlowIssue t8486988
  static defaultProps = {
    gutterHidden: false,
    lineNumberGutterVisible: true,
    readOnly: false,
  };

  constructor(props: Object) {
    super(props);

    this._textBuffer = props.textBuffer || new TextBuffer();
    if (props.path) {
      this._textBuffer.setPath(props.path);
    }

    const textEditorParams = {
      buffer: this._textBuffer,
      lineNumberGutterVisible: !this.props.gutterHidden,
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
    }

    this._textEditorModel = textEditor;
  }

  componentDidMount(): void {
    const atomTextEditorElement = React.findDOMNode(this);
    atomTextEditorElement.setModel(this._textEditorModel);

    // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
    // TextEditor (that we cannot override), which is responsible for creating the view associated
    // with the TextEditor that we create and adding a mapping for it in its private views map.
    // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
    // the map manually. Filed as https://github.com/atom/atom/issues/7954.
    // $FlowFixMe
    atom.views.views.set(this._textEditorModel, atomTextEditorElement);
  }

  componentWillReceiveProps(nextProps: Object): void {
    if (nextProps.path !== this.props.path) {
      this._textBuffer.setPath(nextProps.path);
    }
    if (nextProps.gutterHidden !== this.props.gutterHidden) {
      this._textEditorModel.setLineNumberGutterVisible(nextProps.gutterHidden);
    }
  }

  componentWillUnmount(): void {
    this._textEditorModel.destroy();
  }

  getTextBuffer(): TextBuffer {
    return this._textBuffer;
  }

  getModel(): TextEditor {
    return this._textEditorModel;
  }

  render(): ReactElement {
    return (
      <atom-text-editor />
    );
  }

  // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
  // should always pass because this subtree won't change.
  shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
    return false;
  }

}

module.exports = AtomTextEditor;
