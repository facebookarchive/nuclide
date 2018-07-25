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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _ScopesComponent() {
  const data = _interopRequireDefault(require("./ScopesComponent"));

  _ScopesComponent = function () {
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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class ScopesView extends React.PureComponent {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      mode: props.service.getDebuggerMode()
    };
  }

  componentDidMount() {
    const {
      service
    } = this.props;

    this._disposables.add((0, _event().observableFromSubscribeFunction)(service.onDidChangeMode.bind(service)).subscribe(mode => this.setState({
      mode
    })));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const {
      service
    } = this.props;
    const {
      mode
    } = this.state;
    const disabledClass = mode !== _constants().DebuggerMode.RUNNING ? '' : ' debugger-container-new-disabled';
    return React.createElement("div", {
      className: (0, _classnames().default)('debugger-container-new', disabledClass)
    }, React.createElement("div", {
      className: "debugger-pane-content"
    }, React.createElement(_ScopesComponent().default, {
      service: service
    })));
  }

}

exports.default = ScopesView;