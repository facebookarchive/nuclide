Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiIcon2;

function _nuclideUiIcon() {
  return _nuclideUiIcon2 = require('../../nuclide-ui/Icon');
}

var _nuclideUiTable2;

function _nuclideUiTable() {
  return _nuclideUiTable2 = require('../../nuclide-ui/Table');
}

var activeThreadIndicatorComponent = function activeThreadIndicatorComponent(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: 'nuclide-debugger-thread-list-item-current-indicator' },
    props.cellData ? (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiIcon2 || _nuclideUiIcon()).Icon, { icon: 'arrow-right', title: 'Selected Thread' }) : null
  );
};

var DebuggerThreadsComponent = (function (_React$Component) {
  _inherits(DebuggerThreadsComponent, _React$Component);

  function DebuggerThreadsComponent(props) {
    _classCallCheck(this, DebuggerThreadsComponent);

    _get(Object.getPrototypeOf(DebuggerThreadsComponent.prototype), 'constructor', this).call(this, props);
    this._handleSelectThread = this._handleSelectThread.bind(this);
  }

  _createClass(DebuggerThreadsComponent, [{
    key: '_handleSelectThread',
    value: function _handleSelectThread(data, selectedIndex) {
      this.props.bridge.selectThread(data.id);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var threadList = _props.threadList;
      var selectedThreadId = _props.selectedThreadId;

      var columns = [{
        component: activeThreadIndicatorComponent,
        title: '',
        key: 'isSelected',
        width: 0.05
      }, {
        title: 'ID',
        key: 'id',
        width: 0.15
      }, {
        title: 'Address',
        key: 'address',
        width: 0.55
      }, {
        title: 'Stop Reason',
        key: 'stopReason',
        width: 0.25
      }];
      var emptyComponent = function emptyComponent() {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-thread-list-empty' },
          threadList == null ? '(threads unavailable)' : 'no threads to display'
        );
      };
      var rows = threadList == null ? [] : threadList.map(function (threadItem, i) {
        var cellData = {
          data: _extends({}, threadItem, {
            isSelected: Number(threadItem.id) === selectedThreadId
          })
        };
        if (Number(threadItem.id) === selectedThreadId) {
          // $FlowIssue className is an optional property of a table row
          cellData.className = 'nuclide-debugger-thread-list-item-selected';
        }
        return cellData;
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiTable2 || _nuclideUiTable()).Table, {
        columns: columns,
        emptyComponent: emptyComponent,
        rows: rows,
        selectable: true,
        onSelect: this._handleSelectThread
      });
    }
  }]);

  return DebuggerThreadsComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.DebuggerThreadsComponent = DebuggerThreadsComponent;