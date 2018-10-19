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

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
    this._hoveredProviderName = new _RxMin.BehaviorSubject(null);
    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      hoveredProviderName: null,
      secondsSinceMount: 0
    };
    this.defaultTaskStatus = 'Running task...';
    this._mountTimestamp = 0;

    this._renderProvider = (status, visible, hovered) => {
      const {
        provider
      } = status;
      const defaultTitle = React.createElement("div", null, "Running task...", React.createElement("span", null, " ", this.state.secondsSinceMount.toFixed(1), " "), "sec");
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
      }, this.props.title == null || this.props.title === '' ? defaultTitle : React.createElement("div", {
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
      return _RxMin.Observable.empty().delay(hoveredProviderName != null ? 0 : 250);
    });

    this._disposables.add(hoveredProviderNameDebounced.subscribe(hoveredProviderName => {
      this.setState({
        hoveredProviderName
      });
    }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.visible && !prevProps.visible) {
      this._mountTimestamp = Date.now();
      this._intervalID = setInterval(() => {
        this._tickUpdateSeconds();
      }, 100);
    }

    if (!this.props.visible && prevProps.visible) {
      if (this._intervalID != null) {
        clearInterval(this._intervalID);
        this._intervalID = null;
      }
    }
  }

  componentWillUnmount() {
    if (this._intervalID != null) {
      clearInterval(this._intervalID);
      this._intervalID = null;
    }

    this._disposables.dispose();
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
    const visible = this.props.visible || this.props.title != null && this.props.title !== '';

    if (!visible) {
      return null;
    }

    return React.createElement("div", {
      className: "nuclide-taskbar-status-container",
      hidden: !visible
    }, React.createElement(_FullWidthProgressBar().default, {
      progress: this.props.progress == null ? 0 : this.props.progress,
      visible: true
    }), React.createElement("div", {
      className: "nuclide-taskbar-status-providers-container"
    }, this._renderProvider(serverStatus, true, this.state.hoveredProviderName != null)));
  }

}

exports.default = TaskRunnerStatusComponent;