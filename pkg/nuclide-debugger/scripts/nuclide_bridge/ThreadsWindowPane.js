var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _NuclideBridge;

function _load_NuclideBridge() {
  return _NuclideBridge = _interopRequireDefault(require('./NuclideBridge'));
}

var _react;

function _load_react() {
  return _react = _interopRequireDefault(require('react'));
}

var _reactDom;

function _load_reactDom() {
  return _reactDom = _interopRequireDefault(require('react-dom'));
}

var _libWebInspector;

function _load_libWebInspector() {
  return _libWebInspector = _interopRequireDefault(require('../../lib/WebInspector'));
}

var ThreadsWindowComponent = (function (_default$Component) {
  _inherits(ThreadsWindowComponent, _default$Component);

  function ThreadsWindowComponent(props) {
    _classCallCheck(this, ThreadsWindowComponent);

    _get(Object.getPrototypeOf(ThreadsWindowComponent.prototype), 'constructor', this).call(this, props);
    this._registerUpdate();
    this.state = {
      threadData: null
    };
    this._stoppedThread = null;
    this._handleThreadsUpdated = this._handleThreadsUpdated.bind(this);
    this._handleClearInterface = this._handleClearInterface.bind(this);
  }

  _createClass(ThreadsWindowComponent, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._unregisterUpdate();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // We can currently scroll to the stopped thread after each render
      // because we are only rendering when we update the threads. If we
      // add more UI functionality and state changes then we may need to add
      // flags so that we are only scrolling at the correct times.
      this._scrollToStoppedThread();
    }
  }, {
    key: '_handleThreadsUpdated',
    value: function _handleThreadsUpdated(event) {
      this.setState(this._getState());
    }
  }, {
    key: '_getState',
    value: function _getState() {
      var threadData = null;
      var mainTarget = (_libWebInspector || _load_libWebInspector()).default.targetManager.mainTarget();
      if (mainTarget != null) {
        threadData = mainTarget.debuggerModel.threadStore.getData();
      }
      return { threadData: threadData };
    }
  }, {
    key: '_registerUpdate',
    value: function _registerUpdate() {
      (_libWebInspector || _load_libWebInspector()).default.targetManager.addModelListener((_libWebInspector || _load_libWebInspector()).default.DebuggerModel, (_libWebInspector || _load_libWebInspector()).default.DebuggerModel.Events.ThreadsUpdated, this._handleThreadsUpdated, this);
      (_libWebInspector || _load_libWebInspector()).default.targetManager.addModelListener((_libWebInspector || _load_libWebInspector()).default.DebuggerModel, (_libWebInspector || _load_libWebInspector()).default.DebuggerModel.Events.SelectedThreadChanged, this._handleThreadsUpdated, this);
      (_libWebInspector || _load_libWebInspector()).default.targetManager.addModelListener((_libWebInspector || _load_libWebInspector()).default.DebuggerModel, (_libWebInspector || _load_libWebInspector()).default.DebuggerModel.Events.ClearInterface, this._handleClearInterface, this);
    }
  }, {
    key: '_handleClearInterface',
    value: function _handleClearInterface(event) {
      this.setState({ threadData: null });
    }
  }, {
    key: '_unregisterUpdate',
    value: function _unregisterUpdate() {
      (_libWebInspector || _load_libWebInspector()).default.targetManager.removeModelListener((_libWebInspector || _load_libWebInspector()).default.DebuggerModel, (_libWebInspector || _load_libWebInspector()).default.DebuggerModel.Events.ThreadsUpdated, this._handleThreadsUpdated, this);
      (_libWebInspector || _load_libWebInspector()).default.targetManager.removeModelListener((_libWebInspector || _load_libWebInspector()).default.DebuggerModel, (_libWebInspector || _load_libWebInspector()).default.DebuggerModel.Events.SelectedThreadChanged, this._handleThreadsUpdated, this);
      (_libWebInspector || _load_libWebInspector()).default.targetManager.removeModelListener((_libWebInspector || _load_libWebInspector()).default.DebuggerModel, (_libWebInspector || _load_libWebInspector()).default.DebuggerModel.Events.ClearInterface, this._handleClearInterface, this);
    }
  }, {
    key: '_handleDoubleClick',
    value: function _handleDoubleClick(thread) {
      (_NuclideBridge || _load_NuclideBridge()).default.selectThread(thread.id);
    }

    /**
     * '>' means the stopped thread.
     * '*' means the current selected thread.
     * Empty space for other threads.
     */
  }, {
    key: '_getIndicator',
    value: function _getIndicator(thread, stopThreadId, selectedThreadId) {
      return thread.id === stopThreadId ? '>' : thread.id === selectedThreadId ? '*' : ' ';
    }
  }, {
    key: '_setStoppedThread',
    value: function _setStoppedThread(ref) {
      this._stoppedThread = ref;
    }
  }, {
    key: '_scrollToStoppedThread',
    value: function _scrollToStoppedThread() {
      if (this._stoppedThread != null) {
        this._stoppedThread.scrollIntoView();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var children = [];
      var threadData = this.state.threadData;

      if (threadData && threadData.threadMap) {
        for (var thread of threadData.threadMap.values()) {
          var indicator = this._getIndicator(thread, threadData.stopThreadId, threadData.selectedThreadId);
          var rowStyle = {};
          if (thread.id === threadData.selectedThreadId) {
            rowStyle.backgroundColor = '#cfcfcf';
          }
          if (indicator === '>') {
            children.push((_react || _load_react()).default.createElement(
              'tr',
              {
                onDoubleClick: this._handleDoubleClick.bind(this, thread),
                style: rowStyle,
                ref: function (ref) {
                  return _this._setStoppedThread(ref);
                } },
              (_react || _load_react()).default.createElement(
                'td',
                null,
                indicator
              ),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                thread.id
              ),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                thread.address
              ),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                thread.stopReason
              )
            ));
          } else {
            children.push((_react || _load_react()).default.createElement(
              'tr',
              {
                onDoubleClick: this._handleDoubleClick.bind(this, thread),
                style: rowStyle },
              (_react || _load_react()).default.createElement(
                'td',
                null,
                indicator
              ),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                thread.id
              ),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                thread.address
              ),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                thread.stopReason
              )
            ));
          }
        }
      }

      var containerStyle = {
        maxHeight: '20em',
        overflow: 'auto'
      };

      if (children.length > 0) {
        return (_react || _load_react()).default.createElement(
          'div',
          { style: containerStyle, className: 'nuclide-chrome-debugger-data-grid' },
          (_react || _load_react()).default.createElement(
            'table',
            { width: '100%' },
            (_react || _load_react()).default.createElement(
              'thead',
              null,
              (_react || _load_react()).default.createElement(
                'tr',
                { key: 0 },
                (_react || _load_react()).default.createElement('td', null),
                (_react || _load_react()).default.createElement(
                  'td',
                  null,
                  'ID'
                ),
                (_react || _load_react()).default.createElement(
                  'td',
                  null,
                  'Address'
                ),
                (_react || _load_react()).default.createElement(
                  'td',
                  null,
                  'Stop Reason'
                )
              )
            ),
            (_react || _load_react()).default.createElement(
              'tbody',
              null,
              children
            )
          )
        );
      } else {
        return (_react || _load_react()).default.createElement(
          'div',
          { className: 'info' },
          'No Threads'
        );
      }
    }
  }]);

  return ThreadsWindowComponent;
})((_react || _load_react()).default.Component);

var ThreadsWindowPane = (function (_default$SidebarPane) {
  _inherits(ThreadsWindowPane, _default$SidebarPane);

  function ThreadsWindowPane() {
    _classCallCheck(this, ThreadsWindowPane);

    // WebInspector classes are not es6 classes, but babel forces a super call.
    _get(Object.getPrototypeOf(ThreadsWindowPane.prototype), 'constructor', this).call(this);
    // Actual super call.
    (_libWebInspector || _load_libWebInspector()).default.SidebarPane.call(this, 'Threads');

    // TODO: change.
    this.registerRequiredCSS('components/breakpointsList.css');

    (_reactDom || _load_reactDom()).default.render((_react || _load_react()).default.createElement(ThreadsWindowComponent, null), this.bodyElement);

    this.expand();
  }

  // This is implemented by various UI views, but is not declared anywhere as
  // an official interface. There's callers to various `reset` functions, so
  // it's probably safer to have this.

  _createClass(ThreadsWindowPane, [{
    key: 'reset',
    value: function reset() {}
  }]);

  return ThreadsWindowPane;
})((_libWebInspector || _load_libWebInspector()).default.SidebarPane);

module.exports = ThreadsWindowPane;