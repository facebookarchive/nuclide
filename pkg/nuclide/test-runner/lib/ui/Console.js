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

var AtomTextEditor = require('../../../ui/atom-text-editor');

var _require = require('react-for-atom');

var React = _require.React;
var PropTypes = React.PropTypes;

var Console = (function (_React$Component) {
  _inherits(Console, _React$Component);

  function Console() {
    _classCallCheck(this, Console);

    _get(Object.getPrototypeOf(Console.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Console, [{
    key: 'render',
    value: function render() {
      return React.createElement(AtomTextEditor, {
        gutterHidden: true,
        path: '.ansi',
        readOnly: true,
        textBuffer: this.props.textBuffer
      });
    }
  }], [{
    key: 'propTypes',
    value: {
      textBuffer: PropTypes.object.isRequired
    },
    enumerable: true
  }]);

  return Console;
})(React.Component);

module.exports = Console;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbnNvbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQVdBLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDOztlQUMvQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQWxDLEtBQUssWUFBTCxLQUFLO0lBRUwsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7SUFFVixPQUFPO1lBQVAsT0FBTzs7V0FBUCxPQUFPOzBCQUFQLE9BQU87OytCQUFQLE9BQU87OztlQUFQLE9BQU87O1dBS0wsa0JBQUc7QUFDUCxhQUNFLG9CQUFDLGNBQWM7QUFDYixvQkFBWSxFQUFFLElBQUksQUFBQztBQUNuQixZQUFJLEVBQUMsT0FBTztBQUNaLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2Ysa0JBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQUFBQztRQUNsQyxDQUNGO0tBQ0g7OztXQWJrQjtBQUNqQixnQkFBVSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtLQUN4Qzs7OztTQUhHLE9BQU87R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFpQnJDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwiZmlsZSI6IkNvbnNvbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBBdG9tVGV4dEVkaXRvciA9IHJlcXVpcmUoJy4uLy4uLy4uL3VpL2F0b20tdGV4dC1lZGl0b3InKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jbGFzcyBDb25zb2xlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICB0ZXh0QnVmZmVyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICBwYXRoPVwiLmFuc2lcIlxuICAgICAgICByZWFkT25seT17dHJ1ZX1cbiAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5wcm9wcy50ZXh0QnVmZmVyfVxuICAgICAgLz5cbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29uc29sZTtcbiJdfQ==