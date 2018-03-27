'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RenameComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class RenameComponent extends _react.Component {
  constructor(props) {
    super(props);
    this.state = {
      newName: this.props.phase.symbolAtPoint.text
    };
  }

  render() {
    return _react.createElement(
      'div',
      null,
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        autofocus: true,
        startSelected: true,
        className: 'nuclide-refactorizer-rename-editor',
        initialValue: this.props.phase.symbolAtPoint.text,
        onDidChange: text => this.setState({ newName: text }),
        onConfirm: () => this._runRename()
      }),
      _react.createElement(
        (_Button || _load_Button()).Button
        // Used to identify this element in integration tests
        ,
        { className: 'nuclide-refactorizer-execute-button',
          onClick: () => this._runRename() },
        'Execute'
      )
    );
  }

  _runRename() {
    const { newName } = this.state;
    const { symbolAtPoint, editor, originalPoint } = this.props.phase;
    const refactoring = {
      kind: 'rename',
      newName,
      originalPoint,
      symbolAtPoint,
      editor
    };
    this.props.store.dispatch((_refactorActions || _load_refactorActions()).execute(this.props.phase.provider, refactoring));
  }
}
exports.RenameComponent = RenameComponent; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            * @format
                                            */