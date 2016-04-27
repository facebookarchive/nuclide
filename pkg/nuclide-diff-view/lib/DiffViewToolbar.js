var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonGroup = require('../../nuclide-ui/lib/ButtonGroup');

var _constants = require('./constants');

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarCenter = require('../../nuclide-ui/lib/ToolbarCenter');

var _nuclideUiLibToolbarLeft = require('../../nuclide-ui/lib/ToolbarLeft');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

var DiffViewToolbar = (function (_React$Component) {
  _inherits(DiffViewToolbar, _React$Component);

  function DiffViewToolbar() {
    _classCallCheck(this, DiffViewToolbar);

    _get(Object.getPrototypeOf(DiffViewToolbar.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiffViewToolbar, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var _props = this.props;
      var diffMode = _props.diffMode;
      var filePath = _props.filePath;

      var hasActiveFile = filePath != null && filePath.length > 0;
      var diffModeIds = Object.keys(_constants.DiffMode);
      var modeElements = [];

      var _loop = function (i) {
        var modeId = diffModeIds[i];
        var modeValue = _constants.DiffMode[modeId];
        var className = (0, _classnames2['default'])('inline-block', {
          'selected': modeValue === diffMode
        });
        modeElements.push(_reactForAtom.React.createElement(
          _nuclideUiLibButton.Button,
          {
            key: modeValue,
            className: className,
            onClick: function () {
              return _this.props.onSwitchMode(modeValue);
            },
            size: 'SMALL' },
          modeValue
        ));
        if (i !== diffModeIds.length - 1) {
          // Turn the arrow pointing to the next step green to indicate the next step in the compare >
          // commit > publish flow.
          var sepClassName = (0, _classnames2['default'])('inline-block-tight icon icon-playback-fast-forward', {
            'text-success': modeValue === diffMode
          });
          modeElements.push(_reactForAtom.React.createElement('span', { className: sepClassName, key: 'sep-' + modeValue }));
        }
      };

      for (var i = 0; i < diffModeIds.length; i++) {
        _loop(i);
      }

      return _reactForAtom.React.createElement(
        _nuclideUiLibToolbar.Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarLeft.ToolbarLeft,
          null,
          modeElements
        ),
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarCenter.ToolbarCenter,
          null,
          this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle,
          '...',
          this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle
        ),
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarRight.ToolbarRight,
          null,
          _reactForAtom.React.createElement(
            _nuclideUiLibButtonGroup.ButtonGroup,
            { size: 'SMALL' },
            _reactForAtom.React.createElement(
              _nuclideUiLibButton.Button,
              {
                disabled: !hasActiveFile,
                onClick: this.props.onSwitchToEditor },
              'Goto Editor'
            )
          )
        )
      );
    }
  }]);

  return DiffViewToolbar;
})(_reactForAtom.React.Component);

module.exports = DiffViewToolbar;