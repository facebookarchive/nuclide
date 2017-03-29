'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewDebuggerView = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _ResizableFlexContainer;

function _load_ResizableFlexContainer() {
  return _ResizableFlexContainer = require('../../nuclide-ui/ResizableFlexContainer');
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

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class NewDebuggerView extends _react.default.PureComponent {

  constructor(props) {
    super(props);
    this._watchExpressionComponentWrapped = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props.model.getWatchExpressionListStore().getWatchExpressions().map(watchExpressions => ({ watchExpressions })), (_WatchExpressionComponent || _load_WatchExpressionComponent()).WatchExpressionComponent);
    this._scopesComponentWrapped = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props.model.getScopesStore().getScopes().map(scopes => ({ scopes })), (_ScopesComponent || _load_ScopesComponent()).ScopesComponent);
    this._disposables = new _atom.CompositeDisposable();
    const debuggerStore = props.model.getStore();
    this.state = {
      showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
      customThreadColumns: debuggerStore.getSettings().get('CustomThreadColumns') || [],
      mode: debuggerStore.getDebuggerMode(),
      threadsComponentTitle: String(debuggerStore.getSettings().get('threadsComponentTitle'))
    };
  }

  componentDidMount() {
    const debuggerStore = this.props.model.getStore();
    this._disposables.add(debuggerStore.onChange(() => {
      this.setState({
        showThreadsWindow: Boolean(debuggerStore.getSettings().get('SupportThreadsWindow')),
        customThreadColumns: debuggerStore.getSettings().get('CustomThreadColumns') || [],
        mode: debuggerStore.getDebuggerMode(),
        threadsComponentTitle: String(debuggerStore.getSettings().get('threadsComponentTitle'))
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
    const {
      mode,
      threadsComponentTitle,
      customThreadColumns
    } = this.state;
    const WatchExpressionComponentWrapped = this._watchExpressionComponentWrapped;
    const ScopesComponentWrapped = this._scopesComponentWrapped;
    const disabledClass = mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING ? '' : ' nuclide-debugger-container-new-disabled';

    let threadsSection = null;
    if (this.state.showThreadsWindow) {
      threadsSection = _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        _react.default.createElement(
          (_Section || _load_Section()).Section,
          { headline: threadsComponentTitle,
            className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-section-header', disabledClass) },
          _react.default.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            _react.default.createElement((_DebuggerThreadsComponent || _load_DebuggerThreadsComponent()).DebuggerThreadsComponent, {
              bridge: this.props.model.getBridge(),
              threadStore: model.getThreadStore(),
              customThreadColumns: customThreadColumns,
              threadName: threadsComponentTitle
            })
          )
        )
      );
    }

    const breakpointItem = _react.default.createElement(
      (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
      { initialFlexScale: 1 },
      _react.default.createElement(
        (_Section || _load_Section()).Section,
        { headline: 'Breakpoints',
          key: 'breakpoints',
          className: 'nuclide-debugger-section-header' },
        _react.default.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _react.default.createElement((_BreakpointListComponent || _load_BreakpointListComponent()).BreakpointListComponent, {
            actions: actions,
            breakpointStore: model.getBreakpointStore()
          })
        )
      )
    );

    const debuggerStoppedNotice = mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED ? null : _react.default.createElement(
      (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexContainer,
      { direction: (_ResizableFlexContainer || _load_ResizableFlexContainer()).FlexDirections.VERTICAL },
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        _react.default.createElement(
          'div',
          { className: 'nuclide-debugger-state-notice' },
          _react.default.createElement(
            'span',
            null,
            'The debugger is not attached.'
          ),
          _react.default.createElement(
            'div',
            { className: 'nuclide-debugger-state-notice' },
            _react.default.createElement(
              (_Button || _load_Button()).Button,
              {
                onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle') },
              'Start debugging'
            )
          )
        )
      ),
      breakpointItem
    );

    const debugeeRunningNotice = mode !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING ? null : _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-state-notice' },
      'The debugee is currently running.'
    );

    const debugFlexContainer = _react.default.createElement(
      (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexContainer,
      { direction: (_ResizableFlexContainer || _load_ResizableFlexContainer()).FlexDirections.VERTICAL },
      threadsSection,
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        _react.default.createElement(
          (_Section || _load_Section()).Section,
          { headline: 'Call Stack',
            key: 'callStack',
            className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-section-header', disabledClass) },
          _react.default.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            _react.default.createElement((_DebuggerCallstackComponent || _load_DebuggerCallstackComponent()).DebuggerCallstackComponent, {
              actions: actions,
              bridge: model.getBridge(),
              callstackStore: model.getCallstackStore()
            })
          )
        )
      ),
      breakpointItem,
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        _react.default.createElement(
          (_Section || _load_Section()).Section,
          { headline: 'Scopes',
            key: 'scopes',
            className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-section-header', disabledClass) },
          _react.default.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            _react.default.createElement(ScopesComponentWrapped, {
              watchExpressionStore: model.getWatchExpressionStore()
            })
          )
        )
      ),
      _react.default.createElement(
        (_ResizableFlexContainer || _load_ResizableFlexContainer()).ResizableFlexItem,
        { initialFlexScale: 1 },
        _react.default.createElement(
          (_Section || _load_Section()).Section,
          { headline: 'Watch Expressions',
            key: 'watchExpressions',
            className: 'nuclide-debugger-section-header' },
          _react.default.createElement(
            'div',
            { className: 'nuclide-debugger-section-content' },
            _react.default.createElement(WatchExpressionComponentWrapped, {
              onAddWatchExpression: actions.addWatchExpression.bind(model),
              onRemoveWatchExpression: actions.removeWatchExpression.bind(model),
              onUpdateWatchExpression: actions.updateWatchExpression.bind(model),
              watchExpressionStore: model.getWatchExpressionStore()
            })
          )
        )
      )
    );

    const debuggerContents = debuggerStoppedNotice || debugFlexContainer;
    return _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-container-new' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-section-header nuclide-debugger-controls-section' },
        _react.default.createElement(
          'div',
          { className: 'nuclide-debugger-section-content' },
          _react.default.createElement((_DebuggerSteppingComponent || _load_DebuggerSteppingComponent()).DebuggerSteppingComponent, {
            actions: actions,
            debuggerStore: model.getStore()
          })
        )
      ),
      debugeeRunningNotice,
      debuggerContents
    );
  }

  _dispose() {
    this._disposables.dispose();
  }
}
exports.NewDebuggerView = NewDebuggerView;