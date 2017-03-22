'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DiagnosticsPane;

function _load_DiagnosticsPane() {
  return _DiagnosticsPane = _interopRequireDefault(require('./DiagnosticsPane'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('../../nuclide-ui/Toolbar');
}

var _ToolbarCenter;

function _load_ToolbarCenter() {
  return _ToolbarCenter = require('../../nuclide-ui/ToolbarCenter');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('../../nuclide-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('../../nuclide-ui/ToolbarRight');
}

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Dismissable panel that displays the diagnostics from nuclide-diagnostics-store.
 */
class DiagnosticsPanel extends _react.default.Component {

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
      } else if (diagnostic.type === 'Warning') {
        ++warningCount;
      }
    });

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
      { style: { display: 'flex', flex: 1, flexDirection: 'column' } },
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
          _react.default.createElement(
            'span',
            { className: 'inline-block' },
            _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
              checked: this.props.showTraces,
              label: 'Show full diagnostic traces',
              onChange: this._onShowTracesChange
            })
          ),
          _react.default.createElement(
            'span',
            { className: 'inline-block' },
            _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
              checked: this.props.filterByActiveTextEditor,
              label: 'Show only diagnostics for current file',
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
      _react.default.createElement((_DiagnosticsPane || _load_DiagnosticsPane()).default, {
        showFileName: !this.props.filterByActiveTextEditor,
        diagnostics: diagnostics,
        showTraces: showTraces
      })
    );
  }

  _onShowTracesChange(isChecked) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-panel-toggle-show-traces', { isChecked: isChecked.toString() });
    this.props.onShowTracesChange.call(null, isChecked);
  }

  _onFilterByActiveTextEditorChange(isChecked) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-panel-toggle-current-file', { isChecked: isChecked.toString() });
    this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
  }

  _openAllFilesWithErrors() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:open-all-files-with-errors');
  }
}
exports.default = DiagnosticsPanel; /**
                                     * Copyright (c) 2015-present, Facebook, Inc.
                                     * All rights reserved.
                                     *
                                     * This source code is licensed under the license found in the LICENSE file in
                                     * the root directory of this source tree.
                                     *
                                     * 
                                     */