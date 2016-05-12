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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../nuclide-ui/lib/bindObservableAsProps');
}

var _WatchExpressionComponent2;

function _WatchExpressionComponent() {
  return _WatchExpressionComponent2 = require('./WatchExpressionComponent');
}

var NewDebuggerView = (function (_React$Component) {
  _inherits(NewDebuggerView, _React$Component);

  function NewDebuggerView(props) {
    _classCallCheck(this, NewDebuggerView);

    _get(Object.getPrototypeOf(NewDebuggerView.prototype), 'constructor', this).call(this, props);
    this._wrappedComponent = (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(props.watchExpressionListStore.getWatchExpressions().map(function (watchExpressions) {
      return { watchExpressions: watchExpressions };
    }), (_WatchExpressionComponent2 || _WatchExpressionComponent()).WatchExpressionComponent);
  }

  _createClass(NewDebuggerView, [{
    key: 'render',
    value: function render() {
      var model = this.props.model;

      var actions = model.getActions();
      var Component = this._wrappedComponent;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-debugger-container-new' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(Component, {
          onAddWatchExpression: actions.addWatchExpression.bind(model),
          onRemoveWatchExpression: actions.removeWatchExpression.bind(model),
          onUpdateWatchExpression: actions.updateWatchExpression.bind(model)
        })
      );
    }
  }]);

  return NewDebuggerView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.NewDebuggerView = NewDebuggerView;