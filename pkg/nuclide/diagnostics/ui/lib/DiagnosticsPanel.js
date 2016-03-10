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
var NuclideCheckbox = require('../../../ui/checkbox');

var _require = require('../../../ui/panel');

var PanelComponent = _require.PanelComponent;

var _require2 = require('react-for-atom');

var React = _require2.React;
var PropTypes = React.PropTypes;
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
    var _require3 = require('../../../keystroke-label');

    var humanizeKeystroke = _require3.humanizeKeystroke;

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
                React.createElement(NuclideCheckbox, {
                  checked: this.props.filterByActiveTextEditor,
                  label: 'Show only diagnostics for current file',
                  onChange: this._onFilterByActiveTextEditorChange
                })
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
    value: function _onFilterByActiveTextEditorChange(isChecked) {
      (0, _analytics.track)('diagnostics-panel-toggle-current-file', { isChecked: isChecked.toString() });
      this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
    }
  }]);

  return DiagnosticsPanel;
})(React.Component);

module.exports = DiagnosticsPanel;
//# sourceMappingURL=data:application/json;base64,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VyxFQUFFLFdBQVcsQUFBQztBQUN6QixrQkFBTSxFQUFFLFVBQVUsQUFBQztBQUNuQixpQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDO1lBQ3hCO1NBQ0U7T0FDUyxDQUNqQjtLQUNIOzs7V0FFZ0MsMkNBQUMsU0FBa0IsRUFBRTtBQUNwRCw0QkFBTSx1Q0FBdUMsRUFBRSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQ2xGLFVBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNuRTs7O1NBMUhHLGdCQUFnQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQTZIOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc1BhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRGlhZ25vc3RpY3NQYW5lID0gcmVxdWlyZSgnLi9EaWFnbm9zdGljc1BhbmUnKTtcbmNvbnN0IE51Y2xpZGVDaGVja2JveCA9IHJlcXVpcmUoJy4uLy4uLy4uL3VpL2NoZWNrYm94Jyk7XG5jb25zdCB7UGFuZWxDb21wb25lbnR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vdWkvcGFuZWwnKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vLi4vYW5hbHl0aWNzJztcblxuLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB2YWx1ZSBpbiBkaWFnbm9zdGljcy10YWJsZS5sZXNzLlxuY29uc3QgUEFORUxfSEVBREVSX0hFSUdIVF9JTl9QWCA9IDI4O1xuXG4vLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHZhbHVlIGluIHBhbmVsLWNvbXBvbmVudC5sZXNzLlxuY29uc3QgUkVTSVpFX0hBTkRMRVJfSEVJR0hUX0lOX1BYID0gNDtcblxubGV0IGtleWJvYXJkU2hvcnRjdXQ6ID9zdHJpbmcgPSBudWxsO1xuZnVuY3Rpb24gZ2V0S2V5Ym9hcmRTaG9ydGN1dCgpOiBzdHJpbmcge1xuICBpZiAoa2V5Ym9hcmRTaG9ydGN1dCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGtleWJvYXJkU2hvcnRjdXQ7XG4gIH1cblxuICBjb25zdCBtYXRjaGluZ0tleUJpbmRpbmdzID0gYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyh7XG4gICAgY29tbWFuZDogJ251Y2xpZGUtZGlhZ25vc3RpY3MtdWk6dG9nZ2xlLXRhYmxlJyxcbiAgfSk7XG4gIGlmIChtYXRjaGluZ0tleUJpbmRpbmdzLmxlbmd0aCAmJiBtYXRjaGluZ0tleUJpbmRpbmdzWzBdLmtleXN0cm9rZXMpIHtcbiAgICBjb25zdCB7aHVtYW5pemVLZXlzdHJva2V9ID0gcmVxdWlyZSgnLi4vLi4vLi4va2V5c3Ryb2tlLWxhYmVsJyk7XG4gICAga2V5Ym9hcmRTaG9ydGN1dCA9IGh1bWFuaXplS2V5c3Ryb2tlKG1hdGNoaW5nS2V5QmluZGluZ3NbMF0ua2V5c3Ryb2tlcyk7XG4gIH0gZWxzZSB7XG4gICAga2V5Ym9hcmRTaG9ydGN1dCA9ICcnO1xuICB9XG4gIHJldHVybiBrZXlib2FyZFNob3J0Y3V0O1xufVxuXG5cbi8qKlxuICogRGlzbWlzc2FibGUgcGFuZWwgdGhhdCBkaXNwbGF5cyB0aGUgZGlhZ25vc3RpY3MgZnJvbSBudWNsaWRlLWRpYWdub3N0aWNzLXN0b3JlLlxuICovXG5jbGFzcyBEaWFnbm9zdGljc1BhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBkaWFnbm9zdGljczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgb25EaXNtaXNzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uUmVzaXplOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgcGF0aFRvQWN0aXZlVGV4dEVkaXRvcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBmaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3I6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgb25GaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3JDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgd2FybkFib3V0TGludGVyOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGRpc2FibGVMaW50ZXI6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZSA9XG4gICAgICB0aGlzLl9vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgZ2V0SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1sncGFuZWwnXS5nZXRMZW5ndGgoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCB3YXJuaW5nQ291bnQgPSAwO1xuICAgIGxldCBlcnJvckNvdW50ID0gMDtcbiAgICBsZXQge2RpYWdub3N0aWNzfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHRoaXMucHJvcHMuZmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yICYmIHRoaXMucHJvcHMucGF0aFRvQWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgY29uc3QgcGF0aFRvRmlsdGVyQnkgPSB0aGlzLnByb3BzLnBhdGhUb0FjdGl2ZVRleHRFZGl0b3I7XG4gICAgICBkaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzLmZpbHRlcihkaWFnbm9zdGljID0+IGRpYWdub3N0aWMuZmlsZVBhdGggPT09IHBhdGhUb0ZpbHRlckJ5KTtcbiAgICB9XG4gICAgZGlhZ25vc3RpY3MuZm9yRWFjaChkaWFnbm9zdGljID0+IHtcbiAgICAgIGlmIChkaWFnbm9zdGljLnR5cGUgPT09ICdFcnJvcicpIHtcbiAgICAgICAgKytlcnJvckNvdW50O1xuICAgICAgfSBlbHNlIGlmIChkaWFnbm9zdGljLnR5cGUgPT09ICdXYXJuaW5nJykge1xuICAgICAgICArK3dhcm5pbmdDb3VudDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHBhbmVsSGVpZ2h0ID0gdGhpcy5wcm9wcy5oZWlnaHQ7XG4gICAgY29uc3QgcGFuZUhlaWdodCA9IHBhbmVsSGVpZ2h0IC0gUEFORUxfSEVBREVSX0hFSUdIVF9JTl9QWCAtIFJFU0laRV9IQU5ETEVSX0hFSUdIVF9JTl9QWDtcblxuICAgIGNvbnN0IHNob3J0Y3V0ID0gZ2V0S2V5Ym9hcmRTaG9ydGN1dCgpO1xuICAgIGxldCBzaG9ydGN1dFNwYW4gPSBudWxsO1xuICAgIGlmIChzaG9ydGN1dCkge1xuICAgICAgc2hvcnRjdXRTcGFuID0gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXN1YnRsZSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICBVc2UgPGtiZCBjbGFzc05hbWU9XCJrZXktYmluZGluZyBrZXktYmluZGluZy1zbSB0ZXh0LWhpZ2hsaWdodFwiPlxuICAgICAgICAgIHtnZXRLZXlib2FyZFNob3J0Y3V0KCl9XG4gICAgICAgICAgPC9rYmQ+IHRvIHRvZ2dsZSB0aGlzIHBhbmVsLlxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBsaW50ZXJXYXJuaW5nID0gbnVsbDtcbiAgICBpZiAodGhpcy5wcm9wcy53YXJuQWJvdXRMaW50ZXIpIHtcbiAgICAgIGxpbnRlcldhcm5pbmcgPSAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1wYW5lLWxpbnRlci13YXJuaW5nXCI+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICBudWNsaWRlLWRpYWdub3N0aWNzIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIGxpbnRlciBwYWNrYWdlLiBXZSByZWNvbW1lbmQgdGhhdFxuICAgICAgICAgICAgeW91IDxhIG9uQ2xpY2s9e3RoaXMucHJvcHMuZGlzYWJsZUxpbnRlcn0+ZGlzYWJsZSB0aGUgbGludGVyIHBhY2thZ2U8L2E+LiZuYnNwO1xuICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9udWNsaWRlL3RyZWUvbWFzdGVyL3BrZy9udWNsaWRlL2RpYWdub3N0aWNzXCI+XG4gICAgICAgICAgICBMZWFybiBNb3JlPC9hPi5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBlcnJvclNwYW5DbGFzc05hbWUgPSBgaW5saW5lLWJsb2NrICR7ZXJyb3JDb3VudCA+IDAgPyAndGV4dC1lcnJvcicgOiAnJ31gO1xuICAgIGNvbnN0IHdhcm5pbmdTcGFuQ2xhc3NOYW1lID0gYGlubGluZS1ibG9jayAke3dhcm5pbmdDb3VudCA+IDAgPyAndGV4dC13YXJuaW5nJyA6ICcnfWA7XG5cbiAgICAvLyBXZSBoaWRlIHRoZSBob3Jpem9udGFsIG92ZXJmbG93IGluIHRoZSBQYW5lbENvbXBvbmVudCBiZWNhdXNlIHRoZSBwcmVzZW5jZSBvZiB0aGUgc2Nyb2xsYmFyXG4gICAgLy8gdGhyb3dzIG9mZiBvdXIgaGVpZ2h0IGNhbGN1bGF0aW9ucy5cbiAgICByZXR1cm4gKFxuICAgICAgPFBhbmVsQ29tcG9uZW50XG4gICAgICAgIHJlZj1cInBhbmVsXCJcbiAgICAgICAgZG9jaz1cImJvdHRvbVwiXG4gICAgICAgIGluaXRpYWxMZW5ndGg9e3BhbmVsSGVpZ2h0fVxuICAgICAgICBvblJlc2l6ZT17dGhpcy5wcm9wcy5vblJlc2l6ZX1cbiAgICAgICAgb3ZlcmZsb3dYPVwiaGlkZGVuXCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAge2xpbnRlcldhcm5pbmd9XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLXBhbmUtbmF2XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtcGFuZS1uYXYtbGVmdFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Vycm9yU3BhbkNsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgRXJyb3JzOiB7ZXJyb3JDb3VudH1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3dhcm5pbmdTcGFuQ2xhc3NOYW1lfT5cbiAgICAgICAgICAgICAgICBXYXJuaW5nczoge3dhcm5pbmdDb3VudH1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICAgICAgICA8TnVjbGlkZUNoZWNrYm94XG4gICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvcn1cbiAgICAgICAgICAgICAgICAgIGxhYmVsPVwiU2hvdyBvbmx5IGRpYWdub3N0aWNzIGZvciBjdXJyZW50IGZpbGVcIlxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLXBhbmUtbmF2LXJpZ2h0XCI+XG4gICAgICAgICAgICAgIHtzaG9ydGN1dFNwYW59XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uRGlzbWlzc31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXN1YnRsZSBidG4tc20gaWNvbiBpY29uLXggaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIkNsb3NlIFBhbmVsXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxEaWFnbm9zdGljc1BhbmVcbiAgICAgICAgICAgIHNob3dGaWxlTmFtZT17IXRoaXMucHJvcHMuZmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yfVxuICAgICAgICAgICAgZGlhZ25vc3RpY3M9e2RpYWdub3N0aWNzfVxuICAgICAgICAgICAgaGVpZ2h0PXtwYW5lSGVpZ2h0fVxuICAgICAgICAgICAgd2lkdGg9e3RoaXMucHJvcHMud2lkdGh9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BhbmVsQ29tcG9uZW50PlxuICAgICk7XG4gIH1cblxuICBfb25GaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3JDaGFuZ2UoaXNDaGVja2VkOiBib29sZWFuKSB7XG4gICAgdHJhY2soJ2RpYWdub3N0aWNzLXBhbmVsLXRvZ2dsZS1jdXJyZW50LWZpbGUnLCB7aXNDaGVja2VkOiBpc0NoZWNrZWQudG9TdHJpbmcoKX0pO1xuICAgIHRoaXMucHJvcHMub25GaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3JDaGFuZ2UuY2FsbChudWxsLCBpc0NoZWNrZWQpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlhZ25vc3RpY3NQYW5lbDtcbiJdfQ==