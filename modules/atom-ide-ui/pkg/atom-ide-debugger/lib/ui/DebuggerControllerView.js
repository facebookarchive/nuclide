"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _LoadingSpinner() {
  const data = require("../../../../../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
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
 *  strict-local
 * @format
 */
class DebuggerControllerView extends React.Component {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    const {
      service
    } = this.props;

    this._disposables.add((0, _event().observableFromSubscribeFunction)(service.onDidChangeMode.bind(service)).subscribe(mode => this.forceUpdate()));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    if (this.props.service.getDebuggerMode() === _constants().DebuggerMode.STARTING) {
      return React.createElement("div", {
        className: "debugger-starting-message"
      }, React.createElement("div", null, React.createElement("span", {
        className: "inline-block"
      }, "Starting Debugger..."), React.createElement(_LoadingSpinner().LoadingSpinner, {
        className: "inline-block",
        size: "EXTRA_SMALL"
      })));
    }

    return null;
  }

}

exports.default = DebuggerControllerView;