"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _FullWidthProgressBar() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons-ui/FullWidthProgressBar"));

  _FullWidthProgressBar = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _TaskRunnerStatusTooltip() {
  const data = _interopRequireDefault(require("./TaskRunnerStatusTooltip"));

  _TaskRunnerStatusTooltip = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class TaskRunnerStatusComponent extends React.Component {
  // Legacy of migration, will remove this later.
  _tickUpdateSeconds() {
    const timenow = Date.now() - this._mountTimestamp;

    this.setState({
      secondsSinceMount: timenow / 1000
    });
  }

  constructor() {
    super(); // $FlowFixMe: debounce() is not in flow types for rxjs

    this._tooltipRefs = new Map();
    this._hoveredProviderName = new _rxjsCompatUmdMin.BehaviorSubject(null);
    this._disposables = new (_UniversalDisposable().default)();
    this._mountTimestamp = 0;
    this.state = {
      hoveredProviderName: null,
      secondsSinceMount: 0,
      visible: false
    };

    this._renderProvider = (status, visible, hovered) => {
      const {
        provider
      } = status;
      return React.createElement("div", {
        className: (0, _classnames().default)('nuclide-taskbar-status-provider', 'nuclide-taskbar-status-provider-green'),
        onMouseOver: this._onMouseOver,
        onMouseOut: this._onMouseOut,
        "data-name": status.provider.name,
        key: status.provider.name,
        style: {
          opacity: visible || hovered ? 1 : 0
        },
        ref: this._setTooltipRef
      }, this.props.title == null || this.props.title === '' ? this._defaultTitle() : React.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: this.props.title
        }
      }), React.createElement("div", {
        className: "fb-on-demand-beta-small nuclide-taskbar-beta-small"
      }), this.state.hoveredProviderName !== provider.name || this.props.body == null || this.props.body === '' ? null : React.createElement(_TaskRunnerStatusTooltip().default, {
        body: this.props.body,
        parentRef: this._tooltipRefs.get(status.provider.name),
        status: status
      }));
    };

    this._setTooltipRef = ref => {
      if (ref == null) {
        return;
      }

      this._tooltipRefs.set(ref.dataset.name, ref);
    };

    this._onMouseOver = e => {
      this._hoveredProviderName.next(e.currentTarget.dataset.name);
    };

    this._onMouseOut = () => {
      this._hoveredProviderName.next(null);
    };

    const hoveredProviderNameDebounced = this._hoveredProviderName.debounce(hoveredProviderName => {
      // No debounce when hovering on to, 250ms debounce when hovering off of
      return _rxjsCompatUmdMin.Observable.empty().delay(hoveredProviderName != null ? 0 : 250);
    });

    this._disposables.add(hoveredProviderNameDebounced.subscribe(hoveredProviderName => {
      this.setState({
        hoveredProviderName
      });
    }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible && !prevState.visible) {
      this._startTimer();
    }

    if (!this.state.visible && prevState.visible) {
      this._stopTimer();
    }

    if (this.props.taskbarVisible) {
      if (this.props.taskIsRunning && !this.state.visible) {
        this.setState({
          visible: true
        });
      }
    } else {
      if (this.state.visible) {
        this.setState({
          visible: false
        });
      }
    }
  }

  componentWillUnmount() {
    this._stopTimer();

    this._disposables.dispose();
  }

  _startTimer() {
    this._stopTimer();

    this._mountTimestamp = Date.now();
    this._intervalID = setInterval(() => {
      this._tickUpdateSeconds();
    }, 100);
  }

  _stopTimer() {
    if (this._intervalID != null) {
      clearInterval(this._intervalID);
      this._intervalID = null;
    }
  }

  _defaultTitle() {
    return React.createElement("div", null, "Running task...", React.createElement("span", null, " ", this.state.secondsSinceMount.toFixed(1), " "), "sec");
  }

  render() {
    const serverStatus = {
      data: {
        kind: 'green',
        message: this.props.header,
        buttons: ['Stop']
      },
      provider: {
        name: '',
        description: '',
        priority: 1
      }
    };
    const clearButton = React.createElement("div", {
      className: "close-icon",
      onClick: () => this.setState({
        visible: false
      })
    });

    if (!this.state.visible) {
      return null;
    }

    return React.createElement("div", {
      className: "nuclide-taskbar-status-container"
    }, React.createElement(_FullWidthProgressBar().default, {
      progress: this.props.progress == null ? 0 : this.props.progress,
      visible: this.props.taskbarVisible
    }), React.createElement("div", {
      className: "nuclide-taskbar-status-providers-container"
    }, this._renderProvider(serverStatus, this.props.taskbarVisible, this.state.hoveredProviderName != null), clearButton));
  }

}

exports.default = TaskRunnerStatusComponent;