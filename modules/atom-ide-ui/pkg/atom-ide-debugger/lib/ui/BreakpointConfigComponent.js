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

var React = _interopRequireWildcard(require("react"));

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

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../../../../nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _Modal() {
  const data = require("../../../../../nuclide-commons-ui/Modal");

  _Modal = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _analytics() {
  const data = require("../../../../../nuclide-commons/analytics");

  _analytics = function () {
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
class BreakpointConfigComponent extends React.Component {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      bpId: this.props.breakpoint.getId()
    };
    const model = this.props.service.getModel();

    this._disposables.add(model.onDidChangeBreakpoints(() => {
      const breakpoint = model.getBreakpoints().filter(bp => bp.getId() === this.state.bpId);

      if (breakpoint == null) {
        // Breakpoint no longer exists.
        this.props.onDismiss();
      }

      this.forceUpdate();
    }));
  }

  componentDidMount() {
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_BREAKPOINT_CONFIG_UI_SHOW, {
      fileExtension: _nuclideUri().default.extname(this.props.breakpoint.uri)
    });

    this._disposables.add(atom.commands.add('atom-workspace', 'core:cancel', this.props.onDismiss), atom.commands.add('atom-workspace', 'core:confirm', this._updateBreakpoint.bind(this)), _RxMin.Observable.timer(100).subscribe(() => {
      if (this._condition != null) {
        this._condition.focus();
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  async _updateBreakpoint() {
    const {
      breakpoint,
      service
    } = this.props;
    const condition = (0, _nullthrows().default)(this._condition).getText().trim();

    if (condition === (breakpoint.condition || '')) {
      this.props.onDismiss();
      return;
    }

    await service.removeBreakpoints(breakpoint.getId());
    const bp = {
      line: breakpoint.line,
      column: breakpoint.column,
      enabled: breakpoint.enabled
    };

    if (condition !== '') {
      bp.condition = condition;
    }

    await service.addBreakpoints(breakpoint.uri, [bp]);
    (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_BREAKPOINT_UPDATE_CONDITION, {
      path: breakpoint.uri,
      line: breakpoint.line,
      condition,
      fileExtension: _nuclideUri().default.extname(breakpoint.uri)
    });
    this.props.onDismiss();
  }

  render() {
    return React.createElement(_Modal().Modal, {
      onDismiss: this.props.onDismiss
    }, React.createElement("div", {
      className: "padded debugger-bp-dialog"
    }, React.createElement("h1", {
      className: "debugger-bp-config-header"
    }, "Edit breakpoint"), React.createElement("div", {
      className: "block"
    }, React.createElement("label", null, "Breakpoint at ", _nuclideUri().default.basename(this.props.breakpoint.uri), ":", this.props.breakpoint.endLine != null ? this.props.breakpoint.endLine : this.props.breakpoint.line)), React.createElement("div", {
      className: "block"
    }, React.createElement(_Checkbox().Checkbox, {
      onChange: isChecked => {
        (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE_ENABLED, {
          enabled: isChecked
        });
        this.props.service.enableOrDisableBreakpoints(isChecked, this.props.breakpoint);
      },
      checked: this.props.breakpoint.enabled,
      label: "Enable breakpoint"
    })), React.createElement("div", {
      className: "block"
    }, React.createElement(_AtomInput().AtomInput, {
      placeholderText: "Breakpoint hit condition...",
      value: this.props.breakpoint.condition || '',
      size: "sm",
      ref: input => {
        this._condition = input;
      },
      autofocus: true
    })), React.createElement("label", null, "This expression will be evaluated each time the corresponding line is hit, but the debugger will only break execution if the expression evaluates to true."), React.createElement("div", {
      className: "debugger-bp-config-actions"
    }, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      onClick: this.props.onDismiss
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      onClick: this._updateBreakpoint.bind(this)
    }, "Update")))));
  }

}

exports.default = BreakpointConfigComponent;