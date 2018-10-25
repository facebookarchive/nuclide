"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _marked() {
  const data = _interopRequireDefault(require("marked"));

  _marked = function () {
    return data;
  };

  return data;
}

function _Tooltip() {
  const data = _interopRequireDefault(require("./Tooltip"));

  _Tooltip = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

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
class TaskRunnerStatusTooltipComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      maxWidth: 0,
      maxHeight: 0
    };
    this.myRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    var _this$myRef$current, _this$myRef$current2;

    const width = (_this$myRef$current = this.myRef.current) === null || _this$myRef$current === void 0 ? void 0 : _this$myRef$current.offsetWidth;
    const height = (_this$myRef$current2 = this.myRef.current) === null || _this$myRef$current2 === void 0 ? void 0 : _this$myRef$current2.offsetHeight;

    if (this.state.maxWidth !== width) {
      this.setState({
        maxWidth: width
      });
    }

    if (this.state.maxHeight !== height) {
      this.setState({
        maxHeight: height
      });
    }
  }

  render() {
    this._styleTooltip();

    const {
      data
    } = this.props.status;

    if (!(data.kind !== 'null')) {
      throw new Error("Invariant violation: \"data.kind !== 'null'\"");
    }

    const message = data.message;
    return React.createElement("div", {
      className: "nuclide-taskbar-status-tooltip-content",
      ref: this.myRef,
      style: {
        'min-width': this.state.maxWidth + 'px',
        'min-height': this.state.maxHeight + 'px'
      }
    }, message == null ? null : React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: (0, _marked().default)(message)
      }
    }), message == null ? null : React.createElement("hr", null), React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: (0, _marked().default)(this.props.body)
      }
    }));
  }

  _styleTooltip() {
    const {
      tooltipRoot,
      status
    } = this.props;

    if (tooltipRoot != null) {
      tooltipRoot.classList.remove('nuclide-taskbar-status-tooltip-green', 'nuclide-taskbar-status-tooltip-yellow', 'nuclide-taskbar-status-tooltip-red');
      tooltipRoot.classList.add('nuclide-taskbar-status-tooltip-' + status.data.kind);
    }
  }

}

const TaskRunnerStatusTooltip = (0, _Tooltip().default)(TaskRunnerStatusTooltipComponent);
var _default = TaskRunnerStatusTooltip;
exports.default = _default;