"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _Table() {
  const data = require("../../../../../nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../../../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../../../../../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
class DebuggerCallstackComponent extends React.Component {
  constructor(props) {
    super(props);

    this._handleStackFrameClick = (clickedRow, callFrameIndex) => {
      this.props.service.focusStackFrame(clickedRow.frame, null, null, true);
    };

    this._disposables = new (_UniversalDisposable().default)();
    this.state = this._getState();
  }

  _getState() {
    const {
      service
    } = this.props;
    const {
      focusedStackFrame,
      focusedThread
    } = service.viewModel;
    return {
      callStackLevels: this.state == null ? 20 : this.state.callStackLevels,
      mode: service.getDebuggerMode(),
      callstack: focusedThread == null ? [] : focusedThread.getCallStack(),
      selectedCallFrameId: focusedStackFrame == null ? -1 : focusedStackFrame.frameId,
      isFechingStackFrames: false
    };
  }

  componentDidMount() {
    const {
      service
    } = this.props;
    const model = service.getModel();
    const {
      viewModel
    } = service;

    this._disposables.add(_RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)), (0, _event().observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel)), (0, _event().observableFromSubscribeFunction)(service.onDidChangeMode.bind(service))).let((0, _observable().fastDebounce)(15)).subscribe(() => this.setState(this._getState())));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const {
      callstack,
      mode
    } = this.state;
    const rows = callstack == null ? [] : callstack.map((stackFrame, index) => {
      const isSelected = this.state.selectedCallFrameId === stackFrame.frameId;
      const cellData = {
        data: {
          frameId: index + 1,
          address: stackFrame.name,
          frame: stackFrame,
          isSelected
        }
      };

      if (isSelected) {
        // $FlowIssue className is an optional property of a table row
        cellData.className = 'debugger-callstack-item-selected';
      }

      return cellData;
    });
    const columns = [{
      title: '',
      key: 'frameId',
      width: 0.05
    }, {
      title: 'Address',
      key: 'address',
      width: 0.95
    }];

    const emptyComponent = () => React.createElement("div", {
      className: "debugger-callstack-list-empty"
    }, "callstack unavailable");

    return React.createElement("div", {
      className: (0, _classnames().default)('debugger-container-new', {
        'debugger-container-new-disabled': mode === _constants().DebuggerMode.RUNNING
      })
    }, React.createElement("div", {
      className: "debugger-pane-content"
    }, React.createElement(_Table().Table, {
      className: "debugger-callstack-table",
      columns: columns,
      emptyComponent: emptyComponent,
      rows: rows,
      selectable: cellData => cellData.frame.source.available,
      resizable: true,
      onSelect: this._handleStackFrameClick,
      sortable: false
    }), this._renderLoadMoreStackFrames()));
  }

  _renderLoadMoreStackFrames() {
    var _ref;

    const {
      viewModel
    } = this.props.service;
    const {
      callstack,
      isFechingStackFrames
    } = this.state;
    const totalFrames = ((_ref = viewModel) != null ? (_ref = _ref.focusedThread) != null ? (_ref = _ref.stoppedDetails) != null ? _ref.totalFrames : _ref : _ref : _ref) || 0;

    if (totalFrames <= callstack.length || callstack.length <= 1) {
      return null;
    }

    return React.createElement("div", {
      style: {
        display: 'flex'
      }
    }, React.createElement(_Button().Button, {
      size: _Button().ButtonSizes.EXTRA_SMALL,
      disabled: isFechingStackFrames,
      onClick: () => {
        this.setState({
          isFechingStackFrames: true
        });
        (0, _nullthrows().default)(viewModel.focusedThread).fetchCallStack(this.state.callStackLevels).then(() => this.setState(this._getState()));
      }
    }, "More Stack Frames"), React.createElement(_AtomInput().AtomInput, {
      style: {
        'flex-grow': '1'
      },
      placeholderText: "Number of stack frames",
      initialValue: String(this.state.callStackLevels),
      size: "xs",
      onDidChange: value => {
        if (!isNaN(value)) {
          this.setState({
            callStackLevels: parseInt(value, 10)
          });
        }
      }
    }), React.createElement(_AtomInput().AtomInput, null), isFechingStackFrames ? React.createElement(_LoadingSpinner().LoadingSpinner, {
      size: _LoadingSpinner().LoadingSpinnerSizes.EXTRA_SMALL
    }) : null);
  }

}

exports.default = DebuggerCallstackComponent;