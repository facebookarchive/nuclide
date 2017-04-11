'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BreakpointStore;

function _load_BreakpointStore() {
  return _BreakpointStore = _interopRequireDefault(require('./BreakpointStore'));
}

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper for Chrome Devtools frontend view.
 */
class DebuggerInspector extends _react.default.PureComponent {

  constructor(props) {
    super(props);
    this._handleClickClose = this._handleClickClose.bind(this);
    this._handleClickDevTools = this._handleClickDevTools.bind(this);
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'inspector' },
      _react.default.createElement(
        'div',
        { className: 'control-bar' },
        _react.default.createElement((_Button || _load_Button()).Button, {
          title: 'Detach from the current process.',
          icon: 'x',
          buttonType: (_Button || _load_Button()).ButtonTypes.ERROR,
          onClick: this._handleClickClose
        }),
        _react.default.createElement((_Button || _load_Button()).Button, {
          title: '(Debug) Open Web Inspector for the debugger frame.',
          icon: 'gear',
          onClick: this._handleClickDevTools
        })
      )
    );
  }

  _handleClickClose() {
    this.props.stopDebugging();
    hideDebuggerPane();
  }

  _handleClickDevTools() {
    this.props.openDevTools();
  }
}

exports.default = DebuggerInspector; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      */

function hideDebuggerPane() {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
}