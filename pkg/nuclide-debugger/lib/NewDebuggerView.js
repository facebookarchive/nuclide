'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewDebuggerView = undefined;

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
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

let NewDebuggerView = exports.NewDebuggerView = class NewDebuggerView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._watchExpressionComponentWrapped = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props.model.getWatchExpressionListStore().getWatchExpressions().map(watchExpressions => ({ watchExpressions: watchExpressions })), (_WatchExpressionComponent || _load_WatchExpressionComponent()).WatchExpressionComponent);
    this._localsComponentWrapped = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props.model.getLocalsStore().getLocals().map(locals => ({ locals: locals })), (_LocalsComponent || _load_LocalsComponent()).LocalsComponent);
    this._disposables = new _atom.CompositeDisposable();
    const debuggerStore = props.model.getStore();
    const threadStore = props.model.getThreadStore();
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

  componentDidMount() {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(debuggerStore.onChange(() => {
      this.setState({
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
    const callstackStore = this.props.model.getCallstackStore();
    this._disposables.add(callstackStore.onChange(() => {
      this.setState({
        callstack: callstackStore.getCallstack()
      });
    }));
    const breakpointStore = this.props.model.getBreakpointStore();
    this._disposables.add(breakpointStore.onNeedUIUpdate(() => {
      this.setState({
        breakpoints: breakpointStore.getAllBreakpoints()
      });
    }));
    const threadStore = this.props.model.getThreadStore();
    this._disposables.add(threadStore.onChange(() => {
      this.setState({
        threadList: threadStore.getThreadList(),
        selectedThreadId: threadStore.getSelectedThreadId()
      });
    }));
  }

  componentWillUnmount() {
    this._dispose();
  }

  render() {
    const model = this.props.model;

    const actions = model.getActions();
    const WatchExpressionComponentWrapped = this._watchExpressionComponentWrapped;
    const LocalsComponentWrapped = this._localsComponentWrapped;
    const threadsSection = this.state.showThreadsWindow ? _reactForAtom.React.createElement(
      (_Section || _load_Section()).Section,
      { collapsable: true, headline: 'Threads' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-section-content' },
        _reactForAtom.React.createElement((_DebuggerThreadsComponent || _load_DebuggerThreadsComponent()).DebuggerThreadsComponent, {
          bridge: this.props.model.getBridge(),
          threadList: this.state.threadList,
          selectedThreadId: this.state.selectedThreadId
        })
      )
    ) : null;
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-container-new' },
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Debugger Controls' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement((_DebuggerSteppingComponent || _load_DebuggerSteppingComponent()).DebuggerSteppingComponent, {
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
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Call Stack' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement((_DebuggerCallstackComponent || _load_DebuggerCallstackComponent()).DebuggerCallstackComponent, {
            actions: actions,
            callstack: this.state.callstack,
            bridge: this.props.model.getBridge()
          })
        )
      ),
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Breakpoints' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement((_BreakpointListComponent || _load_BreakpointListComponent()).BreakpointListComponent, {
            actions: actions,
            breakpoints: this.state.breakpoints
          })
        )
      ),
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Locals' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement(LocalsComponentWrapped, {
            watchExpressionStore: model.getWatchExpressionStore()
          })
        )
      ),
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Watch Expressions' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement(WatchExpressionComponentWrapped, {
            onAddWatchExpression: actions.addWatchExpression.bind(model),
            onRemoveWatchExpression: actions.removeWatchExpression.bind(model),
            onUpdateWatchExpression: actions.updateWatchExpression.bind(model),
            watchExpressionStore: model.getWatchExpressionStore()
          })
        )
      )
    );
  }

  _dispose() {
    this._disposables.dispose();
  }
};