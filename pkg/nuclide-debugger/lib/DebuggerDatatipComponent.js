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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiLazyNestedValueComponent;

function _load_nuclideUiLazyNestedValueComponent() {
  return _nuclideUiLazyNestedValueComponent = require('../../nuclide-ui/LazyNestedValueComponent');
}

var _nuclideUiSimpleValueComponent;

function _load_nuclideUiSimpleValueComponent() {
  return _nuclideUiSimpleValueComponent = _interopRequireDefault(require('../../nuclide-ui/SimpleValueComponent'));
}

var DebuggerDatatipComponent = (function (_React$Component) {
  _inherits(DebuggerDatatipComponent, _React$Component);

  function DebuggerDatatipComponent() {
    _classCallCheck(this, DebuggerDatatipComponent);

    _get(Object.getPrototypeOf(DebuggerDatatipComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DebuggerDatatipComponent, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var expression = _props.expression;
      var evaluationResult = _props.evaluationResult;
      var watchExpressionStore = _props.watchExpressionStore;

      var fetchChildren = watchExpressionStore.getProperties.bind(watchExpressionStore);
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-debugger-datatip' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          { className: 'nuclide-debugger-datatip-value' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiLazyNestedValueComponent || _load_nuclideUiLazyNestedValueComponent()).LazyNestedValueComponent, {
            evaluationResult: evaluationResult,
            expression: expression,
            fetchChildren: fetchChildren,
            simpleValueComponent: (_nuclideUiSimpleValueComponent || _load_nuclideUiSimpleValueComponent()).default
          })
        )
      );
    }
  }]);

  return DebuggerDatatipComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.DebuggerDatatipComponent = DebuggerDatatipComponent;