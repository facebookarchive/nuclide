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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _uiHealthPaneItemComponent2;

function _uiHealthPaneItemComponent() {
  return _uiHealthPaneItemComponent2 = _interopRequireDefault(require('./ui/HealthPaneItemComponent'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var HealthPaneItem = (function (_React$Component) {
  _inherits(HealthPaneItem, _React$Component);

  function HealthPaneItem(props) {
    _classCallCheck(this, HealthPaneItem);

    _get(Object.getPrototypeOf(HealthPaneItem.prototype), 'constructor', this).call(this, props);
    this.state = {
      stats: null,
      childProcessesTree: null
    };
  }

  _createClass(HealthPaneItem, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      // Note: We assume the `stateStram` prop never changes.
      this._stateSubscription = this.props.stateStream.subscribe(function (state) {
        return _this.setState(state || {});
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._stateSubscription.unsubscribe();
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Health';
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'dashboard';
    }

    // Return false to prevent the tab getting split (since we only update a singleton health pane).
  }, {
    key: 'copy',
    value: function copy() {
      return false;
    }
  }, {
    key: 'render',
    value: function render() {
      var _state = this.state;
      var toolbarJewel = _state.toolbarJewel;
      var updateToolbarJewel = _state.updateToolbarJewel;
      var childProcessesTree = _state.childProcessesTree;
      var stats = _state.stats;

      if (stats == null) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement('div', null);
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'pane-item padded nuclide-health-pane-item' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_uiHealthPaneItemComponent2 || _uiHealthPaneItemComponent()).default, {
          toolbarJewel: toolbarJewel,
          updateToolbarJewel: updateToolbarJewel,
          cpuPercentage: stats.cpuPercentage,
          heapPercentage: stats.heapPercentage,
          memory: stats.rss,
          activeHandles: stats.activeHandles,
          activeRequests: stats.activeRequests,
          activeHandlesByType: stats.activeHandlesByType,
          childProcessesTree: childProcessesTree
        })
      );
    }
  }]);

  return HealthPaneItem;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = HealthPaneItem;
module.exports = exports.default;