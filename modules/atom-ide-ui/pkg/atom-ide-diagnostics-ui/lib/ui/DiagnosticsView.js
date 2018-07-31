"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _analytics() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/analytics"));

  _analytics = function () {
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

function _DiagnosticsTable() {
  const data = _interopRequireDefault(require("./DiagnosticsTable"));

  _DiagnosticsTable = function () {
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

function _showModal() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/showModal"));

  _showModal = function () {
    return data;
  };

  return data;
}

function _Toggle() {
  const data = require("../../../../../nuclide-commons-ui/Toggle");

  _Toggle = function () {
    return data;
  };

  return data;
}

function _Toolbar() {
  const data = require("../../../../../nuclide-commons-ui/Toolbar");

  _Toolbar = function () {
    return data;
  };

  return data;
}

function _ToolbarLeft() {
  const data = require("../../../../../nuclide-commons-ui/ToolbarLeft");

  _ToolbarLeft = function () {
    return data;
  };

  return data;
}

function _ToolbarRight() {
  const data = require("../../../../../nuclide-commons-ui/ToolbarRight");

  _ToolbarRight = function () {
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

function _FilterButton() {
  const data = _interopRequireDefault(require("./FilterButton"));

  _FilterButton = function () {
    return data;
  };

  return data;
}

function _RegExpFilter() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/RegExpFilter"));

  _RegExpFilter = function () {
    return data;
  };

  return data;
}

function _SettingsModal() {
  const data = _interopRequireDefault(require("./SettingsModal"));

  _SettingsModal = function () {
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

/**
 * Dismissable panel that displays the diagnostics from nuclide-diagnostics-store.
 */
class DiagnosticsView extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._showSettings = () => {
      (0, _showModal().default)(() => React.createElement(_SettingsModal().default, {
        config: this.props.uiConfig
      }));
    }, this._handleShowTracesChange = isChecked => {
      _analytics().default.track('diagnostics-panel-toggle-show-traces', {
        isChecked: isChecked.toString()
      });

      this.props.onShowTracesChange.call(null, isChecked);
    }, this._handleFilterByActiveTextEditorChange = shouldFilter => {
      _analytics().default.track('diagnostics-panel-toggle-current-file', {
        isChecked: shouldFilter.toString()
      });

      this.props.onFilterByActiveTextEditorChange.call(null, shouldFilter);
    }, this._openAllFilesWithErrors = () => {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'diagnostics:open-all-files-with-errors');
    }, this._handleFocus = event => {
      if (this._table == null) {
        return;
      }

      let el = event.target;

      while (el != null) {
        if (el.tagName === 'INPUT' || el.tagName === 'BUTTON') {
          return;
        }

        el = el.parentElement;
      }

      this._table.focus();
    }, _temp;
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.isVisible;
  }

  componentDidMount() {
    this._disposables = new (_UniversalDisposable().default)(atom.commands.add((0, _nullthrows().default)(this._diagnosticsTableWrapperEl), 'atom-ide:filter', () => this._focusFilter()));
  }

  componentWillUnmount() {
    (0, _nullthrows().default)(this._disposables).dispose();
  }

  render() {
    const {
      diagnostics,
      showDirectoryColumn,
      showTraces
    } = this.props;
    const groups = ['errors', 'warnings', 'info'];

    if (this.props.supportedMessageKinds.has('review')) {
      groups.push('review');
    }

    if (this.props.supportedMessageKinds.has('action')) {
      groups.push('action');
    }

    const showFullDescriptionToggle = diagnostics.find(diagnostic => // flowlint-next-line sketchy-null-string:off
    diagnostic.trace || diagnostic.text && diagnostic.text.includes('\n'));
    return React.createElement("div", {
      onFocus: this._handleFocus,
      tabIndex: -1,
      style: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        width: '100%'
      }
    }, React.createElement(_Toolbar().Toolbar, {
      location: "top"
    }, React.createElement(_ToolbarLeft().ToolbarLeft, null, React.createElement(_ButtonGroup().ButtonGroup, {
      className: "inline-block"
    }, groups.map(group => React.createElement(_FilterButton().default, {
      key: group,
      group: group,
      selected: !this.props.hiddenGroups.has(group),
      onClick: () => {
        this.props.onTypeFilterChange(group);
      }
    }))), React.createElement(_RegExpFilter().default, {
      ref: component => this._filterComponent = component,
      value: this.props.textFilter,
      onChange: this.props.onTextFilterChange
    }), React.createElement(_Toggle().Toggle, {
      className: "inline-block",
      onChange: this._handleFilterByActiveTextEditorChange,
      toggled: this.props.filterByActiveTextEditor,
      label: "Current File Only"
    })), React.createElement(_ToolbarRight().ToolbarRight, null, showFullDescriptionToggle ? React.createElement(_Toggle().Toggle, {
      className: "inline-block",
      onChange: this._handleShowTracesChange,
      toggled: this.props.showTraces,
      label: "Full Description"
    }) : null, React.createElement(_Button().Button, {
      onClick: this._openAllFilesWithErrors,
      size: _Button().ButtonSizes.SMALL,
      disabled: diagnostics.length === 0,
      className: "inline-block",
      title: "Open All"
    }, "Open All"), React.createElement(_Button().Button, {
      icon: "gear",
      size: _Button().ButtonSizes.SMALL,
      onClick: this._showSettings
    }))), React.createElement("div", {
      className: "atom-ide-filterable",
      ref: el => this._diagnosticsTableWrapperEl = el,
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, React.createElement(_DiagnosticsTable().default, {
      ref: table => {
        this._table = table;
      },
      showFileName: !this.props.filterByActiveTextEditor,
      diagnostics: diagnostics,
      showDirectoryColumn: showDirectoryColumn,
      showTraces: showTraces,
      selectedMessage: this.props.selectedMessage,
      selectMessage: this.props.selectMessage,
      gotoMessageLocation: this.props.gotoMessageLocation
    })));
  }

  _focusFilter() {
    if (this._filterComponent != null) {
      this._filterComponent.focus();
    }
  }

}

exports.default = DiagnosticsView;