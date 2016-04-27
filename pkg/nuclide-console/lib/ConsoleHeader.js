Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var ConsoleHeader = (function (_React$Component) {
  _inherits(ConsoleHeader, _React$Component);

  function ConsoleHeader(props) {
    _classCallCheck(this, ConsoleHeader);

    _get(Object.getPrototypeOf(ConsoleHeader.prototype), 'constructor', this).call(this, props);
    this._handleClearButtonClick = this._handleClearButtonClick.bind(this);
  }

  _createClass(ConsoleHeader, [{
    key: '_handleClearButtonClick',
    value: function _handleClearButtonClick(event) {
      this.props.clear();
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        _nuclideUiLibToolbar.Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarRight.ToolbarRight,
          null,
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            {
              size: _nuclideUiLibButton.ButtonSizes.SMALL,
              onClick: this._handleClearButtonClick },
            'Clear'
          )
        )
      );
    }
  }]);

  return ConsoleHeader;
})(_reactForAtom.React.Component);

exports['default'] = ConsoleHeader;
module.exports = exports['default'];