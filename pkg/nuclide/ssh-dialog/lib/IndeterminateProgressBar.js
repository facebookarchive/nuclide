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

/**
 * Component to entertain the user while he is waiting to hear back from the
 * server.
 */

var IndeterminateProgressBar = (function (_React$Component) {
  _inherits(IndeterminateProgressBar, _React$Component);

  function IndeterminateProgressBar() {
    _classCallCheck(this, IndeterminateProgressBar);

    _get(Object.getPrototypeOf(IndeterminateProgressBar.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(IndeterminateProgressBar, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'block text-center padded' },
        _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-medium inline-block' })
      );
    }
  }]);

  return IndeterminateProgressBar;
})(_reactForAtom.React.Component);

exports['default'] = IndeterminateProgressBar;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluZGV0ZXJtaW5hdGVQcm9ncmVzc0Jhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOzs7Ozs7O0lBTWYsd0JBQXdCO1lBQXhCLHdCQUF3Qjs7V0FBeEIsd0JBQXdCOzBCQUF4Qix3QkFBd0I7OytCQUF4Qix3QkFBd0I7OztlQUF4Qix3QkFBd0I7O1dBQ3JDLGtCQUFpQjtBQUNyQixhQUNFOztVQUFLLFNBQVMsRUFBQywwQkFBMEI7UUFDdkMsNENBQU0sU0FBUyxFQUFDLDZDQUE2QyxHQUFRO09BQ2pFLENBQ047S0FDSDs7O1NBUGtCLHdCQUF3QjtHQUFTLG9CQUFNLFNBQVM7O3FCQUFoRCx3QkFBd0IiLCJmaWxlIjoiSW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG4vKipcbiAqIENvbXBvbmVudCB0byBlbnRlcnRhaW4gdGhlIHVzZXIgd2hpbGUgaGUgaXMgd2FpdGluZyB0byBoZWFyIGJhY2sgZnJvbSB0aGVcbiAqIHNlcnZlci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5kZXRlcm1pbmF0ZVByb2dyZXNzQmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1jZW50ZXIgcGFkZGVkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmcgbG9hZGluZy1zcGlubmVyLW1lZGl1bSBpbmxpbmUtYmxvY2tcIj48L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=