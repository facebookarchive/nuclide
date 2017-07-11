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

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('nuclide-commons-ui/Toolbar');
}

var _ToolbarCenter;

function _load_ToolbarCenter() {
  return _ToolbarCenter = require('nuclide-commons-ui/ToolbarCenter');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('nuclide-commons-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('nuclide-commons-ui/ToolbarRight');
}

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Dismissable panel that displays the diagnostics from nuclide-diagnostics-store.
 */
class DiagnosticsView extends _react.default.Component {

  constructor(props) {
    super(props);
    this._onShowTracesChange = this._onShowTracesChange.bind(this);
    this._onFilterByActiveTextEditorChange = this._onFilterByActiveTextEditorChange.bind(this);
    this._openAllFilesWithErrors = this._openAllFilesWithErrors.bind(this);
  }

  render() {
    let warningCount = 0;
    let errorCount = 0;
    let { diagnostics } = this.props;
    const { showTraces } = this.props;
    if (this.props.filterByActiveTextEditor) {
      const pathToFilterBy = this.props.pathToActiveTextEditor;
      if (pathToFilterBy !== null) {
        diagnostics = diagnostics.filter(diagnostic => diagnostic.scope === 'file' && diagnostic.filePath === pathToFilterBy);
      } else {
        // Current pane is not a text editor; do not show diagnostics.
        diagnostics = [];
      }
    }
    diagnostics.forEach(diagnostic => {
      if (diagnostic.type === 'Error') {
        ++errorCount;
      } else if (diagnostic.type === 'Warning' || diagnostic.type === 'Info') {
        // TODO: should "Info" messages have their own category?
        ++warningCount;
      }
    });
    const isExpandable = diagnostics.find(diagnostic => diagnostic.trace || diagnostic.text && diagnostic.text.includes('\n'));

    let linterWarning = null;
    if (this.props.warnAboutLinter) {
      linterWarning = _react.default.createElement(
        (_Toolbar || _load_Toolbar()).Toolbar,
        null,
        _react.default.createElement(
          (_ToolbarCenter || _load_ToolbarCenter()).ToolbarCenter,
          null,
          _react.default.createElement(
            'span',
            { className: 'inline-block highlight-info' },
            'nuclide-diagnostics is not compatible with the linter package. We recommend that you\xA0',
            _react.default.createElement(
              'a',
              { onClick: this.props.disableLinter },
              'disable the linter package'
            ),
            '.\xA0',
            _react.default.createElement(
              'a',
              { href: 'http://nuclide.io/docs/advanced-topics/linter-package-compatibility/' },
              'Learn More'
            ),
            '.'
          )
        )
      );
    }

    const errorSpanClassName = `inline-block ${errorCount > 0 ? 'text-error' : ''}`;
    const warningSpanClassName = `inline-block ${warningCount > 0 ? 'text-warning' : ''}`;

    return _react.default.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          width: '100%'
        } },
      linterWarning,
      _react.default.createElement(
        (_Toolbar || _load_Toolbar()).Toolbar,
        { location: 'top' },
        _react.default.createElement(
          (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
          null,
          _react.default.createElement(
            'span',
            { className: errorSpanClassName },
            'Errors: ',
            errorCount
          ),
          _react.default.createElement(
            'span',
            { className: warningSpanClassName },
            'Warnings: ',
            warningCount
          )
        ),
        _react.default.createElement(
          (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
          null,
          isExpandable ? _react.default.createElement(
            'span',
            { className: 'inline-block' },
            _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
              checked: this.props.showTraces,
              label: 'Full description',
              onChange: this._onShowTracesChange
            })
          ) : null,
          _react.default.createElement(
            'span',
            { className: 'inline-block' },
            _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
              checked: this.props.filterByActiveTextEditor,
              label: 'Current file only',
              onChange: this._onFilterByActiveTextEditorChange
            })
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              onClick: this._openAllFilesWithErrors,
              size: (_Button || _load_Button()).ButtonSizes.SMALL,
              disabled: diagnostics.length === 0,
              className: 'inline-block',
              title: 'Open All' },
            'Open All'
          )
        )
      ),
      _react.default.createElement((_DiagnosticsTable || _load_DiagnosticsTable()).default, {
        showFileName: !this.props.filterByActiveTextEditor,
        diagnostics: diagnostics,
        showTraces: showTraces
      })
    );
  }

  _onShowTracesChange(isChecked) {
    (_analytics || _load_analytics()).default.track('diagnostics-panel-toggle-show-traces', {
      isChecked: isChecked.toString()
    });
    this.props.onShowTracesChange.call(null, isChecked);
  }

  _onFilterByActiveTextEditorChange(isChecked) {
    (_analytics || _load_analytics()).default.track('diagnostics-panel-toggle-current-file', {
      isChecked: isChecked.toString()
    });
    this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
  }

  _openAllFilesWithErrors() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'diagnostics:open-all-files-with-errors');
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