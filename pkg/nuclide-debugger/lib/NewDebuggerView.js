'use strict';

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

var _ScopesComponent;

function _load_ScopesComponent() {
  return _ScopesComponent = require('./ScopesComponent');
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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class NewDebuggerView extends _reactForAtom.React.PureComponent {

  constructor(props) {
    super(props);
    this._watchExpressionComponentWrapped = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props.model.getWatchExpressionListStore().getWatchExpressions().map(watchExpressions => ({ watchExpressions })), (_WatchExpressionComponent || _load_WatchExpressionComponent()).WatchExpressionComponent);
    this._scopesComponentWrapped = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props.model.getScopesStore().getScopes().map(scopes => ({ scopes })), (_ScopesComponent || _load_ScopesComponent()).ScopesComponent);
    this._disposables = new _atom.CompositeDisposable();
    const debuggerStore = props.model.getStore();
    this.state = {
      showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow'))
    };
  }

  componentDidMount() {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(debuggerStore.onChange(() => {
      this.setState({
        showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow'))
      });
    }));
  }

  componentWillUnmount() {
    this._dispose();
  }

  render() {
    const {
      model
    } = this.props;
    const actions = model.getActions();
    const WatchExpressionComponentWrapped = this._watchExpressionComponentWrapped;
    const ScopesComponentWrapped = this._scopesComponentWrapped;
    const threadsSection = this.state.showThreadsWindow ? _reactForAtom.React.createElement(
      (_Section || _load_Section()).Section,
      { collapsable: true, headline: 'Threads',
        className: 'nuclide-debugger-section-header' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-section-content' },
        _reactForAtom.React.createElement((_DebuggerThreadsComponent || _load_DebuggerThreadsComponent()).DebuggerThreadsComponent, {
          bridge: this.props.model.getBridge(),
          threadStore: model.getThreadStore()
        })
      )
    ) : null;
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-container-new' },
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Debugger Controls',
          className: 'nuclide-debugger-section-header' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement((_DebuggerSteppingComponent || _load_DebuggerSteppingComponent()).DebuggerSteppingComponent, {
            actions: actions,
            debuggerStore: model.getStore()
          })
        )
      ),
      threadsSection,
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Call Stack',
          className: 'nuclide-debugger-section-header' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement((_DebuggerCallstackComponent || _load_DebuggerCallstackComponent()).DebuggerCallstackComponent, {
            actions: actions,
            bridge: model.getBridge(),
            callstackStore: model.getCallstackStore()
          })
        )
      ),
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Breakpoints',
          className: 'nuclide-debugger-section-header' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement((_BreakpointListComponent || _load_BreakpointListComponent()).BreakpointListComponent, {
            actions: actions,
            breakpointStore: model.getBreakpointStore()
          })
        )
      ),
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Scopes',
          className: 'nuclide-debugger-section-header' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _reactForAtom.React.createElement(ScopesComponentWrapped, {
            watchExpressionStore: model.getWatchExpressionStore()
          })
        )
      ),
      _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        { collapsable: true, headline: 'Watch Expressions',
          className: 'nuclide-debugger-section-header' },
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
}
exports.NewDebuggerView = NewDebuggerView;