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
  return _Button = require('nuclide-commons-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper for Chrome Devtools frontend view.
 */
class DebuggerInspector extends _react.default.PureComponent {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleClickClose = () => {
      this.props.stopDebugging();
      hideDebuggerPane();
    }, this._handleClickDevTools = () => {
      this.props.openDevTools();
    }, _temp;
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'inspector', style: { 'text-align': 'right' } },
      _react.default.createElement(
        'div',
        { className: 'control-bar' },
        _react.default.createElement((_Button || _load_Button()).Button, {
          title: '(Debug) Open Web Inspector for the debugger frame.',
          icon: 'gear',
          onClick: this._handleClickDevTools
        })
      )
    );
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
                                      * @format
                                      */

function hideDebuggerPane() {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:hide');
}