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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNzUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0NBdUJPLDZCQUE2Qjs7Z0NBRWhCLHlCQUF5Qjs7Ozs7Ozs7OztBQWQ3QyxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7ZUFDbEMsT0FBTyxDQUFDLCtCQUErQixDQUFDOztJQUFwRCxRQUFRLFlBQVIsUUFBUTs7Z0JBQ1UsT0FBTyxDQUFDLHFDQUFxQyxDQUFDOztJQUFoRSxjQUFjLGFBQWQsY0FBYzs7Z0JBQ0gsT0FBTyxDQUFDLDhCQUE4QixDQUFDOztJQUFsRCxPQUFPLGFBQVAsT0FBTzs7Z0JBQ1UsT0FBTyxDQUFDLG9DQUFvQyxDQUFDOztJQUE5RCxhQUFhLGFBQWIsYUFBYTs7Z0JBQ0UsT0FBTyxDQUFDLGtDQUFrQyxDQUFDOztJQUExRCxXQUFXLGFBQVgsV0FBVzs7Z0JBQ0ssT0FBTyxDQUFDLG1DQUFtQyxDQUFDOztJQUE1RCxZQUFZLGFBQVosWUFBWTs7Z0JBQ0gsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLGFBQUwsS0FBSztJQUNMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBUWhCLElBQUksZ0JBQXlCLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFNBQVMsbUJBQW1CLEdBQVc7QUFDckMsTUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEVBQUU7QUFDNUIsV0FBTyxnQkFBZ0IsQ0FBQztHQUN6Qjs7QUFFRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO0FBQ3ZELFdBQU8sRUFBRSxxQ0FBcUM7R0FDL0MsQ0FBQyxDQUFDO0FBQ0gsTUFBSSxtQkFBbUIsQ0FBQyxNQUFNLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFO29CQUN2QyxPQUFPLENBQUMsK0JBQStCLENBQUM7O1FBQTdELGlCQUFpQixhQUFqQixpQkFBaUI7O0FBQ3hCLG9CQUFn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Y0FDYjtBQUNFLHVCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEFBQUM7QUFDOUIsb0JBQUksRUFBQyxHQUFHO0FBQ1Isb0JBQUksRUFBRSxnQ0FBWSxLQUFLLEFBQUM7QUFDeEIseUJBQVMsRUFBQyxjQUFjO0FBQ3hCLHFCQUFLLEVBQUMsYUFBYTtnQkFDbkI7YUFDVztXQUNQO1VBQ1Ysb0JBQUMsZUFBZTtBQUNkLHdCQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixBQUFDO0FBQ25ELHVCQUFXLEVBQUUsV0FBVyxBQUFDO0FBQ3pCLGlCQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEFBQUM7WUFDeEI7U0FDRTtPQUNTLENBQ2pCO0tBQ0g7OztXQUVnQywyQ0FBQyxTQUFrQixFQUFFO0FBQ3BELG1DQUFNLHVDQUF1QyxFQUFFLEVBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUM7QUFDbEYsVUFBSSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ25FOzs7U0ExSEcsZ0JBQWdCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBNkg5QyxNQUFNLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDIiwiZmlsZSI6IkRpYWdub3N0aWNzUGFuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBEaWFnbm9zdGljc1BhbmUgPSByZXF1aXJlKCcuL0RpYWdub3N0aWNzUGFuZScpO1xuY29uc3Qge0NoZWNrYm94fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL0NoZWNrYm94Jyk7XG5jb25zdCB7UGFuZWxDb21wb25lbnR9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS11aS9saWIvUGFuZWxDb21wb25lbnQnKTtcbmNvbnN0IHtUb29sYmFyfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXInKTtcbmNvbnN0IHtUb29sYmFyQ2VudGVyfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL1Rvb2xiYXJDZW50ZXInKTtcbmNvbnN0IHtUb29sYmFyTGVmdH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyTGVmdCcpO1xuY29uc3Qge1Rvb2xiYXJSaWdodH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ub29sYmFyUmlnaHQnKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQnV0dG9uU2l6ZXMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxubGV0IGtleWJvYXJkU2hvcnRjdXQ6ID9zdHJpbmcgPSBudWxsO1xuZnVuY3Rpb24gZ2V0S2V5Ym9hcmRTaG9ydGN1dCgpOiBzdHJpbmcge1xuICBpZiAoa2V5Ym9hcmRTaG9ydGN1dCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGtleWJvYXJkU2hvcnRjdXQ7XG4gIH1cblxuICBjb25zdCBtYXRjaGluZ0tleUJpbmRpbmdzID0gYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyh7XG4gICAgY29tbWFuZDogJ251Y2xpZGUtZGlhZ25vc3RpY3MtdWk6dG9nZ2xlLXRhYmxlJyxcbiAgfSk7XG4gIGlmIChtYXRjaGluZ0tleUJpbmRpbmdzLmxlbmd0aCAmJiBtYXRjaGluZ0tleUJpbmRpbmdzWzBdLmtleXN0cm9rZXMpIHtcbiAgICBjb25zdCB7aHVtYW5pemVLZXlzdHJva2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1rZXlzdHJva2UtbGFiZWwnKTtcbiAgICBrZXlib2FyZFNob3J0Y3V0ID0gaHVtYW5pemVLZXlzdHJva2UobWF0Y2hpbmdLZXlCaW5kaW5nc1swXS5rZXlzdHJva2VzKTtcbiAgfSBlbHNlIHtcbiAgICBrZXlib2FyZFNob3J0Y3V0ID0gJyc7XG4gIH1cbiAgcmV0dXJuIGtleWJvYXJkU2hvcnRjdXQ7XG59XG5cbi8qKlxuICogRGlzbWlzc2FibGUgcGFuZWwgdGhhdCBkaXNwbGF5cyB0aGUgZGlhZ25vc3RpY3MgZnJvbSBudWNsaWRlLWRpYWdub3N0aWNzLXN0b3JlLlxuICovXG5jbGFzcyBEaWFnbm9zdGljc1BhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBkaWFnbm9zdGljczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgb25EaXNtaXNzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uUmVzaXplOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgcGF0aFRvQWN0aXZlVGV4dEVkaXRvcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBmaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3I6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgb25GaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3JDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgd2FybkFib3V0TGludGVyOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGRpc2FibGVMaW50ZXI6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZSA9XG4gICAgICB0aGlzLl9vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgZ2V0SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1sncGFuZWwnXS5nZXRMZW5ndGgoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBsZXQgd2FybmluZ0NvdW50ID0gMDtcbiAgICBsZXQgZXJyb3JDb3VudCA9IDA7XG4gICAgbGV0IHtkaWFnbm9zdGljc30gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0aGlzLnByb3BzLmZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvciAmJiB0aGlzLnByb3BzLnBhdGhUb0FjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIGNvbnN0IHBhdGhUb0ZpbHRlckJ5ID0gdGhpcy5wcm9wcy5wYXRoVG9BY3RpdmVUZXh0RWRpdG9yO1xuICAgICAgZGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5maWx0ZXIoZGlhZ25vc3RpYyA9PiBkaWFnbm9zdGljLmZpbGVQYXRoID09PSBwYXRoVG9GaWx0ZXJCeSk7XG4gICAgfVxuICAgIGRpYWdub3N0aWNzLmZvckVhY2goZGlhZ25vc3RpYyA9PiB7XG4gICAgICBpZiAoZGlhZ25vc3RpYy50eXBlID09PSAnRXJyb3InKSB7XG4gICAgICAgICsrZXJyb3JDb3VudDtcbiAgICAgIH0gZWxzZSBpZiAoZGlhZ25vc3RpYy50eXBlID09PSAnV2FybmluZycpIHtcbiAgICAgICAgKyt3YXJuaW5nQ291bnQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBzaG9ydGN1dCA9IGdldEtleWJvYXJkU2hvcnRjdXQoKTtcbiAgICBsZXQgc2hvcnRjdXRTcGFuID0gbnVsbDtcbiAgICBpZiAoc2hvcnRjdXQgIT09ICcnKSB7XG4gICAgICBzaG9ydGN1dFNwYW4gPSAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc3VidGxlIGlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIFVzZSA8a2JkIGNsYXNzTmFtZT1cImtleS1iaW5kaW5nIGtleS1iaW5kaW5nLXNtIHRleHQtaGlnaGxpZ2h0XCI+e3Nob3J0Y3V0fTwva2JkPiB0byB0b2dnbGVcbiAgICAgICAgICB0aGlzIHBhbmVsLlxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBsaW50ZXJXYXJuaW5nID0gbnVsbDtcbiAgICBpZiAodGhpcy5wcm9wcy53YXJuQWJvdXRMaW50ZXIpIHtcbiAgICAgIGxpbnRlcldhcm5pbmcgPSAoXG4gICAgICAgIDxUb29sYmFyPlxuICAgICAgICAgIDxUb29sYmFyQ2VudGVyPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGhpZ2hsaWdodC1pbmZvXCI+XG4gICAgICAgICAgICAgIG51Y2xpZGUtZGlhZ25vc3RpY3MgaXMgbm90IGNvbXBhdGlibGUgd2l0aCB0aGUgbGludGVyIHBhY2thZ2UuIFdlIHJlY29tbWVuZCB0aGF0XG4gICAgICAgICAgICAgIHlvdSZuYnNwOzxhIG9uQ2xpY2s9e3RoaXMucHJvcHMuZGlzYWJsZUxpbnRlcn0+ZGlzYWJsZSB0aGUgbGludGVyIHBhY2thZ2U8L2E+LiZuYnNwO1xuICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cDovL251Y2xpZGUuaW8vZG9jcy9hZHZhbmNlZC10b3BpY3MvbGludGVyLXBhY2thZ2UtY29tcGF0aWJpbGl0eS9cIj5cbiAgICAgICAgICAgICAgTGVhcm4gTW9yZTwvYT4uXG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9Ub29sYmFyQ2VudGVyPlxuICAgICAgICA8L1Rvb2xiYXI+XG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGVycm9yU3BhbkNsYXNzTmFtZSA9IGBpbmxpbmUtYmxvY2sgJHtlcnJvckNvdW50ID4gMCA/ICd0ZXh0LWVycm9yJyA6ICcnfWA7XG4gICAgY29uc3Qgd2FybmluZ1NwYW5DbGFzc05hbWUgPSBgaW5saW5lLWJsb2NrICR7d2FybmluZ0NvdW50ID4gMCA/ICd0ZXh0LXdhcm5pbmcnIDogJyd9YDtcblxuICAgIC8vIFdlIGhpZGUgdGhlIGhvcml6b250YWwgb3ZlcmZsb3cgaW4gdGhlIFBhbmVsQ29tcG9uZW50IGJlY2F1c2UgdGhlIHByZXNlbmNlIG9mIHRoZSBzY3JvbGxiYXJcbiAgICAvLyB0aHJvd3Mgb2ZmIG91ciBoZWlnaHQgY2FsY3VsYXRpb25zLlxuICAgIHJldHVybiAoXG4gICAgICA8UGFuZWxDb21wb25lbnRcbiAgICAgICAgcmVmPVwicGFuZWxcIlxuICAgICAgICBkb2NrPVwiYm90dG9tXCJcbiAgICAgICAgaW5pdGlhbExlbmd0aD17dGhpcy5wcm9wcy5oZWlnaHR9XG4gICAgICAgIG5vU2Nyb2xsPXt0cnVlfVxuICAgICAgICBvblJlc2l6ZT17dGhpcy5wcm9wcy5vblJlc2l6ZX1cbiAgICAgICAgb3ZlcmZsb3dYPVwiaGlkZGVuXCI+XG4gICAgICAgIDxkaXYgc3R5bGU9e3tkaXNwbGF5OiAnZmxleCcsIGZsZXg6IDEsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nfX0+XG4gICAgICAgICAge2xpbnRlcldhcm5pbmd9XG4gICAgICAgICAgPFRvb2xiYXIgbG9jYXRpb249XCJ0b3BcIj5cbiAgICAgICAgICAgIDxUb29sYmFyTGVmdD5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtlcnJvclNwYW5DbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgIEVycm9yczoge2Vycm9yQ291bnR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXt3YXJuaW5nU3BhbkNsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgV2FybmluZ3M6IHt3YXJuaW5nQ291bnR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgICAgICAgPENoZWNrYm94XG4gICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvcn1cbiAgICAgICAgICAgICAgICAgIGxhYmVsPVwiU2hvdyBvbmx5IGRpYWdub3N0aWNzIGZvciBjdXJyZW50IGZpbGVcIlxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvVG9vbGJhckxlZnQ+XG4gICAgICAgICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICAgICAgICB7c2hvcnRjdXRTcGFufVxuICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkRpc21pc3N9XG4gICAgICAgICAgICAgICAgaWNvbj1cInhcIlxuICAgICAgICAgICAgICAgIHNpemU9e0J1dHRvblNpemVzLlNNQUxMfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJDbG9zZSBQYW5lbFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L1Rvb2xiYXJSaWdodD5cbiAgICAgICAgICA8L1Rvb2xiYXI+XG4gICAgICAgICAgPERpYWdub3N0aWNzUGFuZVxuICAgICAgICAgICAgc2hvd0ZpbGVOYW1lPXshdGhpcy5wcm9wcy5maWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3J9XG4gICAgICAgICAgICBkaWFnbm9zdGljcz17ZGlhZ25vc3RpY3N9XG4gICAgICAgICAgICB3aWR0aD17dGhpcy5wcm9wcy53aWR0aH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZShpc0NoZWNrZWQ6IGJvb2xlYW4pIHtcbiAgICB0cmFjaygnZGlhZ25vc3RpY3MtcGFuZWwtdG9nZ2xlLWN1cnJlbnQtZmlsZScsIHtpc0NoZWNrZWQ6IGlzQ2hlY2tlZC50b1N0cmluZygpfSk7XG4gICAgdGhpcy5wcm9wcy5vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZS5jYWxsKG51bGwsIGlzQ2hlY2tlZCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWFnbm9zdGljc1BhbmVsO1xuIl19