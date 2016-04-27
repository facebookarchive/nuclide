var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideAnalytics = require('../../nuclide-analytics');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DiagnosticsPane = require('./DiagnosticsPane');

var _require = require('../../nuclide-ui/lib/Checkbox');

var Checkbox = _require.Checkbox;

var _require2 = require('../../nuclide-ui/lib/PanelComponent');

var PanelComponent = _require2.PanelComponent;

var _require3 = require('../../nuclide-ui/lib/Toolbar');

var Toolbar = _require3.Toolbar;

var _require4 = require('../../nuclide-ui/lib/ToolbarCenter');

var ToolbarCenter = _require4.ToolbarCenter;

var _require5 = require('../../nuclide-ui/lib/ToolbarLeft');

var ToolbarLeft = _require5.ToolbarLeft;

var _require6 = require('../../nuclide-ui/lib/ToolbarRight');

var ToolbarRight = _require6.ToolbarRight;

var _require7 = require('react-for-atom');

var React = _require7.React;
var PropTypes = React.PropTypes;

var keyboardShortcut = null;
function getKeyboardShortcut() {
  if (keyboardShortcut != null) {
    return keyboardShortcut;
  }

  var matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: 'nuclide-diagnostics-ui:toggle-table'
  });
  if (matchingKeyBindings.length && matchingKeyBindings[0].keystrokes) {
    var _require8 = require('../../nuclide-keystroke-label');

    var humanizeKeystroke = _require8.humanizeKeystroke;

    keyboardShortcut = humanizeKeystroke(matchingKeyBindings[0].keystrokes);
  } else {
    keyboardShortcut = '';
  }
  return keyboardShortcut;
}

/**
 * Dismissable panel that displays the diagnostics from nuclide-diagnostics-store.
 */

var DiagnosticsPanel = (function (_React$Component) {
  _inherits(DiagnosticsPanel, _React$Component);

  _createClass(DiagnosticsPanel, null, [{
    key: 'propTypes',
    value: {
      diagnostics: PropTypes.array.isRequired,
      height: PropTypes.number.isRequired,
      onDismiss: PropTypes.func.isRequired,
      onResize: PropTypes.func.isRequired,
      width: PropTypes.number.isRequired,
      pathToActiveTextEditor: PropTypes.string,
      filterByActiveTextEditor: PropTypes.bool.isRequired,
      onFilterByActiveTextEditorChange: PropTypes.func.isRequired,
      warnAboutLinter: PropTypes.bool.isRequired,
      disableLinter: PropTypes.func.isRequired
    },
    enumerable: true
  }]);

  function DiagnosticsPanel(props) {
    _classCallCheck(this, DiagnosticsPanel);

    _get(Object.getPrototypeOf(DiagnosticsPanel.prototype), 'constructor', this).call(this, props);
    this._onFilterByActiveTextEditorChange = this._onFilterByActiveTextEditorChange.bind(this);
  }

  _createClass(DiagnosticsPanel, [{
    key: 'getHeight',
    value: function getHeight() {
      return this.refs['panel'].getLength();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var warningCount = 0;
      var errorCount = 0;
      var diagnostics = this.props.diagnostics;

      if (this.props.filterByActiveTextEditor && this.props.pathToActiveTextEditor) {
        (function () {
          var pathToFilterBy = _this.props.pathToActiveTextEditor;
          diagnostics = diagnostics.filter(function (diagnostic) {
            return diagnostic.filePath === pathToFilterBy;
          });
        })();
      }
      diagnostics.forEach(function (diagnostic) {
        if (diagnostic.type === 'Error') {
          ++errorCount;
        } else if (diagnostic.type === 'Warning') {
          ++warningCount;
        }
      });

      var shortcut = getKeyboardShortcut();
      var shortcutSpan = null;
      if (shortcut !== '') {
        shortcutSpan = React.createElement(
          'span',
          { className: 'text-subtle inline-block' },
          'Use ',
          React.createElement(
            'kbd',
            { className: 'key-binding key-binding-sm text-highlight' },
            shortcut
          ),
          ' to toggle this panel.'
        );
      }

      var linterWarning = null;
      if (this.props.warnAboutLinter) {
        linterWarning = React.createElement(
          Toolbar,
          null,
          React.createElement(
            ToolbarCenter,
            null,
            React.createElement(
              'span',
              { className: 'inline-block highlight-info' },
              'nuclide-diagnostics is not compatible with the linter package. We recommend that you ',
              React.createElement(
                'a',
                { onClick: this.props.disableLinter },
                'disable the linter package'
              ),
              '. ',
              React.createElement(
                'a',
                { href: 'http://nuclide.io/docs/advanced-topics/linter-package-compatibility/' },
                'Learn More'
              ),
              '.'
            )
          )
        );
      }

      var errorSpanClassName = 'inline-block ' + (errorCount > 0 ? 'text-error' : '');
      var warningSpanClassName = 'inline-block ' + (warningCount > 0 ? 'text-warning' : '');

      // We hide the horizontal overflow in the PanelComponent because the presence of the scrollbar
      // throws off our height calculations.
      return React.createElement(
        PanelComponent,
        {
          ref: 'panel',
          dock: 'bottom',
          initialLength: this.props.height,
          noScroll: true,
          onResize: this.props.onResize,
          overflowX: 'hidden' },
        React.createElement(
          'div',
          { style: { display: 'flex', flex: 1, flexDirection: 'column' } },
          linterWarning,
          React.createElement(
            Toolbar,
            { location: 'top' },
            React.createElement(
              ToolbarLeft,
              null,
              React.createElement(
                'span',
                { className: errorSpanClassName },
                'Errors: ',
                errorCount
              ),
              React.createElement(
                'span',
                { className: warningSpanClassName },
                'Warnings: ',
                warningCount
              ),
              React.createElement(
                'span',
                { className: 'inline-block' },
                React.createElement(Checkbox, {
                  checked: this.props.filterByActiveTextEditor,
                  label: 'Show only diagnostics for current file',
                  onChange: this._onFilterByActiveTextEditorChange
                })
              )
            ),
            React.createElement(
              ToolbarRight,
              null,
              shortcutSpan,
              React.createElement(_nuclideUiLibButton.Button, {
                onClick: this.props.onDismiss,
                icon: 'x',
                size: _nuclideUiLibButton.ButtonSizes.SMALL,
                className: 'inline-block',
                title: 'Close Panel'
              })
            )
          ),
          React.createElement(DiagnosticsPane, {
            showFileName: !this.props.filterByActiveTextEditor,
            diagnostics: diagnostics,
            width: this.props.width
          })
        )
      );
    }
  }, {
    key: '_onFilterByActiveTextEditorChange',
    value: function _onFilterByActiveTextEditorChange(isChecked) {
      (0, _nuclideAnalytics.track)('diagnostics-panel-toggle-current-file', { isChecked: isChecked.toString() });
      this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
    }
  }]);

  return DiagnosticsPanel;
})(React.Component);

module.exports = DiagnosticsPanel;