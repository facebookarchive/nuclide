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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let DiffNavigationBar = class DiffNavigationBar extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  render() {
    var _props = this.props;
    const navigationSections = _props.navigationSections,
          pixelRangeForNavigationSection = _props.pixelRangeForNavigationSection,
          navigationScale = _props.navigationScale;


    const jumpTargets = navigationSections.map(navigationSection => {
      return _reactForAtom.React.createElement(NavigatonBarJumpTarget, {
        navigationScale: navigationScale,
        navigationSection: navigationSection,
        key: navigationSection.status + navigationSection.lineNumber,
        pixelRangeForNavigationSection: pixelRangeForNavigationSection,
        onClick: this._handleClick
      });
    });

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-view-navigation-bar' },
      jumpTargets
    );
  }

  _handleClick(navigationSectionStatus, lineNumber) {
    this.props.onNavigateToNavigationSection(navigationSectionStatus, lineNumber);
  }
};
exports.default = DiffNavigationBar;


function sectionStatusToClassName(statusType) {
  switch (statusType) {
    case (_constants || _load_constants()).NavigationSectionStatus.ADDED:
      return 'added';
    case (_constants || _load_constants()).NavigationSectionStatus.CHANGED:
      return 'modified';
    case (_constants || _load_constants()).NavigationSectionStatus.REMOVED:
      return 'removed';
    case (_constants || _load_constants()).NavigationSectionStatus.NEW_ELEMENT:
    case (_constants || _load_constants()).NavigationSectionStatus.OLD_ELEMENT:
      return 'icon icon-comment';
    default:
      throw new Error('Invalid navigation section status');
  }
}

let NavigatonBarJumpTarget = class NavigatonBarJumpTarget extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  render() {
    var _props2 = this.props;
    const navigationSection = _props2.navigationSection,
          pixelRangeForNavigationSection = _props2.pixelRangeForNavigationSection,
          navigationScale = _props2.navigationScale;

    const lineChangeClass = sectionStatusToClassName(navigationSection.status);

    var _pixelRangeForNavigat = pixelRangeForNavigationSection(navigationSection);

    const top = _pixelRangeForNavigat.top,
          bottom = _pixelRangeForNavigat.bottom;

    const scaledTop = top * navigationScale;
    const scaledHeight = Math.max((bottom - top) * navigationScale, 1);
    const targetStyle = {
      top: `${ scaledTop }px`,
      height: `${ scaledHeight }px`
    };
    const targetClassName = (0, (_classnames || _load_classnames()).default)({
      'nuclide-diff-view-navigation-target': true,
      [lineChangeClass]: true
    });

    return _reactForAtom.React.createElement('div', {
      className: targetClassName,
      style: targetStyle,
      onClick: this._handleClick
    });
  }

  _handleClick(e) {
    const navigationSection = this.props.navigationSection;

    const targetRectangle = e.target.getBoundingClientRect();
    const lineHeight = (e.clientY - targetRectangle.top) / targetRectangle.height;
    const scrollToLineNumber = navigationSection.lineNumber + Math.floor(navigationSection.lineCount * lineHeight);
    this.props.onClick(navigationSection.status, scrollToLineNumber);
  }
};
module.exports = exports['default'];