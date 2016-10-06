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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup2;

function _nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup2 = require('../../nuclide-ui/ButtonGroup');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiToolbar2;

function _nuclideUiToolbar() {
  return _nuclideUiToolbar2 = require('../../nuclide-ui/Toolbar');
}

var _nuclideUiToolbarCenter2;

function _nuclideUiToolbarCenter() {
  return _nuclideUiToolbarCenter2 = require('../../nuclide-ui/ToolbarCenter');
}

var _nuclideUiToolbarLeft2;

function _nuclideUiToolbarLeft() {
  return _nuclideUiToolbarLeft2 = require('../../nuclide-ui/ToolbarLeft');
}

var _nuclideUiToolbarRight2;

function _nuclideUiToolbarRight() {
  return _nuclideUiToolbarRight2 = require('../../nuclide-ui/ToolbarRight');
}

var DiffViewToolbar = (function (_React$Component) {
  _inherits(DiffViewToolbar, _React$Component);

  function DiffViewToolbar(props) {
    _classCallCheck(this, DiffViewToolbar);

    _get(Object.getPrototypeOf(DiffViewToolbar.prototype), 'constructor', this).call(this, props);
    this._onClickNavigateDown = this._onClickNavigateDown.bind(this);
    this._onClickNavigateUp = this._onClickNavigateUp.bind(this);

    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable(atom.commands.add('.nuclide-diff-editor-container', 'nuclide-diff-view:next-diff-section', this._onClickNavigateDown), atom.commands.add('.nuclide-diff-editor-container', 'nuclide-diff-view:previous-diff-section', this._onClickNavigateUp));
  }

  _createClass(DiffViewToolbar, [{
    key: 'render',
    value: function render() {
      var filePath = this.props.filePath;

      var hasActiveFile = filePath != null && filePath.length > 0;
      var hasDiffsUp = this._getPreviousDiffSection() != null;
      var hasDiffsDown = this._getNextDiffSection() != null;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiToolbar2 || _nuclideUiToolbar()).Toolbar,
        { location: 'top' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiToolbarLeft2 || _nuclideUiToolbarLeft()).ToolbarLeft, null),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiToolbarCenter2 || _nuclideUiToolbarCenter()).ToolbarCenter,
          null,
          this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle,
          '...',
          this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiToolbarRight2 || _nuclideUiToolbarRight()).ToolbarRight,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup2 || _nuclideUiButtonGroup()).ButtonGroup,
            { className: 'padded', size: 'SMALL' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiButton2 || _nuclideUiButton()).Button, {
              disabled: !hasActiveFile || !hasDiffsDown,
              icon: 'arrow-down',
              onClick: this._onClickNavigateDown,
              title: 'Jump to next section'
            }),
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiButton2 || _nuclideUiButton()).Button, {
              disabled: !hasActiveFile || !hasDiffsUp,
              icon: 'arrow-up',
              onClick: this._onClickNavigateUp,
              title: 'Jump to previous section'
            })
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup2 || _nuclideUiButtonGroup()).ButtonGroup,
            { size: 'SMALL' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiButton2 || _nuclideUiButton()).Button,
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
  }, {
    key: '_onClickNavigateUp',
    value: function _onClickNavigateUp() {
      this._navigateToSection(this._getPreviousDiffSection());
    }
  }, {
    key: '_onClickNavigateDown',
    value: function _onClickNavigateDown() {
      this._navigateToSection(this._getNextDiffSection());
    }
  }, {
    key: '_navigateToSection',
    value: function _navigateToSection(diffSection) {
      if (diffSection == null) {
        return;
      }
      this.props.onNavigateToDiffSection(diffSection.status, diffSection.lineNumber);
    }
  }, {
    key: '_getPreviousDiffSection',
    value: function _getPreviousDiffSection() {
      var _props = this.props;
      var diffSections = _props.diffSections;
      var middleScrollOffsetLineNumber = _props.middleScrollOffsetLineNumber;

      var previousSection = null;
      for (var i = diffSections.length - 1; i >= 0; i--) {
        if (diffSections[i].offsetLineNumber < middleScrollOffsetLineNumber) {
          previousSection = diffSections[i];
          break;
        }
      }
      return previousSection;
    }
  }, {
    key: '_getNextDiffSection',
    value: function _getNextDiffSection() {
      var _props2 = this.props;
      var diffSections = _props2.diffSections;
      var middleScrollOffsetLineNumber = _props2.middleScrollOffsetLineNumber;

      return diffSections.find(function (diffSection) {
        return diffSection.offsetLineNumber > middleScrollOffsetLineNumber;
      });
    }
  }]);

  return DiffViewToolbar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = DiffViewToolbar;
module.exports = exports.default;