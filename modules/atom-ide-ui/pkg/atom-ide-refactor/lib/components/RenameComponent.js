"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("../../../../../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class RenameComponent extends React.Component {
  constructor(props) {
    super(props);

    this._forceActivateInsertMode = () => {
      const {
        parentEditor
      } = this.props;

      if (parentEditor != null) {
        atom.commands.dispatch(atom.views.getView(parentEditor), 'vim-mode-plus:activate-insert-mode');
      }
    };

    this._highlightTextWithin = () => {
      if (this._atomInput == null) {
        return;
      }

      const editor = this._atomInput.getTextEditor();

      editor.selectAll();
    };

    this._handleSubmit = event => {
      if (event == null) {
        return;
      }

      const {
        newName
      } = this.state;
      const {
        store
      } = this.props;
      const renameRequest = {
        kind: 'rename',
        newName,
        editor: this.props.parentEditor,
        position: this.props.symbolPosition
      };
      return newName === '' ? store.dispatch(Actions().close()) : store.dispatch(Actions().execute(this.props.provider, renameRequest));
    };

    this._handleCancel = event => {
      if (event == null) {
        return;
      }

      this.props.store.dispatch(Actions().close());
    };

    this._handleChange = text => {
      this.setState({
        newName: text
      });
    };

    this._handleBlur = event => {
      this.props.store.dispatch(Actions().close());
    };

    this.state = {
      newName: this.props.selectedText
    };
  }

  componentDidMount() {
    this._forceActivateInsertMode();

    this._highlightTextWithin();
  } // When using the `vim-mode-plus` package, the user has to press 'i' in 'normal-mode'
  //  to begin inserting text in an atom-text-editor - doing so sends
  //  an 'activate-insert-mode' command.
  // However, when the user wants to type in embedded text editors,
  //  we must first activate `insert-mode` in the parent editor.


  render() {
    // TODO: Adjust width automatically through property within AtomInput/AtomTextEditor
    //       AtomTextEditor's autoWidth doesn't work here when enabled through AtomInput.
    //       This is a hacky solution for now for the sake of decent UX.
    const widthStyle = {
      minWidth: '110px',
      width: `${this.state.newName.length * 0.675}em`,
      maxWidth: '350px'
    };
    return React.createElement(_AtomInput().AtomInput, {
      ref: atomInput => this._atomInput = atomInput,
      style: widthStyle,
      autofocus: true,
      value: this.state.newName,
      onDidChange: this._handleChange,
      onBlur: this._handleBlur,
      onConfirm: this._handleSubmit,
      onCancel: this._handleCancel
    });
  }

}

exports.default = RenameComponent;