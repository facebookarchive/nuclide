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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _nuclideUiLibListview2;

function _nuclideUiLibListview() {
  return _nuclideUiLibListview2 = require('../../nuclide-ui/lib/Listview');
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
    value: function _handleCallframeClick(callFrameIndex, event) {
      (0, (_assert2 || _assert()).default)(this.props.callstack != null);
      var location = this.props.callstack[callFrameIndex].location;

      var options = {
        sourceURL: location.path,
        lineNumber: location.line
      };
      this.props.actions.setSelectedCallFrameline(options);
    }
  }, {
    key: 'render',
    value: function render() {
      var callstack = this.props.callstack;

      var renderedCallstack = callstack == null ? '(callstack unavailable)' : callstack.map(function (callstackItem, i) {
        var name = callstackItem.name;
        var location = callstackItem.location;

        var path = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(location.path);
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-atom-callstack-item', key: i },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-atom-callstack-name' },
            name
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            null,
            path,
            ':',
            location.line + 1
          )
        );
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiLibListview2 || _nuclideUiLibListview()).Listview,
        {
          alternateBackground: true,
          selectable: true,
          onSelect: this._handleCallframeClick },
        renderedCallstack
      );
    }
  }]);

  return DebuggerCallstackComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.DebuggerCallstackComponent = DebuggerCallstackComponent;