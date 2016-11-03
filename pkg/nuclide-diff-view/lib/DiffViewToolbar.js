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

let DiffViewToolbar = class DiffViewToolbar extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._onClickNavigateDown = this._onClickNavigateDown.bind(this);
    this._onClickNavigateUp = this._onClickNavigateUp.bind(this);

    this._subscriptions = new _atom.CompositeDisposable(atom.commands.add('.nuclide-diff-editor-container', 'nuclide-diff-view:next-diff-section', this._onClickNavigateDown), atom.commands.add('.nuclide-diff-editor-container', 'nuclide-diff-view:previous-diff-section', this._onClickNavigateUp));
  }

  render() {
    const filePath = this.props.filePath;

    const hasActiveFile = filePath != null && filePath.length > 0;
    const hasDiffsUp = this._getPreviousNavigationSection() != null;
    const hasDiffsDown = this._getNextNavigationSection() != null;
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
          _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
            disabled: !hasActiveFile || !hasDiffsDown,
            icon: 'arrow-down',
            onClick: this._onClickNavigateDown,
            title: 'Jump to next section'
          }),
          _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
            disabled: !hasActiveFile || !hasDiffsUp,
            icon: 'arrow-up',
            onClick: this._onClickNavigateUp,
            title: 'Jump to previous section'
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

  _onClickNavigateUp() {
    this._navigateToSection(this._getPreviousNavigationSection());
  }

  _onClickNavigateDown() {
    this._navigateToSection(this._getNextNavigationSection());
  }

  _navigateToSection(section) {
    if (section == null) {
      return;
    }
    this.props.onNavigateToNavigationSection(section.status, section.lineNumber);
  }

  _getPreviousNavigationSection() {
    var _props = this.props;
    const navigationSections = _props.navigationSections,
          selectedNavigationSectionIndex = _props.selectedNavigationSectionIndex;

    const previousSectionIndex = selectedNavigationSectionIndex - 1;
    if (previousSectionIndex < 0) {
      return null;
    }
    return navigationSections[previousSectionIndex];
  }

  _getNextNavigationSection() {
    var _props2 = this.props;
    const navigationSections = _props2.navigationSections,
          selectedNavigationSectionIndex = _props2.selectedNavigationSectionIndex;

    const nextSectionIndex = selectedNavigationSectionIndex + 1;
    if (nextSectionIndex >= navigationSections.length) {
      return null;
    }
    return navigationSections[nextSectionIndex];
  }
};
exports.default = DiffViewToolbar;
module.exports = exports['default'];