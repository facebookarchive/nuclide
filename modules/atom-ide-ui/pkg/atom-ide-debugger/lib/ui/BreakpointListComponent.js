"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _analytics() {
  const data = require("../../../../../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _ListView() {
  const data = require("../../../../../nuclide-commons-ui/ListView");

  _ListView = function () {
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

function _Icon() {
  const data = require("../../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
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

function _utils() {
  const data = require("../utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _Section() {
  const data = require("../../../../../nuclide-commons-ui/Section");

  _Section = function () {
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

function _projects() {
  const data = require("../../../../../nuclide-commons-atom/projects");

  _projects = function () {
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
 *  strict-local
 * @format
 */
class BreakpointListComponent extends React.Component {
  constructor(props) {
    super(props);

    this._handleBreakpointEnabledChange = (breakpoint, enabled) => {
      this.props.service.enableOrDisableBreakpoints(enabled, breakpoint);
    };

    this._handleBreakpointClick = (breakpointIndex, breakpoint) => {
      if (!(breakpoint != null)) {
        throw new Error("Invariant violation: \"breakpoint != null\"");
      }

      const {
        uri,
        line
      } = breakpoint; // Debugger model is 1-based while Atom UI is zero-based.

      (0, _utils().openSourceLocation)(uri, line - 1);
    };

    this._setExceptionCollapsed = collapsed => {
      _featureConfig().default.set('debugger-exceptionBreakpointsCollapsed', collapsed);

      this.setState({
        exceptionBreakpointsCollapsed: collapsed
      });
    };

    this._setUnavailableCollapsed = collapsed => {
      this.setState({
        unavailableBreakpointsCollapsed: collapsed
      });
    };

    this.state = this._computeState();
    this._disposables = new (_UniversalDisposable().default)();
  }

  _computeState() {
    const {
      service
    } = this.props;
    const {
      focusedProcess
    } = service.viewModel;
    const model = service.getModel();
    const exceptionBreakpointsCollapsed = Boolean(_featureConfig().default.get('debugger-exceptionBreakpointsCollapsed'));
    let newActiveProjects = [];

    if (this.state != null) {
      const {
        activeProjects
      } = this.state;

      if (activeProjects != null) {
        newActiveProjects = activeProjects;
      }
    }

    return {
      supportsConditionalBreakpoints: focusedProcess != null && Boolean(focusedProcess.session.capabilities.supportsConditionalBreakpoints),
      breakpoints: model.getBreakpoints(),
      exceptionBreakpoints: model.getExceptionBreakpoints(),
      exceptionBreakpointsCollapsed,
      unavailableBreakpointsCollapsed: true,
      activeProjects: newActiveProjects
    };
  }

  componentDidMount() {
    const model = this.props.service.getModel();

    this._disposables.add(model.onDidChangeBreakpoints(() => {
      this.setState(this._computeState());
    }), (0, _projects().observeProjectPathsAll)(projectPaths => this.setState({
      activeProjects: projectPaths
    })));
  }

  componentWillUnmount() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
  }

  _getHostnameTranslated(uri) {
    try {
      // $FlowFB
      const {
        getBreakpointHostnameTranslated
      } = require("./fb-utils");

      return getBreakpointHostnameTranslated(uri);
    } catch (_) {}

    if (_nuclideUri().default.isLocal(uri)) {
      return 'local';
    } else {
      return _nuclideUri().default.getHostname(uri);
    }
  }

  render() {
    const {
      exceptionBreakpoints,
      supportsConditionalBreakpoints,
      activeProjects,
      breakpoints
    } = this.state;
    const {
      service
    } = this.props;
    const availableHosts = activeProjects.filter(uri => _nuclideUri().default.isRemote(uri)).map(uri => this._getHostnameTranslated(uri));

    const breakpointGroup = available => breakpoints.filter(bp => {
      const match = _nuclideUri().default.isLocal(bp.uri) || availableHosts.some(host => this._getHostnameTranslated(bp.uri) === host);
      return available ? match : !match;
    }).sort((breakpointA, breakpointB) => {
      const fileA = _nuclideUri().default.basename(breakpointA.uri);

      const fileB = _nuclideUri().default.basename(breakpointB.uri);

      if (fileA !== fileB) {
        return fileA.localeCompare(fileB);
      }

      const lineA = breakpointA.endLine != null ? breakpointA.endLine : breakpointA.line;
      const lineB = breakpointB.endLine != null ? breakpointB.endLine : breakpointB.line;
      return lineA - lineB;
    }).map((breakpoint, i) => {
      const host = this._getHostnameTranslated(breakpoint.uri) || 'local';

      const basename = _nuclideUri().default.basename(breakpoint.uri);

      const {
        line,
        endLine,
        verified,
        uri: path
      } = breakpoint;
      const enabled = breakpoint.enabled && available;
      const dataLine = endLine != null && !Number.isNaN(endLine) ? endLine : line;
      const bpId = breakpoint.getId();
      const label = `${basename}:${dataLine}`;
      const title = (!enabled ? 'Disabled breakpoint' : !verified ? 'Unresolved Breakpoint' : `Breakpoint at ${label} (resolved)`) + (available ? '' : ` - ${host}:${_nuclideUri().default.getPath(breakpoint.uri)}`);
      const conditionElement = supportsConditionalBreakpoints && breakpoint.condition != null ? React.createElement("div", {
        className: "debugger-breakpoint-condition",
        title: `Breakpoint condition: ${breakpoint.condition}`,
        "data-path": path,
        "data-line": line,
        "data-bpid": bpId,
        onClick: event => {
          atom.commands.dispatch(event.target, 'debugger:edit-breakpoint');
        }
      }, "Condition: ", breakpoint.condition) : null;
      const content = React.createElement("div", {
        className: "inline-block"
      }, React.createElement("div", {
        className: (0, _classnames().default)({
          'debugger-breakpoint-disabled': !enabled,
          'debugger-breakpoint-with-condition': Boolean(breakpoint.condition)
        }),
        key: i
      }, React.createElement(_Checkbox().Checkbox, {
        checked: enabled,
        onChange: this._handleBreakpointEnabledChange.bind(this, breakpoint),
        onClick: event => event.stopPropagation(),
        title: title,
        disabled: !available,
        className: (0, _classnames().default)(verified ? '' : 'debugger-breakpoint-unresolved', 'debugger-breakpoint-checkbox')
      }), React.createElement("span", {
        title: title,
        "data-path": path,
        "data-bpid": bpId,
        "data-line": line
      }, React.createElement("div", {
        className: "debugger-breakpoint-condition-controls"
      }, React.createElement(_Icon().Icon, {
        icon: "pencil",
        className: "debugger-breakpoint-condition-control",
        "data-path": path,
        "data-bpid": bpId,
        "data-line": line,
        onClick: event => {
          (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_EDIT_BREAKPOINT_FROM_ICON);
          atom.commands.dispatch(event.target, 'debugger:edit-breakpoint');
        }
      }), React.createElement(_Icon().Icon, {
        icon: "x",
        className: "debugger-breakpoint-condition-control",
        "data-path": path,
        "data-bpid": bpId,
        "data-line": line,
        onClick: event => {
          (0, _analytics().track)(_constants().AnalyticsEvents.DEBUGGER_DELETE_BREAKPOINT_FROM_ICON);
          atom.commands.dispatch(event.target, 'debugger:remove-breakpoint');
          event.stopPropagation();
        }
      })), label), conditionElement));
      return React.createElement(_ListView().ListViewItem, {
        key: label,
        index: i,
        value: breakpoint,
        "data-path": path,
        "data-bpid": bpId,
        "data-line": line,
        title: title,
        className: "debugger-breakpoint"
      }, content);
    });

    const availableBreakpoints = breakpointGroup(true);
    const unavailableBreakpoints = breakpointGroup(false);
    return React.createElement("div", null, React.createElement(_ListView().ListView, {
      alternateBackground: true,
      onSelect: this._handleBreakpointClick,
      selectable: true
    }, availableBreakpoints), exceptionBreakpoints.length > 0 ? React.createElement(_Section().Section, {
      className: "debugger-breakpoint-section",
      headline: "Exception breakpoints",
      collapsable: true,
      onChange: this._setExceptionCollapsed,
      collapsed: this.state.exceptionBreakpointsCollapsed
    }, exceptionBreakpoints.map(exceptionBreakpoint => {
      return React.createElement("div", {
        className: "debugger-breakpoint",
        key: exceptionBreakpoint.getId()
      }, React.createElement(_Checkbox().Checkbox, {
        className: (0, _classnames().default)('debugger-breakpoint-checkbox', 'debugger-exception-checkbox'),
        onChange: enabled => service.enableOrDisableBreakpoints(enabled, exceptionBreakpoint),
        checked: exceptionBreakpoint.enabled
      }), exceptionBreakpoint.label || `${exceptionBreakpoint.filter} exceptions`);
    })) : null, unavailableBreakpoints.length > 0 ? React.createElement(_Section().Section, {
      className: "debugger-breakpoint-section",
      headline: React.createElement("div", {
        className: "inline-block"
      }, React.createElement(_Icon().Icon, {
        icon: "nuclicon-warning"
      }), " Unavailable breakpoints"),
      collapsable: true,
      onChange: this._setUnavailableCollapsed,
      collapsed: this.state.unavailableBreakpointsCollapsed
    }, React.createElement("div", {
      className: "debugger-unavailable-breakpoint-help"
    }, "These breakpoints are in files that are not currently available in any project root. Add the corresponding local or remote project to your file tree to enable these breakpoints."), React.createElement(_ListView().ListView, {
      alternateBackground: true,
      selectable: false
    }, unavailableBreakpoints)) : null);
  }

}

exports.default = BreakpointListComponent;