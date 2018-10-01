"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _AtomInput() {
  const data = require("../../../../../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Tree() {
  const data = require("../../../../../nuclide-commons-ui/Tree");

  _Tree = function () {
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

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _ProcessTreeNode() {
  const data = _interopRequireDefault(require("./ProcessTreeNode"));

  _ProcessTreeNode = function () {
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

function _ButtonGroup() {
  const data = require("../../../../../nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _DebuggerAddTargetButton() {
  const data = require("./DebuggerAddTargetButton");

  _DebuggerAddTargetButton = function () {
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
const SHOW_PAUSED_ONLY_KEY = 'debugger-show-paused-threads-only';

class DebuggerProcessComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      processList: this.props.service.getModel().getProcesses(),
      filter: null,
      showPausedThreadsOnly: Boolean(_featureConfig().default.get(SHOW_PAUSED_ONLY_KEY))
    };
  }

  componentDidMount() {
    const {
      service
    } = this.props;
    const model = service.getModel();

    this._disposables.add((0, _event().observableFromSubscribeFunction)(model.onDidChangeProcesses.bind(model)).let((0, _observable().fastDebounce)(150)).subscribe(() => {
      this.setState({
        processList: model.getProcesses()
      });
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const {
      processList,
      filter
    } = this.state;
    const {
      service
    } = this.props;
    let filterRegEx = null;

    try {
      if (filter != null) {
        filterRegEx = new RegExp(filter, 'ig');
      }
    } catch (_) {}

    const processElements = processList.map((process, processIndex) => {
      const {
        adapterType,
        processName
      } = process.configuration;
      return process == null ? 'No processes are currently being debugged' : React.createElement(_ProcessTreeNode().default, {
        title: processName != null ? processName : adapterType,
        filter: filter,
        filterRegEx: filterRegEx,
        showPausedThreadsOnly: this.state.showPausedThreadsOnly,
        key: process.getId(),
        childItems: process.getAllThreads(),
        process: process,
        service: service
      });
    });
    return React.createElement("div", null, React.createElement("div", {
      className: "debugger-thread-filter-row"
    }, React.createElement(_AtomInput().AtomInput, {
      className: "debugger-thread-filter-box",
      placeholderText: "Filter threads...",
      value: this.state.filter || '',
      size: "sm",
      onDidChange: text => {
        this.setState({
          filter: text
        });
      },
      autofocus: false
    }), React.createElement(_ButtonGroup().ButtonGroup, {
      className: "inline-block"
    }, React.createElement(_Button().Button, {
      icon: 'playback-pause',
      size: _Button().ButtonSizes.SMALL,
      selected: this.state.showPausedThreadsOnly,
      onClick: () => {
        _featureConfig().default.set(SHOW_PAUSED_ONLY_KEY, !this.state.showPausedThreadsOnly);

        this.setState(prevState => ({
          showPausedThreadsOnly: !prevState.showPausedThreadsOnly
        }));
      },
      tooltip: {
        title: 'Show only paused threads'
      }
    }), React.createElement(_Button().Button, {
      icon: 'x',
      disabled: !this.state.showPausedThreadsOnly && (this.state.filter === '' || this.state.filter == null),
      size: _Button().ButtonSizes.SMALL,
      onClick: () => {
        _featureConfig().default.set(SHOW_PAUSED_ONLY_KEY, false);

        this.setState({
          showPausedThreadsOnly: false,
          filter: ''
        });
      },
      tooltip: {
        title: 'Clear thread filters'
      }
    })), (0, _DebuggerAddTargetButton().AddTargetButton)('debugger-stepping-buttongroup')), React.createElement(_Tree().TreeList, {
      showArrows: true
    }, processElements));
  }

}

exports.default = DebuggerProcessComponent;