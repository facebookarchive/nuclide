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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../../../nuclide-ui/Button');
}

var BasicStatsSectionComponent = (function (_React$Component) {
  _inherits(BasicStatsSectionComponent, _React$Component);

  function BasicStatsSectionComponent() {
    _classCallCheck(this, BasicStatsSectionComponent);

    _get(Object.getPrototypeOf(BasicStatsSectionComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(BasicStatsSectionComponent, [{
    key: 'updateToolbarJewel',
    value: function updateToolbarJewel(value) {
      this.props.updateToolbarJewel(value);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var stats = [{
        name: 'CPU',
        value: this.props.cpuPercentage.toFixed(0) + '%'
      }, {
        name: 'Heap',
        value: this.props.heapPercentage.toFixed(1) + '%'
      }, {
        name: 'Memory',
        value: Math.floor(this.props.memory / 1024 / 1024) + 'MB'
      }, {
        name: 'Handles',
        value: '' + this.props.activeHandles
      }, {
        name: 'Child processes',
        value: '' + this.props.activeHandlesByType.childprocess.length
      }, {
        name: 'Event loop',
        value: '' + this.props.activeRequests
      }];

      var updateToolbarJewel = this.updateToolbarJewel;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'table',
        { className: 'table' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'thead',
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'tr',
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'th',
              { width: '30%' },
              'Metric'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'th',
              { width: '50%' },
              'Value'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'th',
              { width: '20%', className: 'text-right' },
              'Toolbar'
            )
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'tbody',
          null,
          stats.map(function (stat, s) {
            var props = {};
            var jewelLabel = 'Show';
            var jewelValue = stat.name;
            if (_this.props.toolbarJewel === stat.name) {
              props.className = 'selected';
              jewelLabel = 'Hide';
              jewelValue = 'None';
            }
            return (_reactForAtom2 || _reactForAtom()).React.createElement(
              'tr',
              _extends({}, props, { key: s }),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'th',
                null,
                stat.name
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                null,
                stat.value
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'text-right' },
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  (_nuclideUiButton2 || _nuclideUiButton()).Button,
                  {
                    size: (_nuclideUiButton2 || _nuclideUiButton()).ButtonSizes.EXTRA_SMALL,
                    onClick: updateToolbarJewel.bind(_this, jewelValue) },
                  jewelLabel
                )
              )
            );
          })
        )
      );
    }
  }]);

  return BasicStatsSectionComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = BasicStatsSectionComponent;
module.exports = exports.default;