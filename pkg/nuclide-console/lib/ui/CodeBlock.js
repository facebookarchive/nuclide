'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {AtomTextEditor} from '../../../nuclide-ui/lib/AtomTextEditor';
import {React} from 'react-for-atom';

type Props = {
  scopeName: ?string;
  text: string;
};

export default class CodeBlock extends React.Component {
  props: Props;

  _textEditor: ?atom$TextEditor;

  constructor(props: Props) {
    super(props);
    (this: any)._handleTextEditor = this._handleTextEditor.bind(this);
  }

  componentDidUpdate(): void {
    this._updateEditor();
  }

  _handleTextEditor(component: AtomTextEditor): void {
    if (component == null) {
      this._textEditor = null;
      return;
    }
    this._textEditor = component.getModel();
    this._updateEditor();
  }

  _updateEditor(): void {
    if (this._textEditor == null) {
      return;
    }
    this._textEditor.setText(this.props.text);
  }

  render() {
    const grammar = this.props.scopeName == null
      ? null : atom.grammars.grammarForScopeName(this.props.scopeName);
    return (
      <div className="nuclide-console-text-editor-wrapper">
        <AtomTextEditor
          ref={this._handleTextEditor}
          grammar={grammar}
          readOnly
          gutterHidden
          autoGrow
          lineNumberGutterVisible={false}
        />
      </div>
    );
  }
}
