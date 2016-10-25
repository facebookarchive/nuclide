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
    const hasDiffsUp = this._getPreviousDiffSection() != null;
    const hasDiffsDown = this._getNextDiffSection() != null;
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
    this._navigateToSection(this._getPreviousDiffSection());
  }

  _onClickNavigateDown() {
    this._navigateToSection(this._getNextDiffSection());
  }

  _navigateToSection(diffSection) {
    if (diffSection == null) {
      return;
    }
    this.props.onNavigateToDiffSection(diffSection.status, diffSection.lineNumber);
  }

  _getPreviousDiffSection() {
    var _props = this.props;
    const diffSections = _props.diffSections;
    const selectedDiffSectionIndex = _props.selectedDiffSectionIndex;

    const previousSectionIndex = selectedDiffSectionIndex - 1;
    if (previousSectionIndex < 0) {
      return null;
    }
    return diffSections[previousSectionIndex];
  }

  _getNextDiffSection() {
    var _props2 = this.props;
    const diffSections = _props2.diffSections;
    const selectedDiffSectionIndex = _props2.selectedDiffSectionIndex;

    const nextSectionIndex = selectedDiffSectionIndex + 1;
    if (nextSectionIndex >= diffSections.length) {
      return null;
    }
    return diffSections[nextSectionIndex];
  }
};
exports.default = DiffViewToolbar;
module.exports = exports['default'];