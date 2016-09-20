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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _HandlesTableComponent2;

function _HandlesTableComponent() {
  return _HandlesTableComponent2 = _interopRequireDefault(require('./HandlesTableComponent'));
}

var ChildProcessTreeComponent = (function (_React$Component) {
  _inherits(ChildProcessTreeComponent, _React$Component);

  function ChildProcessTreeComponent() {
    _classCallCheck(this, ChildProcessTreeComponent);

    _get(Object.getPrototypeOf(ChildProcessTreeComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ChildProcessTreeComponent, [{
    key: 'render',
    value: function render() {
      var childProcessesTree = this.props.childProcessesTree;

      if (!childProcessesTree) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement('div', null);
      }

      var handles = [];
      flatten(handles, childProcessesTree, 0);

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_HandlesTableComponent2 || _HandlesTableComponent()).default, {
          title: 'Process tree',
          handles: handles,
          keyed: function (_ref6) {
            var process = _ref6.process;
            var level = _ref6.level;
            return ' '.repeat(level * 3) + process.pid;
          },
          columns: [{
            title: 'CPU %',
            value: function value(_ref) {
              var process = _ref.process;
              var level = _ref.level;
              return process.cpuPercentage;
            },
            widthPercentage: 5
          }, {
            title: 'In',
            value: function value(_ref2) {
              var process = _ref2.process;
              return process.ioBytesStats && process.ioBytesStats.stdin;
            },
            widthPercentage: 3
          }, {
            title: 'Out',
            value: function value(_ref3) {
              var process = _ref3.process;
              return process.ioBytesStats && process.ioBytesStats.stdout;
            },
            widthPercentage: 3
          }, {
            title: 'Err',
            value: function value(_ref4) {
              var process = _ref4.process;
              return process.ioBytesStats && process.ioBytesStats.stderr;
            },
            widthPercentage: 3
          }, {
            title: 'Command',
            value: function value(_ref5) {
              var process = _ref5.process;
              var level = _ref5.level;
              return process.command;
            },
            widthPercentage: 56
          }]
        })
      );
    }
  }]);

  return ChildProcessTreeComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = ChildProcessTreeComponent;

function flatten(handles, process, level) {
  handles.push({ process: process, level: level });
  process.children.forEach(function (child) {
    return flatten(handles, child, level + 1);
  });
}
module.exports = exports.default;