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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibSection2;

function _nuclideUiLibSection() {
  return _nuclideUiLibSection2 = require('../../nuclide-ui/lib/Section');
}

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../nuclide-ui/lib/bindObservableAsProps');
}

var _WatchExpressionComponent2;

function _WatchExpressionComponent() {
  return _WatchExpressionComponent2 = require('./WatchExpressionComponent');
}

var _BreakpointListComponent2;

function _BreakpointListComponent() {
  return _BreakpointListComponent2 = require('./BreakpointListComponent');
}

var _DebuggerSteppingComponent2;

function _DebuggerSteppingComponent() {
  return _DebuggerSteppingComponent2 = require('./DebuggerSteppingComponent');
}

var _DebuggerCallstackComponent2;

function _DebuggerCallstackComponent() {
  return _DebuggerCallstackComponent2 = require('./DebuggerCallstackComponent');
}

function storeBreakpointsToViewBreakpoints(storeBreakpoints) {
  var breakpoints = [];
  storeBreakpoints.forEach(function (line, path) {
    breakpoints.push({
      path: path,
      line: line,
      // TODO jxg add enabled/disable functionality to store & consume it here.
      enabled: true,
      // TODO jxg sync unresolved breakpoints from Chrome Dev tools & consume them here.
      resolved: true
    });
  });
  return breakpoints;
}

var NewDebuggerView = (function (_React$Component) {
  _inherits(NewDebuggerView, _React$Component);

  function NewDebuggerView(props) {
    _classCallCheck(this, NewDebuggerView);

    _get(Object.getPrototypeOf(NewDebuggerView.prototype), 'constructor', this).call(this, props);
    this._wrappedComponent = (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(props.watchExpressionListStore.getWatchExpressions().map(function (watchExpressions) {
      return { watchExpressions: watchExpressions };
    }), (_WatchExpressionComponent2 || _WatchExpressionComponent()).WatchExpressionComponent);
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this.state = {
      debuggerMode: props.model.getStore().getDebuggerMode(),
      callstack: props.model.getCallstackStore().getCallstack(),
      breakpoints: storeBreakpointsToViewBreakpoints(props.model.getBreakpointStore().getAllBreakpoints())
    };
  }

  _createClass(NewDebuggerView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var debuggerStore = this.props.model.getStore();
      this._disposables.add(debuggerStore.onChange(function () {
        _this.setState({
          debuggerMode: debuggerStore.getDebuggerMode()
        });
      }));
      var callstackStore = this.props.model.getCallstackStore();
      this._disposables.add(callstackStore.onChange(function () {
        _this.setState({
          callstack: callstackStore.getCallstack()
        });
      }));
      var breakpointStore = this.props.model.getBreakpointStore();
      this._disposables.add(breakpointStore.onChange(function () {
        _this.setState({
          breakpoints: storeBreakpointsToViewBreakpoints(breakpointStore.getAllBreakpoints())
        });
      }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      var model = this.props.model;

      var actions = model.getActions();
      var WatchExpressionComponentWrapped = this._wrappedComponent;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-debugger-container-new' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibSection2 || _nuclideUiLibSection()).Section,
          { collapsable: true, headline: 'Debugger Controls' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_DebuggerSteppingComponent2 || _DebuggerSteppingComponent()).DebuggerSteppingComponent, {
            actions: actions,
            debuggerMode: this.state.debuggerMode
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibSection2 || _nuclideUiLibSection()).Section,
          { collapsable: true, headline: 'Call Stack' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_DebuggerCallstackComponent2 || _DebuggerCallstackComponent()).DebuggerCallstackComponent, {
            actions: actions,
            callstack: this.state.callstack
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibSection2 || _nuclideUiLibSection()).Section,
          { collapsable: true, headline: 'Breakpoints' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_BreakpointListComponent2 || _BreakpointListComponent()).BreakpointListComponent, {
            breakpoints: this.state.breakpoints
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibSection2 || _nuclideUiLibSection()).Section,
          { collapsable: true, headline: 'Watch Expressions' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(WatchExpressionComponentWrapped, {
            onAddWatchExpression: actions.addWatchExpression.bind(model),
            onRemoveWatchExpression: actions.removeWatchExpression.bind(model),
            onUpdateWatchExpression: actions.updateWatchExpression.bind(model),
            watchExpressionStore: model.getWatchExpressionStore()
          })
        )
      );
    }
  }, {
    key: '_dispose',
    value: function _dispose() {
      this._disposables.dispose();
    }
  }]);

  return NewDebuggerView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.NewDebuggerView = NewDebuggerView;