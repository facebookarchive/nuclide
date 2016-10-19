Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var DiffNavigationBar = (function (_React$Component) {
  _inherits(DiffNavigationBar, _React$Component);

  function DiffNavigationBar(props) {
    _classCallCheck(this, DiffNavigationBar);

    _get(Object.getPrototypeOf(DiffNavigationBar.prototype), 'constructor', this).call(this, props);
    this._handleClick = this._handleClick.bind(this);
  }

  _createClass(DiffNavigationBar, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var _props = this.props;
      var diffSections = _props.diffSections;
      var pixelRangeForDiffSection = _props.pixelRangeForDiffSection;
      var navigationScale = _props.navigationScale;

      var jumpTargets = diffSections.map(function (diffSection) {
        return (_reactForAtom || _load_reactForAtom()).React.createElement(NavigatonBarJumpTarget, {
          navigationScale: navigationScale,
          diffSection: diffSection,
          key: diffSection.status + diffSection.lineNumber,
          pixelRangeForDiffSection: pixelRangeForDiffSection,
          onClick: _this._handleClick
        });
      });

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-view-navigation-bar' },
        jumpTargets
      );
    }
  }, {
    key: '_handleClick',
    value: function _handleClick(diffSectionStatus, lineNumber) {
      this.props.onNavigateToDiffSection(diffSectionStatus, lineNumber);
    }
  }]);

  return DiffNavigationBar;
})((_reactForAtom || _load_reactForAtom()).React.Component);

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

var NavigatonBarJumpTarget = (function (_React$Component2) {
  _inherits(NavigatonBarJumpTarget, _React$Component2);

  function NavigatonBarJumpTarget(props) {
    _classCallCheck(this, NavigatonBarJumpTarget);

    _get(Object.getPrototypeOf(NavigatonBarJumpTarget.prototype), 'constructor', this).call(this, props);
    this._handleClick = this._handleClick.bind(this);
  }

  _createClass(NavigatonBarJumpTarget, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var diffSection = _props2.diffSection;
      var pixelRangeForDiffSection = _props2.pixelRangeForDiffSection;
      var navigationScale = _props2.navigationScale;

      var lineChangeClass = sectionStatusToClassName(diffSection.status);

      var _pixelRangeForDiffSection = pixelRangeForDiffSection(diffSection);

      var top = _pixelRangeForDiffSection.top;
      var bottom = _pixelRangeForDiffSection.bottom;

      var targetStyle = {
        top: top * navigationScale + 'px',
        height: (bottom - top) * navigationScale + 'px'
      };
      var targetClassName = (0, (_classnames || _load_classnames()).default)(_defineProperty({
        'nuclide-diff-view-navigation-target': true
      }, lineChangeClass, true));

      return (_reactForAtom || _load_reactForAtom()).React.createElement('div', {
        className: targetClassName,
        style: targetStyle,
        onClick: this._handleClick
      });
    }
  }, {
    key: '_handleClick',
    value: function _handleClick(e) {
      var diffSection = this.props.diffSection;

      var targetRectangle = e.target.getBoundingClientRect();
      var lineHeight = (e.clientY - targetRectangle.top) / targetRectangle.height;
      var scrollToLineNumber = diffSection.lineNumber + Math.floor(diffSection.lineCount * lineHeight);
      this.props.onClick(diffSection.status, scrollToLineNumber);
    }
  }]);

  return NavigatonBarJumpTarget;
})((_reactForAtom || _load_reactForAtom()).React.Component);

module.exports = exports.default;