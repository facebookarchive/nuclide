'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SectionDirectionNavigator extends _react.default.Component {

  constructor(props) {
    super(props);
    this._onClickNavigateDown = this._onClickNavigateDown.bind(this);
    this._onClickNavigateUp = this._onClickNavigateUp.bind(this);

    const { commandTarget } = this.props;
    this._subscriptions = new _atom.CompositeDisposable(atom.commands.add(commandTarget, 'nuclide-diff-view:next-diff-section', this._onClickNavigateDown), atom.commands.add(commandTarget, 'nuclide-diff-view:previous-diff-section', this._onClickNavigateUp));
  }

  render() {
    const { filePath } = this.props;
    const hasActiveFile = filePath != null && filePath.length > 0;
    const hasDiffsUp = this._getPreviousNavigationSection() != null;
    const hasDiffsDown = this._getNextNavigationSection() != null;

    return _react.default.createElement(
      'span',
      { className: 'nuclide-diff-view-direction' },
      _react.default.createElement((_Button || _load_Button()).Button, {
        disabled: !hasActiveFile || !hasDiffsDown,
        icon: 'arrow-down',
        onClick: this._onClickNavigateDown,
        size: 'SMALL',
        title: 'Jump to next section'
      }),
      _react.default.createElement((_Button || _load_Button()).Button, {
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
    const { navigationSections, selectedNavigationSectionIndex } = this.props;
    const previousSectionIndex = selectedNavigationSectionIndex - 1;
    if (previousSectionIndex < 0) {
      return null;
    }
    return navigationSections[previousSectionIndex];
  }

  _getNextNavigationSection() {
    const { navigationSections, selectedNavigationSectionIndex } = this.props;
    const nextSectionIndex = selectedNavigationSectionIndex + 1;
    if (nextSectionIndex >= navigationSections.length) {
      return null;
    }
    return navigationSections[nextSectionIndex];
  }
}
exports.default = SectionDirectionNavigator; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              */