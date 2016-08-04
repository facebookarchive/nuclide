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

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibIcon2;

function _nuclideUiLibIcon() {
  return _nuclideUiLibIcon2 = require('../../nuclide-ui/lib/Icon');
}

var DebuggerThreadsComponent = (function (_React$Component) {
  _inherits(DebuggerThreadsComponent, _React$Component);

  function DebuggerThreadsComponent() {
    _classCallCheck(this, DebuggerThreadsComponent);

    _get(Object.getPrototypeOf(DebuggerThreadsComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DebuggerThreadsComponent, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var bridge = _props.bridge;
      var threadList = _props.threadList;
      var selectedThreadId = _props.selectedThreadId;

      var renderedThreadList = threadList == null || threadList.length === 0 ? '(threads unavailable)' : threadList.map(function (threadItem, i) {
        var id = threadItem.id;
        var address = threadItem.address;
        var stopReason = threadItem.stopReason;

        var isSelected = id === selectedThreadId;
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'tr',
          {
            className: (0, (_classnames2 || _classnames()).default)('nuclide-debugger-atom-thread-list-item', {
              'nuclide-debugger-atom-thread-list-item-selected': isSelected,
              'nuclide-debugger-atom-thread-list-table-row-odd': i % 2 === 1
            }),
            onClick: function () {
              return bridge.selectThread(id);
            },
            key: i },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            { className: 'nuclide-debugger-atom-thread-list-item-current-indicator' },
            isSelected ? (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibIcon2 || _nuclideUiLibIcon()).Icon, { icon: 'arrow-right', title: 'Selected Thread' }) : null
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            { className: 'nuclide-debugger-atom-thread-list-item-id', title: id },
            id
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            { className: 'nuclide-debugger-atom-thread-list-item-address', title: address },
            address
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            { className: 'nuclide-debugger-atom-thread-list-item-stop-reason', title: stopReason },
            stopReason
          )
        );
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'table',
          { className: 'nuclide-debugger-atom-thread-list-table' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'thead',
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'tr',
              { className: 'nuclide-debugger-atom-thread-list-item' },
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'nuclide-debugger-atom-thread-list-item-current-indicator' },
                ' '
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'nuclide-debugger-atom-thread-list-item-id' },
                'ID'
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'nuclide-debugger-atom-thread-list-item-address' },
                'Address'
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'td',
                { className: 'nuclide-debugger-atom-thread-list-item-stop-reason' },
                'Stop Reason'
              )
            )
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'tbody',
            null,
            renderedThreadList
          )
        )
      );
    }
  }]);

  return DebuggerThreadsComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.DebuggerThreadsComponent = DebuggerThreadsComponent;