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
import classnames from 'classnames';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import semver from 'semver';
import {TextBuffer} from 'atom';

const doNothing = () => {};

function setupTextEditor(props: Props): atom$TextEditor {
  const textBuffer = props.textBuffer || new TextBuffer();
  if (props.path) {
    textBuffer.setPath(props.path);
  }

  if (props.onDidTextBufferChange != null) {
    textBuffer.onDidChange(props.onDidTextBufferChange);
  }

  const textEditorParams = {
    buffer: textBuffer,
    lineNumberGutterVisible: !props.gutterHidden,
  };
  const textEditor: atom$TextEditor = atom.workspace.buildTextEditor(textEditorParams);

  if (props.grammar != null) {
    textEditor.setGrammar(props.grammar);
  }
  textEditor.setSoftWrapped(props.softWrapped);

  if (props.placeholderText) {
    textEditor.setPlaceholderText(props.placeholderText);
  }

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

    // Make pasting in the text editor a no-op to disallow editing (read-only).
    textEditor.pasteText = doNothing;

    // Make delete key presses in the text editor a no-op to disallow editing (read-only).
    textEditor.delete = doNothing;

    // Make backspace key presses in the text editor a no-op to disallow editing (read-only).
    textEditor.backspace = doNothing;

    // Make duplicate lines a no-op to disallow editing (read-only).
    textEditor.duplicateLines = doNothing;

    // Remove the cursor line decorations because that's distracting in read-only mode.
    textEditor.getDecorations({class: 'cursor-line'}).forEach(decoration => {
      decoration.destroy();
    });
  }

  return textEditor;
}

type DefaultProps = {
  _alwaysUpdate: boolean,
  autoGrow: boolean,
  gutterHidden: boolean,
  lineNumberGutterVisible: boolean,
  readOnly: boolean,
  syncTextContents: boolean,
  tabIndex: string,
  softWrapped: boolean,
};

type Props = {
  // `_alwaysUpdate` forces calls to `setupEditor` to always run when props change.
  // TODO jxg remove once the diff view no longer relies on it.
  _alwaysUpdate: boolean,
  autoGrow: boolean,
  className?: string,
  gutterHidden: boolean,
  grammar?: ?Object,
  onDidTextBufferChange?: (event: atom$TextEditEvent) => mixed,
  path?: string,
  placeholderText?: string,
  readOnly: boolean,
  textBuffer?: TextBuffer,
  syncTextContents: boolean,
  tabIndex: string,
  softWrapped: boolean,
};

export class AtomTextEditor extends React.Component {
  static defaultProps: DefaultProps = {
    _alwaysUpdate: false,
    gutterHidden: false,
    lineNumberGutterVisible: true,
    readOnly: false,
    autoGrow: false,
    syncTextContents: true,
    tabIndex: '0',  // Keep in line with other input elements.
    softWrapped: false,
  };

  props: Props;
  _onDidAttachDisposable: ?IDisposable;
  _textEditorElement: ?atom$TextEditorElement;

  componentDidMount(): void {
    this._updateTextEditor(setupTextEditor(this.props));
    this._onDidUpdateTextEditorElement(this.props);
  }

  _updateTextEditor(textEditor: atom$TextEditor): void {
    const container = ReactDOM.findDOMNode(this);
    const textEditorElement: atom$TextEditorElement = this._textEditorElement =
      (document.createElement('atom-text-editor'): any);
    textEditorElement.setModel(textEditor);
    textEditorElement.setAttribute('tabindex', this.props.tabIndex);
    // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
    // TextEditor (that we cannot override), which is responsible for creating the view associated
    // with the TextEditor that we create and adding a mapping for it in its private views map.
    // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
    // the map manually. Filed as https://github.com/atom/atom/issues/7954.
    // $FlowFixMe
    atom.views.views.set(textEditor, textEditorElement);
    // Attach to DOM.
    container.innerHTML = '';
    container.appendChild(textEditorElement);

    // The following is a hack to work around the broken atom-text-editor auto-sizing in Atom 1.9.x
    // See https://github.com/atom/atom/issues/12441 to follow the proper fix.
    // TODO @jxg remove once atom-text-editor is fixed.
    if (semver.lt(atom.getVersion(), '1.9.0')) {
      return;
    }
    this._ensureDidAttachDisposableDisposed();
    this._onDidAttachDisposable = textEditorElement.onDidAttach(() => {
      const correctlySizedElement = textEditorElement.querySelector(
        '* /deep/ .lines > :first-child > :first-child',
      );
      if (correctlySizedElement == null) {
        return;
      }
      const {width} = correctlySizedElement.style;
      container.style.width = width;
    });
  }

  componentWillReceiveProps(nextProps: Object): void {
    if (
        nextProps.textBuffer !== this.props.textBuffer ||
        nextProps.readOnly !== this.props.readOnly
      ) {
      const previousTextContents = this.getTextBuffer().getText();
      const nextTextContents = nextProps.textBuffer == null
        ? nextProps.textBuffer
        : nextProps.textBuffer.getText();
      if (nextProps._alwaysUpdate || nextTextContents !== previousTextContents) {
        const textEditor = setupTextEditor(nextProps);
        if (nextProps.syncTextContents) {
          textEditor.setText(previousTextContents);
        }
        this._updateTextEditor(textEditor);
        this._onDidUpdateTextEditorElement(nextProps);
      }
    }
    if (nextProps.path !== this.props.path) {
      this.getTextBuffer().setPath(nextProps.path);
    }
    if (nextProps.gutterHidden !== this.props.gutterHidden) {
      this.getModel().setLineNumberGutterVisible(nextProps.gutterHidden);
    }
    if (nextProps.grammar !== this.props.grammar) {
      this.getModel().setGrammar(nextProps.grammar);
    }
    if (nextProps.softWrapped !== this.props.softWrapped) {
      this.getModel().setSoftWrapped(nextProps.softWrapped);
    }
  }

  _onDidUpdateTextEditorElement(props: Object): void {
    if (!props.readOnly) {
      return;
    }
    // TODO(most): t9929679 Remove this hack when Atom has a blinking cursor configuration API.
    const {component} = this.getElement();
    if (component == null) {
      return;
    }
    const {presenter} = component;
    presenter.startBlinkingCursors = doNothing;
    presenter.stopBlinkingCursors(false);
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

  render(): React.Element<any> {
    const className = classnames(
      this.props.className,
      'nuclide-text-editor-container',
      {
        'no-auto-grow': !this.props.autoGrow,
      },
    );
    return (
      <div className={className} />
    );
  }

  // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
  // should always pass because this subtree won't change.
  shouldComponentUpdate(nextProps: Object, nextState: void): boolean {
    return false;
  }

  componentWillUnmount(): void {
    this._ensureDidAttachDisposableDisposed();
  }

  _ensureDidAttachDisposableDisposed(): void {
    if (this._onDidAttachDisposable != null) {
      this._onDidAttachDisposable.dispose();
    }
  }

}
