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

import invariant from 'assert';
import classnames from 'classnames';
import * as React from 'react';
import {TextBuffer} from 'atom';
import {
  enforceReadOnlyEditor,
  enforceSoftWrap,
} from 'nuclide-commons-atom/text-editor';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';
import atomTabIndexForwarder from './atomTabIndexForwarder';

const doNothing = () => {};

type TextEditorSetup = {
  disposables: IDisposable,
  textEditor: atom$TextEditor,
};

function setupTextEditor(props: Props): TextEditorSetup {
  const textBuffer = props.textBuffer || new TextBuffer();
  // flowlint-next-line sketchy-null-string:off
  if (props.path) {
    // $FlowIgnore
    textBuffer.setPath(props.path);
  }

  const disposables = new UniversalDisposable();
  if (props.onDidTextBufferChange != null) {
    disposables.add(textBuffer.onDidChangeText(props.onDidTextBufferChange));
  }

  const textEditorParams = {
    buffer: textBuffer,
    lineNumberGutterVisible: !props.gutterHidden,
    autoHeight: props.autoGrow,
  };
  const textEditor: atom$TextEditor = atom.workspace.buildTextEditor(
    textEditorParams,
  );
  disposables.add(() => textEditor.destroy());
  if (props.grammar != null) {
    textEditor.setGrammar(props.grammar);
  } else {
    atom.grammars.autoAssignLanguageMode(textBuffer);
  }
  disposables.add(enforceSoftWrap(textEditor, props.softWrapped));

  // flowlint-next-line sketchy-null-string:off
  if (props.placeholderText) {
    textEditor.setPlaceholderText(props.placeholderText);
  }

  if (props.readOnly) {
    enforceReadOnlyEditor(textEditor);

    // Remove the cursor line decorations because that's distracting in read-only mode.
    textEditor.getDecorations({class: 'cursor-line'}).forEach(decoration => {
      decoration.destroy();
    });
  }
  return {
    disposables,
    textEditor,
  };
}

type DefaultProps = {
  autoGrow: boolean,
  correctContainerWidth: boolean,
  disabled: boolean,
  gutterHidden: boolean,
  lineNumberGutterVisible: boolean,
  readOnly: boolean,
  syncTextContents: boolean,
  tabIndex: string,
  softWrapped: boolean,
};

type Props = {
  autoGrow: boolean,
  className?: string,
  correctContainerWidth: boolean,
  disabled: boolean,
  gutterHidden: boolean,
  grammar?: ?Object,
  // these are processed in setupTextEditor below
  /* eslint-disable react/no-unused-prop-types */
  onDidTextBufferChange?: ?(event: atom$AggregatedTextEditEvent) => mixed,
  path?: string,
  placeholderText?: string,
  syncTextContents: boolean,
  /* eslint-enable react/no-unused-prop-types */
  readOnly: boolean,
  textBuffer?: TextBuffer,
  tabIndex: string,
  softWrapped: boolean,
  onConfirm?: () => mixed,
  // Called with text editor  as input after initializing and attaching to DOM.
  onInitialized?: atom$TextEditor => IDisposable,
};

export class AtomTextEditor extends React.Component<Props, void> {
  static defaultProps: DefaultProps = {
    correctContainerWidth: true,
    disabled: false,
    gutterHidden: false,
    lineNumberGutterVisible: true,
    readOnly: false,
    autoGrow: false,
    syncTextContents: true,
    tabIndex: '0', // Keep in line with other input elements.
    softWrapped: false,
  };

  _rootElement: ?HTMLDivElement;
  _textEditorElement: ?atom$TextEditorElement;
  _editorDisposables: UniversalDisposable;

  componentDidMount(): void {
    this._editorDisposables = new UniversalDisposable();
    this._updateTextEditor(setupTextEditor(this.props));
    this._onDidUpdateTextEditorElement(this.props);
    if (this.props.disabled) {
      this._updateDisabledState(true);
    }
  }

  _updateTextEditor(setup: TextEditorSetup): void {
    const container = this._rootElement;
    if (container == null) {
      return;
    }

    this._editorDisposables.dispose();
    const {textEditor, disposables} = setup;

    this._editorDisposables = new UniversalDisposable(disposables);

    const textEditorElement: atom$TextEditorElement = (this._textEditorElement = (document.createElement(
      'atom-text-editor',
    ): any));

    // Make tab move to next element instead of inserting a 'tab' character
    this._editorDisposables.add(
      // Make AtomTextEditor properly shift-tabbable
      atomTabIndexForwarder(textEditorElement),
      // Make 'Tab' change focus instead of inserting tab character
      Observable.fromEvent(textEditorElement, 'keydown').subscribe(event => {
        if (event.key === 'Tab') {
          event.stopPropagation();
        }
      }),
    );

    textEditorElement.setModel(textEditor);
    textEditorElement.setAttribute('tabindex', this.props.tabIndex);
    // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
    // TextEditor (that we cannot override), which is responsible for creating the view associated
    // with the TextEditor that we create and adding a mapping for it in its private views map.
    // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
    // the map manually. Filed as https://github.com/atom/atom/issues/7954.
    // $FlowFixMe
    atom.views.views.set(textEditor, textEditorElement);

    if (this.props.correctContainerWidth) {
      this._editorDisposables.add(
        textEditorElement.onDidAttach(() => {
          const correctlySizedElement = textEditorElement.querySelector(
            '.lines > :first-child',
          );
          if (correctlySizedElement == null) {
            return;
          }
          container.style.width = correctlySizedElement.style.width;
        }),
      );
    }

    // Attach to DOM.
    container.innerHTML = '';
    container.appendChild(textEditorElement);

    if (this.props.onConfirm != null) {
      this._editorDisposables.add(
        atom.commands.add(textEditorElement, {
          'core:confirm': () => {
            invariant(this.props.onConfirm != null);
            this.props.onConfirm();
          },
        }),
      );
    }

    if (this.props.onInitialized != null) {
      this._editorDisposables.add(this.props.onInitialized(textEditor));
    }
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      this.props.textBuffer !== prevProps.textBuffer ||
      this.props.readOnly !== prevProps.readOnly
    ) {
      const previousTextContents = this.getTextBuffer().getText();
      const nextTextContents =
        this.props.textBuffer == null
          ? this.props.textBuffer
          : this.props.textBuffer.getText();
      if (nextTextContents !== previousTextContents) {
        const textEditorSetup = setupTextEditor(this.props);

        if (this.props.syncTextContents) {
          textEditorSetup.textEditor.setText(previousTextContents);
        }
        this._updateTextEditor(textEditorSetup);
        this._onDidUpdateTextEditorElement(this.props);
      }
    }
    if (this.props.path !== prevProps.path) {
      // $FlowIgnore
      this.getTextBuffer().setPath(this.props.path || '');
    }
    if (this.props.gutterHidden !== prevProps.gutterHidden) {
      this.getModel().setLineNumberGutterVisible(this.props.gutterHidden);
    }
    if (this.props.grammar !== prevProps.grammar) {
      this.getModel().setGrammar(this.props.grammar);
    }
    if (this.props.softWrapped !== prevProps.softWrapped) {
      this.getModel().setSoftWrapped(this.props.softWrapped);
    }
    if (this.props.disabled !== prevProps.disabled) {
      this._updateDisabledState(this.props.disabled);
    }
    if (this.props.placeholderText !== prevProps.placeholderText) {
      this.getModel().setPlaceholderText(this.props.placeholderText || '');
      this.getModel().scheduleComponentUpdate();
    }
  }

  _onDidUpdateTextEditorElement(props: Props): void {
    if (!props.readOnly) {
      return;
    }
    // TODO(most): t9929679 Remove this hack when Atom has a blinking cursor configuration API.
    const {component} = this.getElement();
    if (component == null) {
      return;
    }
    if (component.startCursorBlinking) {
      component.startCursorBlinking = doNothing;
      component.stopCursorBlinking();
    } else {
      const {presenter} = component;
      if (presenter == null) {
        return;
      }
      presenter.startBlinkingCursors = doNothing;
      presenter.stopBlinkingCursors(false);
    }
  }

  _updateDisabledState(isDisabled: boolean): void {
    // Hack to set TextEditor to read-only mode, per https://github.com/atom/atom/issues/6880
    if (isDisabled) {
      this.getElement().removeAttribute('tabindex');
    } else {
      this.getElement().setAttribute('tabindex', this.props.tabIndex);
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

  render(): React.Node {
    const className = classnames(
      this.props.className,
      'nuclide-text-editor-container',
      {
        'no-auto-grow': !this.props.autoGrow,
      },
    );
    return (
      <div
        className={className}
        ref={rootElement => (this._rootElement = rootElement)}
      />
    );
  }

  // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
  // should always pass because this subtree won't change.
  shouldComponentUpdate(nextProps: Object, nextState: void): boolean {
    return false;
  }

  componentWillUnmount(): void {
    process.nextTick(() => this._editorDisposables.dispose());
  }
}
