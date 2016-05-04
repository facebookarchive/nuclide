var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _DiagnosticsPane = require('./DiagnosticsPane');

var _DiagnosticsPane2 = _interopRequireDefault(_DiagnosticsPane);

var _nuclideUiLibCheckbox = require('../../nuclide-ui/lib/Checkbox');

var _nuclideUiLibPanelComponent = require('../../nuclide-ui/lib/PanelComponent');

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarCenter = require('../../nuclide-ui/lib/ToolbarCenter');

var _nuclideUiLibToolbarLeft = require('../../nuclide-ui/lib/ToolbarLeft');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideAnalytics = require('../../nuclide-analytics');

var keyboardShortcut = null;
function getKeyboardShortcut() {
  if (keyboardShortcut != null) {
    return keyboardShortcut;
  }

  var matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: 'nuclide-diagnostics-ui:toggle-table'
  });
  if (matchingKeyBindings.length && matchingKeyBindings[0].keystrokes) {
    var _require = require('../../nuclide-keystroke-label');

    var humanizeKeystroke = _require.humanizeKeystroke;

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
      diagnostics: _reactForAtom.React.PropTypes.array.isRequired,
      height: _reactForAtom.React.PropTypes.number.isRequired,
      onDismiss: _reactForAtom.React.PropTypes.func.isRequired,
      onResize: _reactForAtom.React.PropTypes.func.isRequired,
      width: _reactForAtom.React.PropTypes.number.isRequired,
      pathToActiveTextEditor: _reactForAtom.React.PropTypes.string,
      filterByActiveTextEditor: _reactForAtom.React.PropTypes.bool.isRequired,
      onFilterByActiveTextEditorChange: _reactForAtom.React.PropTypes.func.isRequired,
      warnAboutLinter: _reactForAtom.React.PropTypes.bool.isRequired,
      disableLinter: _reactForAtom.React.PropTypes.func.isRequired
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
        shortcutSpan = _reactForAtom.React.createElement(
          'span',
          { className: 'text-subtle inline-block' },
          'Use ',
          _reactForAtom.React.createElement(
            'kbd',
            { className: 'key-binding key-binding-sm text-highlight' },
            shortcut
          ),
          ' to toggle this panel.'
        );
      }

      var linterWarning = null;
      if (this.props.warnAboutLinter) {
        linterWarning = _reactForAtom.React.createElement(
          _nuclideUiLibToolbar.Toolbar,
          null,
          _reactForAtom.React.createElement(
            _nuclideUiLibToolbarCenter.ToolbarCenter,
            null,
            _reactForAtom.React.createElement(
              'span',
              { className: 'inline-block highlight-info' },
              'nuclide-diagnostics is not compatible with the linter package. We recommend that you ',
              _reactForAtom.React.createElement(
                'a',
                { onClick: this.props.disableLinter },
                'disable the linter package'
              ),
              '. ',
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

      var errorSpanClassName = 'inline-block ' + (errorCount > 0 ? 'text-error' : '');
      var warningSpanClassName = 'inline-block ' + (warningCount > 0 ? 'text-warning' : '');

      // We hide the horizontal overflow in the PanelComponent because the presence of the scrollbar
      // throws off our height calculations.
      return _reactForAtom.React.createElement(
        _nuclideUiLibPanelComponent.PanelComponent,
        {
          ref: 'panel',
          dock: 'bottom',
          initialLength: this.props.height,
          noScroll: true,
          onResize: this.props.onResize,
          overflowX: 'hidden' },
        _reactForAtom.React.createElement(
          'div',
          { style: { display: 'flex', flex: 1, flexDirection: 'column' } },
          linterWarning,
          _reactForAtom.React.createElement(
            _nuclideUiLibToolbar.Toolbar,
            { location: 'top' },
            _reactForAtom.React.createElement(
              _nuclideUiLibToolbarLeft.ToolbarLeft,
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
              ),
              _reactForAtom.React.createElement(
                'span',
                { className: 'inline-block' },
                _reactForAtom.React.createElement(_nuclideUiLibCheckbox.Checkbox, {
                  checked: this.props.filterByActiveTextEditor,
                  label: 'Show only diagnostics for current file',
                  onChange: this._onFilterByActiveTextEditorChange
                })
              )
            ),
            _reactForAtom.React.createElement(
              _nuclideUiLibToolbarRight.ToolbarRight,
              null,
              shortcutSpan,
              _reactForAtom.React.createElement(_nuclideUiLibButton.Button, {
                onClick: this.props.onDismiss,
                icon: 'x',
                size: _nuclideUiLibButton.ButtonSizes.SMALL,
                className: 'inline-block',
                title: 'Close Panel'
              })
            )
          ),
          _reactForAtom.React.createElement(_DiagnosticsPane2.default, {
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
})(_reactForAtom.React.Component);

module.exports = DiagnosticsPanel;