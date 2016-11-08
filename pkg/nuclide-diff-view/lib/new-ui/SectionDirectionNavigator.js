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
  return _Button = require('../../../nuclide-ui/Button');
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

let SectionDirectionNavigator = class SectionDirectionNavigator extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._onClickNavigateDown = this._onClickNavigateDown.bind(this);
    this._onClickNavigateUp = this._onClickNavigateUp.bind(this);

    const commandTarget = this.props.commandTarget;

    this._subscriptions = new _atom.CompositeDisposable(atom.commands.add(commandTarget, 'nuclide-diff-view:next-diff-section', this._onClickNavigateDown), atom.commands.add(commandTarget, 'nuclide-diff-view:previous-diff-section', this._onClickNavigateUp));
  }

  render() {
    const filePath = this.props.filePath;

    const hasActiveFile = filePath != null && filePath.length > 0;
    const hasDiffsUp = this._getPreviousNavigationSection() != null;
    const hasDiffsDown = this._getNextNavigationSection() != null;

    return _reactForAtom.React.createElement(
      'span',
      null,
      _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
        disabled: !hasActiveFile || !hasDiffsDown,
        icon: 'arrow-down',
        onClick: this._onClickNavigateDown,
        size: 'SMALL',
        title: 'Jump to next section'
      }),
      _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
        disabled: !hasActiveFile || !hasDiffsUp,
        icon: 'arrow-up',
        onClick: this._onClickNavigateUp,
        size: 'SMALL',
        title: 'Jump to previous section'
      })
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
exports.default = SectionDirectionNavigator;
module.exports = exports['default'];