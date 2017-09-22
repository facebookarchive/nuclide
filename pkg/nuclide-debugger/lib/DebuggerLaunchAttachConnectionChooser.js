'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerLaunchAttachConnectionChooser = undefined;

var _react = _interopRequireWildcard(require('react'));

var _MultiSelectList;

function _load_MultiSelectList() {
  return _MultiSelectList = require('../../nuclide-ui/MultiSelectList');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class DebuggerLaunchAttachConnectionChooser extends _react.Component {

  constructor(props) {
    super(props);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:cancel': () => {
        this.props.dialogCloser();
      }
    }));
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'padded nuclide-debugger-launch-attach-container' },
      _react.createElement(
        'h1',
        { className: 'nuclide-debugger-launch-attach-header' },
        'Change debugger connection:'
      ),
      _react.createElement((_MultiSelectList || _load_MultiSelectList()).MultiSelectList, {
        commandScope: atom.views.getView(atom.workspace),
        value: [this.props.selectedConnection],
        options: this.props.options,
        onChange: activeValues => this.props.connectionChanged(activeValues.length > 0 ? activeValues[activeValues.length - 1] : null)
      }),
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-launch-attach-actions' },
        _react.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:cancel') },
            'Cancel'
          )
        )
      )
    );
  }
}
exports.DebuggerLaunchAttachConnectionChooser = DebuggerLaunchAttachConnectionChooser; /**
                                                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                                                        * All rights reserved.
                                                                                        *
                                                                                        * This source code is licensed under the license found in the LICENSE file in
                                                                                        * the root directory of this source tree.
                                                                                        *
                                                                                        * 
                                                                                        * @format
                                                                                        */