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
    const diffSections = _props.diffSections;
    const pixelRangeForDiffSection = _props.pixelRangeForDiffSection;
    const navigationScale = _props.navigationScale;


    const jumpTargets = diffSections.map(diffSection => {
      return _reactForAtom.React.createElement(NavigatonBarJumpTarget, {
        navigationScale: navigationScale,
        diffSection: diffSection,
        key: diffSection.status + diffSection.lineNumber,
        pixelRangeForDiffSection: pixelRangeForDiffSection,
        onClick: this._handleClick
      });
    });

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-view-navigation-bar' },
      jumpTargets
    );
  }

  _handleClick(diffSectionStatus, lineNumber) {
    this.props.onNavigateToDiffSection(diffSectionStatus, lineNumber);
  }
};
exports.default = DiffNavigationBar;


function sectionStatusToClassName(statusType) {
  switch (statusType) {
    case (_constants || _load_constants()).DiffSectionStatus.ADDED:
      return 'added';
    case (_constants || _load_constants()).DiffSectionStatus.CHANGED:
      return 'modified';
    case (_constants || _load_constants()).DiffSectionStatus.REMOVED:
      return 'removed';
    default:
      throw new Error('Invalid diff section status');
  }
}

let NavigatonBarJumpTarget = class NavigatonBarJumpTarget extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }

  render() {
    var _props2 = this.props;
    const diffSection = _props2.diffSection;
    const pixelRangeForDiffSection = _props2.pixelRangeForDiffSection;
    const navigationScale = _props2.navigationScale;

    const lineChangeClass = sectionStatusToClassName(diffSection.status);

    var _pixelRangeForDiffSec = pixelRangeForDiffSection(diffSection);

    const top = _pixelRangeForDiffSec.top;
    const bottom = _pixelRangeForDiffSec.bottom;

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
    const diffSection = this.props.diffSection;

    const targetRectangle = e.target.getBoundingClientRect();
    const lineHeight = (e.clientY - targetRectangle.top) / targetRectangle.height;
    const scrollToLineNumber = diffSection.lineNumber + Math.floor(diffSection.lineCount * lineHeight);
    this.props.onClick(diffSection.status, scrollToLineNumber);
  }
};
module.exports = exports['default'];