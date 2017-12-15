'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _DiagnosticsTable;

function _load_DiagnosticsTable() {
  return _DiagnosticsTable = _interopRequireDefault(require('./DiagnosticsTable'));
}

var _showModal;

function _load_showModal() {
  return _showModal = _interopRequireDefault(require('nuclide-commons-ui/showModal'));
}

var _Toggle;

function _load_Toggle() {
  return _Toggle = require('nuclide-commons-ui/Toggle');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('nuclide-commons-ui/Toolbar');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('nuclide-commons-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('nuclide-commons-ui/ToolbarRight');
}

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _FilterButton;

function _load_FilterButton() {
  return _FilterButton = _interopRequireDefault(require('./FilterButton'));
}

var _RegExpFilter;

function _load_RegExpFilter() {
  return _RegExpFilter = _interopRequireDefault(require('nuclide-commons-ui/RegExpFilter'));
}

var _SettingsModal;

function _load_SettingsModal() {
  return _SettingsModal = _interopRequireDefault(require('./SettingsModal'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Dismissable panel that displays the diagnostics from nuclide-diagnostics-store.
 */
class DiagnosticsView extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._showSettings = () => {
      (0, (_showModal || _load_showModal()).default)(() => _react.createElement((_SettingsModal || _load_SettingsModal()).default, { config: this.props.uiConfig }));
    }, this._handleShowTracesChange = isChecked => {
      (_analytics || _load_analytics()).default.track('diagnostics-panel-toggle-show-traces', {
        isChecked: isChecked.toString()
      });
      this.props.onShowTracesChange.call(null, isChecked);
    }, this._handleFilterByActiveTextEditorChange = shouldFilter => {
      (_analytics || _load_analytics()).default.track('diagnostics-panel-toggle-current-file', {
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

  render() {
    let { diagnostics } = this.props;
    const { showDirectoryColumn, showTraces } = this.props;
    if (this.props.filterByActiveTextEditor) {
      const pathToFilterBy = this.props.pathToActiveTextEditor;
      if (pathToFilterBy != null) {
        diagnostics = diagnostics.filter(diagnostic => diagnostic.filePath === pathToFilterBy);
      } else {
        // Current pane is not a text editor; do not show diagnostics.
        diagnostics = [];
      }
    }

    const groups = ['errors', 'warnings', 'info'];
    if (this.props.supportedMessageKinds.has('review')) {
      groups.push('review');
    }

    const showFullDescriptionToggle = diagnostics.find(diagnostic =>
    // flowlint-next-line sketchy-null-string:off
    diagnostic.trace || diagnostic.text && diagnostic.text.includes('\n'));

    return _react.createElement(
      'div',
      {
        onFocus: this._handleFocus,
        tabIndex: -1,
        style: {
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          width: '100%'
        } },
      _react.createElement(
        (_Toolbar || _load_Toolbar()).Toolbar,
        { location: 'top' },
        _react.createElement(
          (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
          null,
          _react.createElement(
            (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
            { className: 'inline-block' },
            groups.map(group => _react.createElement((_FilterButton || _load_FilterButton()).default, {
              key: group,
              group: group,
              selected: !this.props.hiddenGroups.has(group),
              onClick: () => {
                this.props.onTypeFilterChange(group);
              }
            }))
          ),
          _react.createElement((_RegExpFilter || _load_RegExpFilter()).default, {
            value: this.props.textFilter,
            onChange: this.props.onTextFilterChange
          }),
          _react.createElement((_Toggle || _load_Toggle()).Toggle, {
            className: 'inline-block',
            onChange: this._handleFilterByActiveTextEditorChange,
            toggled: this.props.filterByActiveTextEditor,
            label: 'Current File Only'
          })
        ),
        _react.createElement(
          (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
          null,
          showFullDescriptionToggle ? _react.createElement((_Toggle || _load_Toggle()).Toggle, {
            className: 'inline-block',
            onChange: this._handleShowTracesChange,
            toggled: this.props.showTraces,
            label: 'Full Description'
          }) : null,
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              onClick: this._openAllFilesWithErrors,
              size: (_Button || _load_Button()).ButtonSizes.SMALL,
              disabled: diagnostics.length === 0,
              className: 'inline-block',
              title: 'Open All' },
            'Open All'
          ),
          _react.createElement((_Button || _load_Button()).Button, {
            icon: 'gear',
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            onClick: this._showSettings
          })
        )
      ),
      _react.createElement((_DiagnosticsTable || _load_DiagnosticsTable()).default, {
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
      })
    );
  }

}
exports.default = DiagnosticsView; /**
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