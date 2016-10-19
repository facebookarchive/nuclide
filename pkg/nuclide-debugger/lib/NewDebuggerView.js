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

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiSection;

function _load_nuclideUiSection() {
  return _nuclideUiSection = require('../../nuclide-ui/Section');
}

var _nuclideUiBindObservableAsProps;

function _load_nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _WatchExpressionComponent;

function _load_WatchExpressionComponent() {
  return _WatchExpressionComponent = require('./WatchExpressionComponent');
}

var _LocalsComponent;

function _load_LocalsComponent() {
  return _LocalsComponent = require('./LocalsComponent');
}

var _BreakpointListComponent;

function _load_BreakpointListComponent() {
  return _BreakpointListComponent = require('./BreakpointListComponent');
}

var _DebuggerSteppingComponent;

function _load_DebuggerSteppingComponent() {
  return _DebuggerSteppingComponent = require('./DebuggerSteppingComponent');
}

var _DebuggerCallstackComponent;

function _load_DebuggerCallstackComponent() {
  return _DebuggerCallstackComponent = require('./DebuggerCallstackComponent');
}

var _DebuggerThreadsComponent;

function _load_DebuggerThreadsComponent() {
  return _DebuggerThreadsComponent = require('./DebuggerThreadsComponent');
}

var NewDebuggerView = (function (_React$Component) {
  _inherits(NewDebuggerView, _React$Component);

  function NewDebuggerView(props) {
    _classCallCheck(this, NewDebuggerView);

    _get(Object.getPrototypeOf(NewDebuggerView.prototype), 'constructor', this).call(this, props);
    this._watchExpressionComponentWrapped = (0, (_nuclideUiBindObservableAsProps || _load_nuclideUiBindObservableAsProps()).bindObservableAsProps)(props.model.getWatchExpressionListStore().getWatchExpressions().map(function (watchExpressions) {
      return { watchExpressions: watchExpressions };
    }), (_WatchExpressionComponent || _load_WatchExpressionComponent()).WatchExpressionComponent);
    this._localsComponentWrapped = (0, (_nuclideUiBindObservableAsProps || _load_nuclideUiBindObservableAsProps()).bindObservableAsProps)(props.model.getLocalsStore().getLocals().map(function (locals) {
      return { locals: locals };
    }), (_LocalsComponent || _load_LocalsComponent()).LocalsComponent);
    this._disposables = new (_atom || _load_atom()).CompositeDisposable();
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
      var threadsSection = this.state.showThreadsWindow ? (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiSection || _load_nuclideUiSection()).Section,
        { collapsable: true, headline: 'Threads' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_DebuggerThreadsComponent || _load_DebuggerThreadsComponent()).DebuggerThreadsComponent, {
            bridge: this.props.model.getBridge(),
            threadList: this.state.threadList,
            selectedThreadId: this.state.selectedThreadId
          })
        )
      ) : null;
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-debugger-container-new' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiSection || _load_nuclideUiSection()).Section,
          { collapsable: true, headline: 'Debugger Controls' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom || _load_reactForAtom()).React.createElement((_DebuggerSteppingComponent || _load_DebuggerSteppingComponent()).DebuggerSteppingComponent, {
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
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiSection || _load_nuclideUiSection()).Section,
          { collapsable: true, headline: 'Call Stack' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom || _load_reactForAtom()).React.createElement((_DebuggerCallstackComponent || _load_DebuggerCallstackComponent()).DebuggerCallstackComponent, {
              actions: actions,
              callstack: this.state.callstack,
              bridge: this.props.model.getBridge()
            })
          )
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiSection || _load_nuclideUiSection()).Section,
          { collapsable: true, headline: 'Breakpoints' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom || _load_reactForAtom()).React.createElement((_BreakpointListComponent || _load_BreakpointListComponent()).BreakpointListComponent, {
              actions: actions,
              breakpoints: this.state.breakpoints
            })
          )
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiSection || _load_nuclideUiSection()).Section,
          { collapsable: true, headline: 'Locals' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom || _load_reactForAtom()).React.createElement(LocalsComponentWrapped, {
              watchExpressionStore: model.getWatchExpressionStore()
            })
          )
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiSection || _load_nuclideUiSection()).Section,
          { collapsable: true, headline: 'Watch Expressions' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            (_reactForAtom || _load_reactForAtom()).React.createElement(WatchExpressionComponentWrapped, {
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
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.NewDebuggerView = NewDebuggerView;