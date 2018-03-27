'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThreadsView = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _DebuggerThreadsComponent;

function _load_DebuggerThreadsComponent() {
  return _DebuggerThreadsComponent = require('./DebuggerThreadsComponent');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ThreadsView extends _react.PureComponent {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const { model } = props;
    this.state = {
      mode: model.getDebuggerMode(),
      threadsComponentTitle: String(model.getSettings().threadsComponentTitle)
    };
  }

  componentDidMount() {
    const { model } = this.props;
    this._disposables.add(model.onChange(() => {
      this.setState({
        mode: model.getDebuggerMode(),
        threadsComponentTitle: model.getSettings().threadsComponentTitle
      });
    }));
  }

  componentWillUnmount() {
    this._dispose();
  }

  _dispose() {
    this._disposables.dispose();
  }

  render() {
    const { model } = this.props;
    const { mode, threadsComponentTitle } = this.state;
    const disabledClass = mode !== (_constants || _load_constants()).DebuggerMode.RUNNING ? '' : ' nuclide-debugger-container-new-disabled';

    const selectThread = model.selectThread.bind(model);

    return _react.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-container-new', disabledClass) },
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-pane-content' },
        _react.createElement((_DebuggerThreadsComponent || _load_DebuggerThreadsComponent()).DebuggerThreadsComponent, {
          selectThread: selectThread,
          model: model,
          threadName: threadsComponentTitle
        })
      )
    );
  }
}
exports.ThreadsView = ThreadsView; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */