Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var PropTypes = (_reactForAtom2 || _reactForAtom()).React.PropTypes;

var _sectionsBasicStatsSectionComponent2;

function _sectionsBasicStatsSectionComponent() {
  return _sectionsBasicStatsSectionComponent2 = _interopRequireDefault(require('./sections/BasicStatsSectionComponent'));
}

var _sectionsActiveHandlesSectionComponent2;

function _sectionsActiveHandlesSectionComponent() {
  return _sectionsActiveHandlesSectionComponent2 = _interopRequireDefault(require('./sections/ActiveHandlesSectionComponent'));
}

var HealthPaneItemComponent = (function (_React$Component) {
  _inherits(HealthPaneItemComponent, _React$Component);

  function HealthPaneItemComponent() {
    _classCallCheck(this, HealthPaneItemComponent);

    _get(Object.getPrototypeOf(HealthPaneItemComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HealthPaneItemComponent, [{
    key: 'render',
    value: function render() {

      var sections = {
        Stats: (_reactForAtom2 || _reactForAtom()).React.createElement((_sectionsBasicStatsSectionComponent2 || _sectionsBasicStatsSectionComponent()).default, this.props),
        Handles: (_reactForAtom2 || _reactForAtom()).React.createElement((_sectionsActiveHandlesSectionComponent2 || _sectionsActiveHandlesSectionComponent()).default, { activeHandleObjects: this.props.activeHandleObjects })
      };

      // For each section, we use settings-view to get a familiar look for table cells.
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        Object.keys(sections).map(function (title, s) {
          return (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-health-pane-item-section', key: s },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'h2',
              null,
              title
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              { className: 'settings-view' },
              sections[title]
            )
          );
        })
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      cpuPercentage: PropTypes.number.isRequired,
      memory: PropTypes.number.isRequired,
      heapPercentage: PropTypes.number.isRequired,
      lastKeyLatency: PropTypes.number.isRequired,
      activeHandles: PropTypes.number.isRequired,
      activeRequests: PropTypes.number.isRequired,
      activeHandleObjects: PropTypes.arrayOf(PropTypes.object).isRequired
    },
    enumerable: true
  }]);

  return HealthPaneItemComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = HealthPaneItemComponent;
module.exports = exports.default;