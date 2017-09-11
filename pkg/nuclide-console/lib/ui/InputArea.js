'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('nuclide-commons-ui/AtomTextEditor');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const ENTER_KEY_CODE = 13;
const UP_KEY_CODE = 38;
const DOWN_KEY_CODE = 40;

class OutputTable extends _react.Component {

  constructor(props) {
    super(props);

    this._handleTextEditor = component => {
      if (this._keySubscription) {
        this._textEditorModel = null;
        this._keySubscription.unsubscribe();
      }
      if (component) {
        this._textEditorModel = component.getModel();
        const el = _reactDom.default.findDOMNode(component);
        this._keySubscription = _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'keydown').subscribe(this._handleKeyDown);
      }
    };

    this._handleKeyDown = event => {
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
          this.setState({ historyIndex, draft: editor.getText() });
        } else {
          this.setState({ historyIndex });
        }
        editor.setText(this.props.history[this.props.history.length - historyIndex - 1]);
      } else if (event.which === DOWN_KEY_CODE) {
        if (this.props.history.length === 0) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        const historyIndex = Math.max(this.state.historyIndex - 1, -1);
        this.setState({ historyIndex });
        if (historyIndex === -1) {
          editor.setText(this.state.draft);
        } else {
          editor.setText(this.props.history[this.props.history.length - historyIndex - 1]);
        }
      }
    };

    this.state = {
      historyIndex: -1,
      draft: ''
    };
  }

  render() {
    const grammar = this.props.scopeName == null ? null : atom.grammars.grammarForScopeName(this.props.scopeName);
    return _react.createElement(
      'div',
      { className: 'nuclide-console-input-wrapper' },
      _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        ref: this._handleTextEditor,
        grammar: grammar,
        gutterHidden: true,
        autoGrow: true,
        lineNumberGutterVisible: false
      })
    );
  }
}
exports.default = OutputTable;