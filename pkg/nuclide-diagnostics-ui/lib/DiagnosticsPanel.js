'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var _reactForAtom = require('react-for-atom');

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
let DiagnosticsPanel = class DiagnosticsPanel extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._onFilterByActiveTextEditorChange = this._onFilterByActiveTextEditorChange.bind(this);
    this._openAllFilesWithErrors = this._openAllFilesWithErrors.bind(this);
  }

  render() {
    let warningCount = 0;
    let errorCount = 0;
    let diagnostics = this.props.diagnostics;
    const showTraces = this.props.showTraces;

    if (this.props.filterByActiveTextEditor && this.props.pathToActiveTextEditor) {
      const pathToFilterBy = this.props.pathToActiveTextEditor;
      diagnostics = diagnostics.filter(diagnostic => diagnostic.scope === 'file' && diagnostic.filePath === pathToFilterBy);
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
      linterWarning = _reactForAtom.React.createElement(
        (_Toolbar || _load_Toolbar()).Toolbar,
        null,
        _reactForAtom.React.createElement(
          (_ToolbarCenter || _load_ToolbarCenter()).ToolbarCenter,
          null,
          _reactForAtom.React.createElement(
            'span',
            { className: 'inline-block highlight-info' },
            'nuclide-diagnostics is not compatible with the linter package. We recommend that you\xA0',
            _reactForAtom.React.createElement(
              'a',
              { onClick: this.props.disableLinter },
              'disable the linter package'
            ),
            '.\xA0',
            _reactForAtom.React.createElement(
              'a',
              { href: 'http://nuclide.io/docs/advanced-topics/linter-package-compatibility/' },
              'Learn More'
            ),
            '.'
          )
        )
      );
    }

    const errorSpanClassName = `inline-block ${ errorCount > 0 ? 'text-error' : '' }`;
    const warningSpanClassName = `inline-block ${ warningCount > 0 ? 'text-warning' : '' }`;

    return _reactForAtom.React.createElement(
      'div',
      { style: { display: 'flex', flex: 1, flexDirection: 'column' } },
      linterWarning,
      _reactForAtom.React.createElement(
        (_Toolbar || _load_Toolbar()).Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
          null,
          _reactForAtom.React.createElement(
            'span',
            { className: errorSpanClassName },
            'Errors: ',
            errorCount
          ),
          _reactForAtom.React.createElement(
            'span',
            { className: warningSpanClassName },
            'Warnings: ',
            warningCount
          )
        ),
        _reactForAtom.React.createElement(
          (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
          null,
          _reactForAtom.React.createElement(
            'span',
            { className: 'inline-block' },
            _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
              checked: this.props.filterByActiveTextEditor,
              label: 'Show only diagnostics for current file',
              onChange: this._onFilterByActiveTextEditorChange
            })
          ),
          _reactForAtom.React.createElement(
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
      _reactForAtom.React.createElement((_DiagnosticsPane || _load_DiagnosticsPane()).default, {
        showFileName: !this.props.filterByActiveTextEditor,
        diagnostics: diagnostics,
        showTraces: showTraces
      })
    );
  }

  _onFilterByActiveTextEditorChange(isChecked) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-panel-toggle-current-file', { isChecked: isChecked.toString() });
    this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
  }

  _openAllFilesWithErrors() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-diagnostics-ui:open-all-files-with-errors');
  }
};


module.exports = DiagnosticsPanel;