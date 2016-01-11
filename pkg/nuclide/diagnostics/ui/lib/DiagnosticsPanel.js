var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _analytics = require('../../../analytics');

// This must match the value in diagnostics-table.less.

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DiagnosticsPane = require('./DiagnosticsPane');

var _require = require('../../../ui/panel');

var PanelComponent = _require.PanelComponent;

var React = require('react-for-atom');

var PANEL_HEADER_HEIGHT_IN_PX = 28;

// This must match the value in panel-component.less.
var RESIZE_HANDLER_HEIGHT_IN_PX = 4;

var keyboardShortcut = null;
function getKeyboardShortcut() {
  if (keyboardShortcut != null) {
    return keyboardShortcut;
  }

  var matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: 'nuclide-diagnostics-ui:toggle-table'
  });
  if (matchingKeyBindings.length && matchingKeyBindings[0].keystrokes) {
    var _require2 = require('../../../keystroke-label');

    var humanizeKeystroke = _require2.humanizeKeystroke;

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

      var panelHeight = this.props.height;
      var paneHeight = panelHeight - PANEL_HEADER_HEIGHT_IN_PX - RESIZE_HANDLER_HEIGHT_IN_PX;

      var shortcut = getKeyboardShortcut();
      var shortcutSpan = null;
      if (shortcut) {
        shortcutSpan = React.createElement(
          'span',
          { className: 'text-subtle inline-block' },
          'Use ',
          React.createElement(
            'kbd',
            { className: 'key-binding key-binding-sm text-highlight' },
            getKeyboardShortcut()
          ),
          ' to toggle this panel.'
        );
      }

      var linterWarning = null;
      if (this.props.warnAboutLinter) {
        linterWarning = React.createElement(
          'div',
          { className: 'nuclide-diagnostics-pane-linter-warning' },
          React.createElement(
            'span',
            null,
            'nuclide-diagnostics is not compatible with the linter package. We recommend that you ',
            React.createElement(
              'a',
              { onClick: this.props.disableLinter },
              'disable the linter package'
            ),
            '. ',
            React.createElement(
              'a',
              { href: 'https://github.com/facebook/nuclide/tree/master/pkg/nuclide/diagnostics' },
              'Learn More'
            ),
            '.'
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
          initialLength: panelHeight,
          onResize: this.props.onResize,
          overflowX: 'hidden' },
        React.createElement(
          'div',
          null,
          linterWarning,
          React.createElement(
            'div',
            { className: 'nuclide-diagnostics-pane-nav' },
            React.createElement(
              'div',
              { className: 'nuclide-diagnostics-pane-nav-left' },
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
                React.createElement(
                  'label',
                  { className: 'nuclide-diagnostics-label' },
                  React.createElement('input', {
                    type: 'checkbox',
                    checked: this.props.filterByActiveTextEditor,
                    onChange: this._onFilterByActiveTextEditorChange
                  }),
                  '  Show only diagnostics for current file.'
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'nuclide-diagnostics-pane-nav-right' },
              shortcutSpan,
              React.createElement('button', {
                onClick: this.props.onDismiss,
                className: 'btn btn-subtle btn-sm icon icon-x inline-block',
                title: 'Close Panel'
              })
            )
          ),
          React.createElement(DiagnosticsPane, {
            showFileName: !this.props.filterByActiveTextEditor,
            diagnostics: diagnostics,
            height: paneHeight,
            width: this.props.width
          })
        )
      );
    }
  }, {
    key: '_onFilterByActiveTextEditorChange',
    value: function _onFilterByActiveTextEditorChange(event) {
      var isChecked = event.target.checked;
      (0, _analytics.track)('diagnostics-panel-toggle-current-file', { isChecked: isChecked.toString() });
      this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
    }
  }]);

  return DiagnosticsPanel;
})(React.Component);

var PropTypes = React.PropTypes;

DiagnosticsPanel.propTypes = {
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
};

module.exports = DiagnosticsPanel;
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ25DLFdBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDcEMsVUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNuQyxPQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2xDLHdCQUFzQixFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ3hDLDBCQUF3QixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNuRCxrQ0FBZ0MsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDM0QsaUJBQWUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDMUMsZUFBYSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtDQUN6QyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUMiLCJmaWxlIjoiRGlhZ25vc3RpY3NQYW5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IERpYWdub3N0aWNzUGFuZSA9IHJlcXVpcmUoJy4vRGlhZ25vc3RpY3NQYW5lJyk7XG5jb25zdCB7UGFuZWxDb21wb25lbnR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vdWkvcGFuZWwnKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vLi4vYW5hbHl0aWNzJztcblxuLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB2YWx1ZSBpbiBkaWFnbm9zdGljcy10YWJsZS5sZXNzLlxuY29uc3QgUEFORUxfSEVBREVSX0hFSUdIVF9JTl9QWCA9IDI4O1xuXG4vLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHZhbHVlIGluIHBhbmVsLWNvbXBvbmVudC5sZXNzLlxuY29uc3QgUkVTSVpFX0hBTkRMRVJfSEVJR0hUX0lOX1BYID0gNDtcblxubGV0IGtleWJvYXJkU2hvcnRjdXQ6ID9zdHJpbmcgPSBudWxsO1xuZnVuY3Rpb24gZ2V0S2V5Ym9hcmRTaG9ydGN1dCgpOiBzdHJpbmcge1xuICBpZiAoa2V5Ym9hcmRTaG9ydGN1dCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGtleWJvYXJkU2hvcnRjdXQ7XG4gIH1cblxuICBjb25zdCBtYXRjaGluZ0tleUJpbmRpbmdzID0gYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyh7XG4gICAgY29tbWFuZDogJ251Y2xpZGUtZGlhZ25vc3RpY3MtdWk6dG9nZ2xlLXRhYmxlJyxcbiAgfSk7XG4gIGlmIChtYXRjaGluZ0tleUJpbmRpbmdzLmxlbmd0aCAmJiBtYXRjaGluZ0tleUJpbmRpbmdzWzBdLmtleXN0cm9rZXMpIHtcbiAgICBjb25zdCB7aHVtYW5pemVLZXlzdHJva2V9ID0gcmVxdWlyZSgnLi4vLi4vLi4va2V5c3Ryb2tlLWxhYmVsJyk7XG4gICAga2V5Ym9hcmRTaG9ydGN1dCA9IGh1bWFuaXplS2V5c3Ryb2tlKG1hdGNoaW5nS2V5QmluZGluZ3NbMF0ua2V5c3Ryb2tlcyk7XG4gIH0gZWxzZSB7XG4gICAga2V5Ym9hcmRTaG9ydGN1dCA9ICcnO1xuICB9XG4gIHJldHVybiBrZXlib2FyZFNob3J0Y3V0O1xufVxuXG5cbi8qKlxuICogRGlzbWlzc2FibGUgcGFuZWwgdGhhdCBkaXNwbGF5cyB0aGUgZGlhZ25vc3RpY3MgZnJvbSBudWNsaWRlLWRpYWdub3N0aWNzLXN0b3JlLlxuICovXG5jbGFzcyBEaWFnbm9zdGljc1BhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX29uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlID0gdGhpcy5fb25GaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3JDaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldEhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ3BhbmVsJ10uZ2V0TGVuZ3RoKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgd2FybmluZ0NvdW50ID0gMDtcbiAgICBsZXQgZXJyb3JDb3VudCA9IDA7XG4gICAgbGV0IHtkaWFnbm9zdGljc30gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0aGlzLnByb3BzLmZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvciAmJiB0aGlzLnByb3BzLnBhdGhUb0FjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIGNvbnN0IHBhdGhUb0ZpbHRlckJ5ID0gdGhpcy5wcm9wcy5wYXRoVG9BY3RpdmVUZXh0RWRpdG9yO1xuICAgICAgZGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5maWx0ZXIoZGlhZ25vc3RpYyA9PiBkaWFnbm9zdGljLmZpbGVQYXRoID09PSBwYXRoVG9GaWx0ZXJCeSk7XG4gICAgfVxuICAgIGRpYWdub3N0aWNzLmZvckVhY2goZGlhZ25vc3RpYyA9PiB7XG4gICAgICBpZiAoZGlhZ25vc3RpYy50eXBlID09PSAnRXJyb3InKSB7XG4gICAgICAgICsrZXJyb3JDb3VudDtcbiAgICAgIH0gZWxzZSBpZiAoZGlhZ25vc3RpYy50eXBlID09PSAnV2FybmluZycpIHtcbiAgICAgICAgKyt3YXJuaW5nQ291bnQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBwYW5lbEhlaWdodCA9IHRoaXMucHJvcHMuaGVpZ2h0O1xuICAgIGNvbnN0IHBhbmVIZWlnaHQgPSBwYW5lbEhlaWdodCAtIFBBTkVMX0hFQURFUl9IRUlHSFRfSU5fUFggLSBSRVNJWkVfSEFORExFUl9IRUlHSFRfSU5fUFg7XG5cbiAgICBjb25zdCBzaG9ydGN1dCA9IGdldEtleWJvYXJkU2hvcnRjdXQoKTtcbiAgICBsZXQgc2hvcnRjdXRTcGFuID0gbnVsbDtcbiAgICBpZiAoc2hvcnRjdXQpIHtcbiAgICAgIHNob3J0Y3V0U3BhbiA9IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zdWJ0bGUgaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgVXNlIDxrYmQgY2xhc3NOYW1lPVwia2V5LWJpbmRpbmcga2V5LWJpbmRpbmctc20gdGV4dC1oaWdobGlnaHRcIj5cbiAgICAgICAgICB7Z2V0S2V5Ym9hcmRTaG9ydGN1dCgpfVxuICAgICAgICAgIDwva2JkPiB0byB0b2dnbGUgdGhpcyBwYW5lbC5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgbGludGVyV2FybmluZyA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJvcHMud2FybkFib3V0TGludGVyKSB7XG4gICAgICBsaW50ZXJXYXJuaW5nID0gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtcGFuZS1saW50ZXItd2FybmluZ1wiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgbnVjbGlkZS1kaWFnbm9zdGljcyBpcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBsaW50ZXIgcGFja2FnZS4gV2UgcmVjb21tZW5kIHRoYXRcbiAgICAgICAgICAgIHlvdSA8YSBvbkNsaWNrPXt0aGlzLnByb3BzLmRpc2FibGVMaW50ZXJ9PmRpc2FibGUgdGhlIGxpbnRlciBwYWNrYWdlPC9hPi4mbmJzcDtcbiAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svbnVjbGlkZS90cmVlL21hc3Rlci9wa2cvbnVjbGlkZS9kaWFnbm9zdGljc1wiPlxuICAgICAgICAgICAgTGVhcm4gTW9yZTwvYT4uXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgZXJyb3JTcGFuQ2xhc3NOYW1lID0gYGlubGluZS1ibG9jayAke2Vycm9yQ291bnQgPiAwID8gJ3RleHQtZXJyb3InIDogJyd9YDtcbiAgICBjb25zdCB3YXJuaW5nU3BhbkNsYXNzTmFtZSA9IGBpbmxpbmUtYmxvY2sgJHt3YXJuaW5nQ291bnQgPiAwID8gJ3RleHQtd2FybmluZycgOiAnJ31gO1xuXG4gICAgLy8gV2UgaGlkZSB0aGUgaG9yaXpvbnRhbCBvdmVyZmxvdyBpbiB0aGUgUGFuZWxDb21wb25lbnQgYmVjYXVzZSB0aGUgcHJlc2VuY2Ugb2YgdGhlIHNjcm9sbGJhclxuICAgIC8vIHRocm93cyBvZmYgb3VyIGhlaWdodCBjYWxjdWxhdGlvbnMuXG4gICAgcmV0dXJuIChcbiAgICAgIDxQYW5lbENvbXBvbmVudFxuICAgICAgICByZWY9XCJwYW5lbFwiXG4gICAgICAgIGRvY2s9XCJib3R0b21cIlxuICAgICAgICBpbml0aWFsTGVuZ3RoPXtwYW5lbEhlaWdodH1cbiAgICAgICAgb25SZXNpemU9e3RoaXMucHJvcHMub25SZXNpemV9XG4gICAgICAgIG92ZXJmbG93WD1cImhpZGRlblwiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIHtsaW50ZXJXYXJuaW5nfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1wYW5lLW5hdlwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLXBhbmUtbmF2LWxlZnRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtlcnJvclNwYW5DbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgIEVycm9yczoge2Vycm9yQ291bnR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXt3YXJuaW5nU3BhbkNsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgV2FybmluZ3M6IHt3YXJuaW5nQ291bnR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvcn1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICZuYnNwO1xuICAgICAgICAgICAgICAgICAgU2hvdyBvbmx5IGRpYWdub3N0aWNzIGZvciBjdXJyZW50IGZpbGUuXG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtcGFuZS1uYXYtcmlnaHRcIj5cbiAgICAgICAgICAgICAge3Nob3J0Y3V0U3Bhbn1cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25EaXNtaXNzfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tc3VidGxlIGJ0bi1zbSBpY29uIGljb24teCBpbmxpbmUtYmxvY2tcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiQ2xvc2UgUGFuZWxcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPERpYWdub3N0aWNzUGFuZVxuICAgICAgICAgICAgc2hvd0ZpbGVOYW1lPXshdGhpcy5wcm9wcy5maWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3J9XG4gICAgICAgICAgICBkaWFnbm9zdGljcz17ZGlhZ25vc3RpY3N9XG4gICAgICAgICAgICBoZWlnaHQ9e3BhbmVIZWlnaHR9XG4gICAgICAgICAgICB3aWR0aD17dGhpcy5wcm9wcy53aWR0aH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZShldmVudDogU3ludGhldGljRXZlbnQpIHtcbiAgICBjb25zdCBpc0NoZWNrZWQgPSAoKGV2ZW50LnRhcmdldDogYW55KTogSFRNTElucHV0RWxlbWVudCkuY2hlY2tlZDtcbiAgICB0cmFjaygnZGlhZ25vc3RpY3MtcGFuZWwtdG9nZ2xlLWN1cnJlbnQtZmlsZScsIHtpc0NoZWNrZWQ6IGlzQ2hlY2tlZC50b1N0cmluZygpfSk7XG4gICAgdGhpcy5wcm9wcy5vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZS5jYWxsKG51bGwsIGlzQ2hlY2tlZCk7XG4gIH1cbn1cblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuRGlhZ25vc3RpY3NQYW5lbC5wcm9wVHlwZXMgPSB7XG4gIGRpYWdub3N0aWNzOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIG9uRGlzbWlzczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25SZXNpemU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIHBhdGhUb0FjdGl2ZVRleHRFZGl0b3I6IFByb3BUeXBlcy5zdHJpbmcsXG4gIGZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvcjogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgb25GaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3JDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIHdhcm5BYm91dExpbnRlcjogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgZGlzYWJsZUxpbnRlcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGlhZ25vc3RpY3NQYW5lbDtcbiJdfQ==