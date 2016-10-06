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

var _nuclideUiSection2;

function _nuclideUiSection() {
  return _nuclideUiSection2 = require('../../nuclide-ui/Section');
}

var _nuclideUiBindObservableAsProps2;

function _nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps2 = require('../../nuclide-ui/bindObservableAsProps');
}

var _WatchExpressionComponent2;

function _WatchExpressionComponent() {
  return _WatchExpressionComponent2 = require('./WatchExpressionComponent');
}

var _LocalsComponent2;

function _LocalsComponent() {
  return _LocalsComponent2 = require('./LocalsComponent');
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

var _DebuggerThreadsComponent2;

function _DebuggerThreadsComponent() {
  return _DebuggerThreadsComponent2 = require('./DebuggerThreadsComponent');
}

var NewDebuggerView = (function (_React$Component) {
  _inherits(NewDebuggerView, _React$Component);

  function NewDebuggerView(props) {
    _classCallCheck(this, NewDebuggerView);

    _get(Object.getPrototypeOf(NewDebuggerView.prototype), 'constructor', this).call(this, props);
    this._watchExpressionComponentWrapped = (0, (_nuclideUiBindObservableAsProps2 || _nuclideUiBindObservableAsProps()).bindObservableAsProps)(props.model.getWatchExpressionListStore().getWatchExpressions().map(function (watchExpressions) {
      return { watchExpressions: watchExpressions };
    }), (_WatchExpressionComponent2 || _WatchExpressionComponent()).WatchExpressionComponent);
    this._localsComponentWrapped = (0, (_nuclideUiBindObservableAsProps2 || _nuclideUiBindObservableAsProps()).bindObservableAsProps)(props.model.getLocalsStore().getLocals().map(function (locals) {
      return { locals: locals };
    }), (_LocalsComponent2 || _LocalsComponent()).LocalsComponent);
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    var debuggerStore = props.model.getStore();
    var threadStore = props.model.getThreadStore();
    this.state = {
      allowSingleThreadStepping: Boolean(debuggerStore.getSettings().get('SingleThreadStepping')),
      debuggerMode: debuggerStore.getDebuggerMode(),
      togglePauseOnException: debuggerStore.getTogglePauseOnException(),
      togglePauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
      enableSingleThreadStepping: debuggerStore.getEnableSingleThreadStepping(),
      showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
      callstack: props.model.getCallstackStore().getCallstack(),
      breakpoints: props.model.getBreakpointStore().getAllBreakpoints(),
      threadList: threadStore.getThreadList(),
      selectedThreadId: threadStore.getSelectedThreadId(),
      customControlButtons: debuggerStore.getCustomControlButtons()
    };
  }

  _createClass(NewDebuggerView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var debuggerStore = this.props.model.getStore();
      this._disposables.add(debuggerStore.onChange(function () {
        _this.setState({
          // We need to refetch some values that we already got in the constructor
          // since these values weren't necessarily properly intialized until now.
          allowSingleThreadStepping: Boolean(debuggerStore.getSettings().get('SingleThreadStepping')),
          debuggerMode: debuggerStore.getDebuggerMode(),
          togglePauseOnException: debuggerStore.getTogglePauseOnException(),
          togglePauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
          enableSingleThreadStepping: debuggerStore.getEnableSingleThreadStepping(),
          showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
          customControlButtons: debuggerStore.getCustomControlButtons()
        });
      }));
      var callstackStore = this.props.model.getCallstackStore();
      this._disposables.add(callstackStore.onChange(function () {
        _this.setState({
          callstack: callstackStore.getCallstack()
        });
      }));
      var breakpointStore = this.props.model.getBreakpointStore();
      this._disposables.add(breakpointStore.onNeedUIUpdate(function () {
        _this.setState({
          breakpoints: breakpointStore.getAllBreakpoints()
        });
      }));
      var threadStore = this.props.model.getThreadStore();
      this._disposables.add(threadStore.onChange(function () {
        _this.setState({
          threadList: threadStore.getThreadList(),
          selectedThreadId: threadStore.getSelectedThreadId()
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
      var WatchExpressionComponentWrapped = this._watchExpressionComponentWrapped;
      var LocalsComponentWrapped = this._localsComponentWrapped;
      var threadsSection = this.state.showThreadsWindow ? (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiSection2 || _nuclideUiSection()).Section,
        { collapsable: true, headline: 'Threads' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_DebuggerThreadsComponent2 || _DebuggerThreadsComponent()).DebuggerThreadsComponent, {
            bridge: this.props.model.getBridge(),
            threadList: this.state.threadList,
            selectedThreadId: this.state.selectedThreadId
          })
        )
      ) : null;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-debugger-container-new' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiSection2 || _nuclideUiSection()).Section,
          { collapsable: true, headline: 'Debugger Controls' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_DebuggerSteppingComponent2 || _DebuggerSteppingComponent()).DebuggerSteppingComponent, {
              actions: actions,
              debuggerMode: this.state.debuggerMode,
              pauseOnException: this.state.togglePauseOnException,
              pauseOnCaughtException: this.state.togglePauseOnCaughtException,
              allowSingleThreadStepping: this.state.allowSingleThreadStepping,
              singleThreadStepping: this.state.enableSingleThreadStepping,
              customControlButtons: this.state.customControlButtons
            })
          )
        ),
        threadsSection,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiSection2 || _nuclideUiSection()).Section,
          { collapsable: true, headline: 'Call Stack' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_DebuggerCallstackComponent2 || _DebuggerCallstackComponent()).DebuggerCallstackComponent, {
              actions: actions,
              callstack: this.state.callstack,
              bridge: this.props.model.getBridge()
            })
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiSection2 || _nuclideUiSection()).Section,
          { collapsable: true, headline: 'Breakpoints' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_BreakpointListComponent2 || _BreakpointListComponent()).BreakpointListComponent, {
              actions: actions,
              breakpoints: this.state.breakpoints
            })
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiSection2 || _nuclideUiSection()).Section,
          { collapsable: true, headline: 'Locals' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(LocalsComponentWrapped, {
              watchExpressionStore: model.getWatchExpressionStore()
            })
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiSection2 || _nuclideUiSection()).Section,
          { collapsable: true, headline: 'Watch Expressions' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(WatchExpressionComponentWrapped, {
              onAddWatchExpression: actions.addWatchExpression.bind(model),
              onRemoveWatchExpression: actions.removeWatchExpression.bind(model),
              onUpdateWatchExpression: actions.updateWatchExpression.bind(model),
              watchExpressionStore: model.getWatchExpressionStore()
            })
          )
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