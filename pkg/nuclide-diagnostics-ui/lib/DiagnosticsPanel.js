var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideAnalytics = require('../../nuclide-analytics');

// This must match the value in diagnostics-table.less.

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

var _require3 = require('react-for-atom');

var React = _require3.React;
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
    var _require4 = require('../../nuclide-keystroke-label');

    var humanizeKeystroke = _require4.humanizeKeystroke;

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
              { href: 'http://nuclide.io/docs/advanced-topics/linter-package-compatibility/' },
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
                React.createElement(Checkbox, {
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
      (0, _nuclideAnalytics.track)('diagnostics-panel-toggle-current-file', { isChecked: isChecked.toString() });
      this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
    }
  }]);

  return DiagnosticsPanel;
})(React.Component);

module.exports = DiagnosticsPanel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNzUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Z0NBaUJvQix5QkFBeUI7Ozs7Ozs7Ozs7OztBQU43QyxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7ZUFDbEMsT0FBTyxDQUFDLCtCQUErQixDQUFDOztJQUFwRCxRQUFRLFlBQVIsUUFBUTs7Z0JBQ1UsT0FBTyxDQUFDLHFDQUFxQyxDQUFDOztJQUFoRSxjQUFjLGFBQWQsY0FBYzs7Z0JBQ0wsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLGFBQUwsS0FBSztJQUNMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7QUFLaEIsSUFBTSx5QkFBeUIsR0FBRyxFQUFFLENBQUM7OztBQUdyQyxJQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQzs7QUFFdEMsSUFBSSxnQkFBeUIsR0FBRyxJQUFJLENBQUM7QUFDckMsU0FBUyxtQkFBbUIsR0FBVztBQUNyQyxNQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM1QixXQUFPLGdCQUFnQixDQUFDO0dBQ3pCOztBQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7QUFDdkQsV0FBTyxFQUFFLHFDQUFxQztHQUMvQyxDQUFDLENBQUM7QUFDSCxNQUFJLG1CQUFtQixDQUFDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUU7b0JBQ3ZDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQzs7UUFBN0QsaUJBQWlCLGFBQWpCLGlCQUFpQjs7QUFDeEIsb0JBQWdCLEdBQUcsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDekUsTUFBTTtBQUNMLG9CQUFnQixHQUFHLEVBQUUsQ0FBQztHQUN2QjtBQUNELFNBQU8sZ0JBQWdCLENBQUM7Q0FDekI7Ozs7OztJQU1LLGdCQUFn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QkFBVyxFQUFFLFdBQVcsQUFBQztBQUN6QixrQkFBTSxFQUFFLFVBQVUsQUFBQztBQUNuQixpQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDO1lBQ3hCO1NBQ0U7T0FDUyxDQUNqQjtLQUNIOzs7V0FFZ0MsMkNBQUMsU0FBa0IsRUFBRTtBQUNwRCxtQ0FBTSx1Q0FBdUMsRUFBRSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQ2xGLFVBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNuRTs7O1NBMUhHLGdCQUFnQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQTZIOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc1BhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRGlhZ25vc3RpY3NQYW5lID0gcmVxdWlyZSgnLi9EaWFnbm9zdGljc1BhbmUnKTtcbmNvbnN0IHtDaGVja2JveH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9DaGVja2JveCcpO1xuY29uc3Qge1BhbmVsQ29tcG9uZW50fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL1BhbmVsQ29tcG9uZW50Jyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuLy8gVGhpcyBtdXN0IG1hdGNoIHRoZSB2YWx1ZSBpbiBkaWFnbm9zdGljcy10YWJsZS5sZXNzLlxuY29uc3QgUEFORUxfSEVBREVSX0hFSUdIVF9JTl9QWCA9IDI4O1xuXG4vLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHZhbHVlIGluIHBhbmVsLWNvbXBvbmVudC5sZXNzLlxuY29uc3QgUkVTSVpFX0hBTkRMRVJfSEVJR0hUX0lOX1BYID0gNDtcblxubGV0IGtleWJvYXJkU2hvcnRjdXQ6ID9zdHJpbmcgPSBudWxsO1xuZnVuY3Rpb24gZ2V0S2V5Ym9hcmRTaG9ydGN1dCgpOiBzdHJpbmcge1xuICBpZiAoa2V5Ym9hcmRTaG9ydGN1dCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGtleWJvYXJkU2hvcnRjdXQ7XG4gIH1cblxuICBjb25zdCBtYXRjaGluZ0tleUJpbmRpbmdzID0gYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyh7XG4gICAgY29tbWFuZDogJ251Y2xpZGUtZGlhZ25vc3RpY3MtdWk6dG9nZ2xlLXRhYmxlJyxcbiAgfSk7XG4gIGlmIChtYXRjaGluZ0tleUJpbmRpbmdzLmxlbmd0aCAmJiBtYXRjaGluZ0tleUJpbmRpbmdzWzBdLmtleXN0cm9rZXMpIHtcbiAgICBjb25zdCB7aHVtYW5pemVLZXlzdHJva2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1rZXlzdHJva2UtbGFiZWwnKTtcbiAgICBrZXlib2FyZFNob3J0Y3V0ID0gaHVtYW5pemVLZXlzdHJva2UobWF0Y2hpbmdLZXlCaW5kaW5nc1swXS5rZXlzdHJva2VzKTtcbiAgfSBlbHNlIHtcbiAgICBrZXlib2FyZFNob3J0Y3V0ID0gJyc7XG4gIH1cbiAgcmV0dXJuIGtleWJvYXJkU2hvcnRjdXQ7XG59XG5cblxuLyoqXG4gKiBEaXNtaXNzYWJsZSBwYW5lbCB0aGF0IGRpc3BsYXlzIHRoZSBkaWFnbm9zdGljcyBmcm9tIG51Y2xpZGUtZGlhZ25vc3RpY3Mtc3RvcmUuXG4gKi9cbmNsYXNzIERpYWdub3N0aWNzUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGRpYWdub3N0aWNzOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvbkRpc21pc3M6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25SZXNpemU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBwYXRoVG9BY3RpdmVUZXh0RWRpdG9yOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvcjogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBvbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB3YXJuQWJvdXRMaW50ZXI6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgZGlzYWJsZUxpbnRlcjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlID1cbiAgICAgIHRoaXMuX29uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBnZXRIZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydwYW5lbCddLmdldExlbmd0aCgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgbGV0IHdhcm5pbmdDb3VudCA9IDA7XG4gICAgbGV0IGVycm9yQ291bnQgPSAwO1xuICAgIGxldCB7ZGlhZ25vc3RpY3N9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodGhpcy5wcm9wcy5maWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3IgJiYgdGhpcy5wcm9wcy5wYXRoVG9BY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICBjb25zdCBwYXRoVG9GaWx0ZXJCeSA9IHRoaXMucHJvcHMucGF0aFRvQWN0aXZlVGV4dEVkaXRvcjtcbiAgICAgIGRpYWdub3N0aWNzID0gZGlhZ25vc3RpY3MuZmlsdGVyKGRpYWdub3N0aWMgPT4gZGlhZ25vc3RpYy5maWxlUGF0aCA9PT0gcGF0aFRvRmlsdGVyQnkpO1xuICAgIH1cbiAgICBkaWFnbm9zdGljcy5mb3JFYWNoKGRpYWdub3N0aWMgPT4ge1xuICAgICAgaWYgKGRpYWdub3N0aWMudHlwZSA9PT0gJ0Vycm9yJykge1xuICAgICAgICArK2Vycm9yQ291bnQ7XG4gICAgICB9IGVsc2UgaWYgKGRpYWdub3N0aWMudHlwZSA9PT0gJ1dhcm5pbmcnKSB7XG4gICAgICAgICsrd2FybmluZ0NvdW50O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgcGFuZWxIZWlnaHQgPSB0aGlzLnByb3BzLmhlaWdodDtcbiAgICBjb25zdCBwYW5lSGVpZ2h0ID0gcGFuZWxIZWlnaHQgLSBQQU5FTF9IRUFERVJfSEVJR0hUX0lOX1BYIC0gUkVTSVpFX0hBTkRMRVJfSEVJR0hUX0lOX1BYO1xuXG4gICAgY29uc3Qgc2hvcnRjdXQgPSBnZXRLZXlib2FyZFNob3J0Y3V0KCk7XG4gICAgbGV0IHNob3J0Y3V0U3BhbiA9IG51bGw7XG4gICAgaWYgKHNob3J0Y3V0KSB7XG4gICAgICBzaG9ydGN1dFNwYW4gPSAoXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc3VidGxlIGlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIFVzZSA8a2JkIGNsYXNzTmFtZT1cImtleS1iaW5kaW5nIGtleS1iaW5kaW5nLXNtIHRleHQtaGlnaGxpZ2h0XCI+XG4gICAgICAgICAge2dldEtleWJvYXJkU2hvcnRjdXQoKX1cbiAgICAgICAgICA8L2tiZD4gdG8gdG9nZ2xlIHRoaXMgcGFuZWwuXG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGxpbnRlcldhcm5pbmcgPSBudWxsO1xuICAgIGlmICh0aGlzLnByb3BzLndhcm5BYm91dExpbnRlcikge1xuICAgICAgbGludGVyV2FybmluZyA9IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLXBhbmUtbGludGVyLXdhcm5pbmdcIj5cbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIG51Y2xpZGUtZGlhZ25vc3RpY3MgaXMgbm90IGNvbXBhdGlibGUgd2l0aCB0aGUgbGludGVyIHBhY2thZ2UuIFdlIHJlY29tbWVuZCB0aGF0XG4gICAgICAgICAgICB5b3UgPGEgb25DbGljaz17dGhpcy5wcm9wcy5kaXNhYmxlTGludGVyfT5kaXNhYmxlIHRoZSBsaW50ZXIgcGFja2FnZTwvYT4uJm5ic3A7XG4gICAgICAgICAgICA8YSBocmVmPVwiaHR0cDovL251Y2xpZGUuaW8vZG9jcy9hZHZhbmNlZC10b3BpY3MvbGludGVyLXBhY2thZ2UtY29tcGF0aWJpbGl0eS9cIj5cbiAgICAgICAgICAgIExlYXJuIE1vcmU8L2E+LlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGVycm9yU3BhbkNsYXNzTmFtZSA9IGBpbmxpbmUtYmxvY2sgJHtlcnJvckNvdW50ID4gMCA/ICd0ZXh0LWVycm9yJyA6ICcnfWA7XG4gICAgY29uc3Qgd2FybmluZ1NwYW5DbGFzc05hbWUgPSBgaW5saW5lLWJsb2NrICR7d2FybmluZ0NvdW50ID4gMCA/ICd0ZXh0LXdhcm5pbmcnIDogJyd9YDtcblxuICAgIC8vIFdlIGhpZGUgdGhlIGhvcml6b250YWwgb3ZlcmZsb3cgaW4gdGhlIFBhbmVsQ29tcG9uZW50IGJlY2F1c2UgdGhlIHByZXNlbmNlIG9mIHRoZSBzY3JvbGxiYXJcbiAgICAvLyB0aHJvd3Mgb2ZmIG91ciBoZWlnaHQgY2FsY3VsYXRpb25zLlxuICAgIHJldHVybiAoXG4gICAgICA8UGFuZWxDb21wb25lbnRcbiAgICAgICAgcmVmPVwicGFuZWxcIlxuICAgICAgICBkb2NrPVwiYm90dG9tXCJcbiAgICAgICAgaW5pdGlhbExlbmd0aD17cGFuZWxIZWlnaHR9XG4gICAgICAgIG9uUmVzaXplPXt0aGlzLnByb3BzLm9uUmVzaXplfVxuICAgICAgICBvdmVyZmxvd1g9XCJoaWRkZW5cIj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICB7bGludGVyV2FybmluZ31cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtcGFuZS1uYXZcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1wYW5lLW5hdi1sZWZ0XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17ZXJyb3JTcGFuQ2xhc3NOYW1lfT5cbiAgICAgICAgICAgICAgICBFcnJvcnM6IHtlcnJvckNvdW50fVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17d2FybmluZ1NwYW5DbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgIFdhcm5pbmdzOiB7d2FybmluZ0NvdW50fVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlxuICAgICAgICAgICAgICAgIDxDaGVja2JveFxuICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5maWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3J9XG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIlNob3cgb25seSBkaWFnbm9zdGljcyBmb3IgY3VycmVudCBmaWxlXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1wYW5lLW5hdi1yaWdodFwiPlxuICAgICAgICAgICAgICB7c2hvcnRjdXRTcGFufVxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkRpc21pc3N9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1zdWJ0bGUgYnRuLXNtIGljb24gaWNvbi14IGlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJDbG9zZSBQYW5lbFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8RGlhZ25vc3RpY3NQYW5lXG4gICAgICAgICAgICBzaG93RmlsZU5hbWU9eyF0aGlzLnByb3BzLmZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvcn1cbiAgICAgICAgICAgIGRpYWdub3N0aWNzPXtkaWFnbm9zdGljc31cbiAgICAgICAgICAgIGhlaWdodD17cGFuZUhlaWdodH1cbiAgICAgICAgICAgIHdpZHRoPXt0aGlzLnByb3BzLndpZHRofVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9QYW5lbENvbXBvbmVudD5cbiAgICApO1xuICB9XG5cbiAgX29uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlKGlzQ2hlY2tlZDogYm9vbGVhbikge1xuICAgIHRyYWNrKCdkaWFnbm9zdGljcy1wYW5lbC10b2dnbGUtY3VycmVudC1maWxlJywge2lzQ2hlY2tlZDogaXNDaGVja2VkLnRvU3RyaW5nKCl9KTtcbiAgICB0aGlzLnByb3BzLm9uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlLmNhbGwobnVsbCwgaXNDaGVja2VkKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdub3N0aWNzUGFuZWw7XG4iXX0=