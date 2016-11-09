'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../../nuclide-ui/AtomTextEditor');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

const ENTER_KEY_CODE = 13;
const UP_KEY_CODE = 38;
const DOWN_KEY_CODE = 40;

let OutputTable = class OutputTable extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleTextEditor = this._handleTextEditor.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.state = {
      historyIndex: -1,
      draft: ''
    };
  }

  _handleTextEditor(component) {
    if (this._keySubscription) {
      this._textEditorModel = null;
      this._keySubscription.unsubscribe();
    }
    if (component) {
      this._textEditorModel = component.getModel();
      const el = _reactForAtom.ReactDOM.findDOMNode(component);
      this._keySubscription = _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'keydown').subscribe(this._handleKeyDown);
    }
  }

  _handleKeyDown(event) {
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
      this.setState({ historyIndex: -1 });
    } else if (event.which === UP_KEY_CODE) {
      if (this.props.history.length === 0) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      const historyIndex = Math.min(this.state.historyIndex + 1, this.props.history.length - 1);
      if (this.state.historyIndex === -1) {
        this.setState({ historyIndex: historyIndex, draft: editor.getText() });
      } else {
        this.setState({ historyIndex: historyIndex });
      }
      editor.setText(this.props.history[this.props.history.length - historyIndex - 1]);
    } else if (event.which === DOWN_KEY_CODE) {
      if (this.props.history.length === 0) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      const historyIndex = Math.max(this.state.historyIndex - 1, -1);
      this.setState({ historyIndex: historyIndex });
      if (historyIndex === -1) {
        editor.setText(this.state.draft);
      } else {
        editor.setText(this.props.history[this.props.history.length - historyIndex - 1]);
      }
    }
  }

  render() {
    const grammar = this.props.scopeName == null ? null : atom.grammars.grammarForScopeName(this.props.scopeName);
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-console-input-wrapper' },
      _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        ref: this._handleTextEditor,
        grammar: grammar,
        gutterHidden: true,
        autoGrow: true,
        lineNumberGutterVisible: false
      })
    );
  }

};
exports.default = OutputTable;
module.exports = exports['default'];