'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HhvmToolbarSettings = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Modal;

function _load_Modal() {
  return _Modal = require('../../../modules/nuclide-commons-ui/Modal');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../modules/nuclide-commons-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../../modules/nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../modules/nuclide-commons-ui/ButtonGroup');
}

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

class HhvmToolbarSettings extends _react.Component {
  constructor(props) {
    super(props);
    this.state = {
      args: this.props.projectStore.getScriptArguments()
    };
  }

  render() {
    return _react.createElement(
      (_Modal || _load_Modal()).Modal,
      { onDismiss: this.props.onDismiss },
      _react.createElement(
        'div',
        { className: 'block' },
        _react.createElement(
          'div',
          { className: 'block' },
          _react.createElement(
            'h1',
            null,
            'Script Debug Settings'
          ),
          _react.createElement(
            'label',
            null,
            'Script arguments:'
          ),
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            autofocus: true,
            value: this.state.args,
            onDidChange: newValue => this.setState({ args: newValue }),
            size: 'sm'
          })
        ),
        _react.createElement(
          'div',
          { className: 'nuclide-hhvm-toolbar-settings' },
          _react.createElement(
            (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
            null,
            _react.createElement(
              (_Button || _load_Button()).Button,
              { onClick: () => this.props.onDismiss() },
              'Cancel'
            ),
            _react.createElement(
              (_Button || _load_Button()).Button,
              {
                buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
                onClick: () => {
                  this.props.projectStore.setScriptArguments(this.state.args);
                  this.props.onDismiss();
                } },
              'Save'
            )
          )
        )
      )
    );
  }
}
exports.HhvmToolbarSettings = HhvmToolbarSettings;