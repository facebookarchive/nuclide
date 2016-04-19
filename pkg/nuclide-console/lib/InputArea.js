'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React, ReactDOM} from 'react-for-atom';
import {AtomTextEditor} from '../../nuclide-ui/lib/AtomTextEditor';
import Rx from '@reactivex/rxjs';
import {DisposableSubscription} from '../../nuclide-commons';

type Props = {
  onSubmit: (value: string) => mixed;
  scopeName: ?string;
};

const ENTER_KEY_CODE = 13;

export default class OutputTable extends React.Component {
  props: Props;

  _keySubscription: ?IDisposable;
  _textEditorModel: ?atom$TextEditor;

  constructor(props: Props) {
    super(props);
    (this: any)._handleTextEditor = this._handleTextEditor.bind(this);
    (this: any)._handleKeyDown = this._handleKeyDown.bind(this);
  }

  _handleTextEditor(component: ?AtomTextEditor): void {
    if (this._keySubscription) {
      this._textEditorModel = null;
      this._keySubscription.dispose();
    }
    if (component) {
      this._textEditorModel = component.getModel();
      const el = ReactDOM.findDOMNode(component);
      this._keySubscription = new DisposableSubscription(
        Rx.Observable.fromEvent(el, 'keydown').subscribe(this._handleKeyDown),
      );
    }
  }

  _handleKeyDown(event: KeyboardEvent): void {
    const editor = this._textEditorModel;
    if (editor == null) {
      return;
    }
    if (event.which === ENTER_KEY_CODE) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.ctrlKey) {
        editor.insertNewline();
        return;
      }

      // Clear the text and trigger the `onSubmit` callback
      const text = editor.getText();

      if (text === '') {
        return;
      }

      editor.setText(''); // Clear the text field.
      this.props.onSubmit(text);
    }
  }

  render(): ?React.Element {
    const grammar = this.props.scopeName == null
      ? null : atom.grammars.grammarForScopeName(this.props.scopeName);
    return (
      <div className="nuclide-console-input-wrapper">
        <AtomTextEditor
          ref={this._handleTextEditor}
          grammar={grammar}
          gutterHidden
          autoGrow
          lineNumberGutterVisible={false}
        />
      </div>
    );
  }

}
