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

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('../../nuclide-ui/Toolbar');
}

var _ToolbarCenter;

function _load_ToolbarCenter() {
  return _ToolbarCenter = require('../../nuclide-ui/ToolbarCenter');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('../../nuclide-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('../../nuclide-ui/ToolbarRight');
}

var _SectionDirectionNavigator;

function _load_SectionDirectionNavigator() {
  return _SectionDirectionNavigator = _interopRequireDefault(require('./new-ui/SectionDirectionNavigator'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let DiffViewToolbar = class DiffViewToolbar extends _reactForAtom.React.Component {

  render() {
    var _props = this.props;
    const filePath = _props.filePath,
          navigationSections = _props.navigationSections,
          onNavigateToNavigationSection = _props.onNavigateToNavigationSection,
          selectedNavigationSectionIndex = _props.selectedNavigationSectionIndex;

    const hasActiveFile = filePath != null && filePath.length > 0;
    return _reactForAtom.React.createElement(
      (_Toolbar || _load_Toolbar()).Toolbar,
      { location: 'top' },
      _reactForAtom.React.createElement((_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft, null),
      _reactForAtom.React.createElement(
        (_ToolbarCenter || _load_ToolbarCenter()).ToolbarCenter,
        null,
        this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle,
        '...',
        this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle
      ),
      _reactForAtom.React.createElement(
        (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
        null,
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { className: 'padded', size: 'SMALL' },
          _reactForAtom.React.createElement((_SectionDirectionNavigator || _load_SectionDirectionNavigator()).default, {
            commandTarget: '.nuclide-diff-editor-container',
            filePath: filePath,
            navigationSections: navigationSections,
            selectedNavigationSectionIndex: selectedNavigationSectionIndex,
            onNavigateToNavigationSection: onNavigateToNavigationSection
          })
        ),
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { size: 'SMALL' },
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            {
              className: 'nuclide-diff-view-goto-editor-button',
              disabled: !hasActiveFile,
              onClick: this.props.onSwitchToEditor },
            'Goto Editor'
          )
        )
      )
    );
  }
};
exports.default = DiffViewToolbar;
module.exports = exports['default'];