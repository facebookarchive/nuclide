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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideUiListView;

function _load_nuclideUiListView() {
  return _nuclideUiListView = require('../../nuclide-ui/ListView');
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

var DebuggerCallstackComponent = (function (_React$Component) {
  _inherits(DebuggerCallstackComponent, _React$Component);

  function DebuggerCallstackComponent(props) {
    _classCallCheck(this, DebuggerCallstackComponent);

    _get(Object.getPrototypeOf(DebuggerCallstackComponent.prototype), 'constructor', this).call(this, props);
    this._handleCallframeClick = this._handleCallframeClick.bind(this);
  }

  _createClass(DebuggerCallstackComponent, [{
    key: '_handleCallframeClick',
    value: function _handleCallframeClick(callFrameIndex, clickedCallframe) {
      this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
    }
  }, {
    key: 'render',
    value: function render() {
      var callstack = this.props.callstack;

      var items = callstack == null ? [] : callstack.map(function (callstackItem, i) {
        var name = callstackItem.name;
        var location = callstackItem.location;

        var path = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(location.path);
        var content = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-callstack-item', key: i },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-callstack-name' },
            name
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            null,
            path,
            ':',
            location.line + 1
          )
        );
        return (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiListView || _load_nuclideUiListView()).ListViewItem,
          { key: i, value: callstackItem },
          content
        );
      });
      return callstack == null ? (_reactForAtom || _load_reactForAtom()).React.createElement(
        'span',
        null,
        '(callstack unavailable)'
      ) : (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiListView || _load_nuclideUiListView()).ListView,
        {
          alternateBackground: true,
          selectable: true,
          onSelect: this._handleCallframeClick },
        items
      );
    }
  }]);

  return DebuggerCallstackComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.DebuggerCallstackComponent = DebuggerCallstackComponent;