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

var _require = require('../../nuclide-ui/lib/NuclideCheckbox');

var NuclideCheckbox = _require.NuclideCheckbox;

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
      (0, _nuclideAnalytics.track)('diagnostics-panel-toggle-current-file', { isChecked: isChecked.toString() });
      this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
    }
  }]);

  return DiagnosticsPanel;
})(React.Component);

module.exports = DiagnosticsPanel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNzUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Z0NBaUJvQix5QkFBeUI7Ozs7Ozs7Ozs7OztBQU43QyxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7ZUFDM0IsT0FBTyxDQUFDLHNDQUFzQyxDQUFDOztJQUFsRSxlQUFlLFlBQWYsZUFBZTs7Z0JBQ0csT0FBTyxDQUFDLHFDQUFxQyxDQUFDOztJQUFoRSxjQUFjLGFBQWQsY0FBYzs7Z0JBQ0wsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLGFBQUwsS0FBSztJQUNMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7QUFLaEIsSUFBTSx5QkFBeUIsR0FBRyxFQUFFLENBQUM7OztBQUdyQyxJQUFNLDJCQUEyQixHQUFHLENBQUMsQ0FBQzs7QUFFdEMsSUFBSSxnQkFBeUIsR0FBRyxJQUFJLENBQUM7QUFDckMsU0FBUyxtQkFBbUIsR0FBVztBQUNyQyxNQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM1QixXQUFPLGdCQUFnQixDQUFDO0dBQ3pCOztBQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7QUFDdkQsV0FBTyxFQUFFLHFDQUFxQztHQUMvQyxDQUFDLENBQUM7QUFDSCxNQUFJLG1CQUFtQixDQUFDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUU7b0JBQ3ZDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQzs7UUFBN0QsaUJBQWlCLGFBQWpCLGlCQUFpQjs7QUFDeEIsb0JBQWdCLEdBQUcsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDekUsTUFBTTtBQUNMLG9CQUFnQixHQUFHLEVBQUUsQ0FBQztHQUN2QjtBQUNELFNBQU8sZ0JBQWdCLENBQUM7Q0FDekI7Ozs7OztJQU1LLGdCQUFn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QkFBVyxFQUFFLFdBQVcsQUFBQztBQUN6QixrQkFBTSxFQUFFLFVBQVUsQUFBQztBQUNuQixpQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDO1lBQ3hCO1NBQ0U7T0FDUyxDQUNqQjtLQUNIOzs7V0FFZ0MsMkNBQUMsU0FBa0IsRUFBRTtBQUNwRCxtQ0FBTSx1Q0FBdUMsRUFBRSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQ2xGLFVBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNuRTs7O1NBMUhHLGdCQUFnQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQTZIOUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyIsImZpbGUiOiJEaWFnbm9zdGljc1BhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRGlhZ25vc3RpY3NQYW5lID0gcmVxdWlyZSgnLi9EaWFnbm9zdGljc1BhbmUnKTtcbmNvbnN0IHtOdWNsaWRlQ2hlY2tib3h9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS11aS9saWIvTnVjbGlkZUNoZWNrYm94Jyk7XG5jb25zdCB7UGFuZWxDb21wb25lbnR9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS11aS9saWIvUGFuZWxDb21wb25lbnQnKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG4vLyBUaGlzIG11c3QgbWF0Y2ggdGhlIHZhbHVlIGluIGRpYWdub3N0aWNzLXRhYmxlLmxlc3MuXG5jb25zdCBQQU5FTF9IRUFERVJfSEVJR0hUX0lOX1BYID0gMjg7XG5cbi8vIFRoaXMgbXVzdCBtYXRjaCB0aGUgdmFsdWUgaW4gcGFuZWwtY29tcG9uZW50Lmxlc3MuXG5jb25zdCBSRVNJWkVfSEFORExFUl9IRUlHSFRfSU5fUFggPSA0O1xuXG5sZXQga2V5Ym9hcmRTaG9ydGN1dDogP3N0cmluZyA9IG51bGw7XG5mdW5jdGlvbiBnZXRLZXlib2FyZFNob3J0Y3V0KCk6IHN0cmluZyB7XG4gIGlmIChrZXlib2FyZFNob3J0Y3V0ICE9IG51bGwpIHtcbiAgICByZXR1cm4ga2V5Ym9hcmRTaG9ydGN1dDtcbiAgfVxuXG4gIGNvbnN0IG1hdGNoaW5nS2V5QmluZGluZ3MgPSBhdG9tLmtleW1hcHMuZmluZEtleUJpbmRpbmdzKHtcbiAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWFnbm9zdGljcy11aTp0b2dnbGUtdGFibGUnLFxuICB9KTtcbiAgaWYgKG1hdGNoaW5nS2V5QmluZGluZ3MubGVuZ3RoICYmIG1hdGNoaW5nS2V5QmluZGluZ3NbMF0ua2V5c3Ryb2tlcykge1xuICAgIGNvbnN0IHtodW1hbml6ZUtleXN0cm9rZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWtleXN0cm9rZS1sYWJlbCcpO1xuICAgIGtleWJvYXJkU2hvcnRjdXQgPSBodW1hbml6ZUtleXN0cm9rZShtYXRjaGluZ0tleUJpbmRpbmdzWzBdLmtleXN0cm9rZXMpO1xuICB9IGVsc2Uge1xuICAgIGtleWJvYXJkU2hvcnRjdXQgPSAnJztcbiAgfVxuICByZXR1cm4ga2V5Ym9hcmRTaG9ydGN1dDtcbn1cblxuXG4vKipcbiAqIERpc21pc3NhYmxlIHBhbmVsIHRoYXQgZGlzcGxheXMgdGhlIGRpYWdub3N0aWNzIGZyb20gbnVjbGlkZS1kaWFnbm9zdGljcy1zdG9yZS5cbiAqL1xuY2xhc3MgRGlhZ25vc3RpY3NQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgZGlhZ25vc3RpY3M6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uRGlzbWlzczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvblJlc2l6ZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIHBhdGhUb0FjdGl2ZVRleHRFZGl0b3I6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgZmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG9uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHdhcm5BYm91dExpbnRlcjogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBkaXNhYmxlTGludGVyOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25GaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3JDaGFuZ2UgPVxuICAgICAgdGhpcy5fb25GaWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3JDaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldEhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ3BhbmVsJ10uZ2V0TGVuZ3RoKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgd2FybmluZ0NvdW50ID0gMDtcbiAgICBsZXQgZXJyb3JDb3VudCA9IDA7XG4gICAgbGV0IHtkaWFnbm9zdGljc30gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0aGlzLnByb3BzLmZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvciAmJiB0aGlzLnByb3BzLnBhdGhUb0FjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIGNvbnN0IHBhdGhUb0ZpbHRlckJ5ID0gdGhpcy5wcm9wcy5wYXRoVG9BY3RpdmVUZXh0RWRpdG9yO1xuICAgICAgZGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5maWx0ZXIoZGlhZ25vc3RpYyA9PiBkaWFnbm9zdGljLmZpbGVQYXRoID09PSBwYXRoVG9GaWx0ZXJCeSk7XG4gICAgfVxuICAgIGRpYWdub3N0aWNzLmZvckVhY2goZGlhZ25vc3RpYyA9PiB7XG4gICAgICBpZiAoZGlhZ25vc3RpYy50eXBlID09PSAnRXJyb3InKSB7XG4gICAgICAgICsrZXJyb3JDb3VudDtcbiAgICAgIH0gZWxzZSBpZiAoZGlhZ25vc3RpYy50eXBlID09PSAnV2FybmluZycpIHtcbiAgICAgICAgKyt3YXJuaW5nQ291bnQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBwYW5lbEhlaWdodCA9IHRoaXMucHJvcHMuaGVpZ2h0O1xuICAgIGNvbnN0IHBhbmVIZWlnaHQgPSBwYW5lbEhlaWdodCAtIFBBTkVMX0hFQURFUl9IRUlHSFRfSU5fUFggLSBSRVNJWkVfSEFORExFUl9IRUlHSFRfSU5fUFg7XG5cbiAgICBjb25zdCBzaG9ydGN1dCA9IGdldEtleWJvYXJkU2hvcnRjdXQoKTtcbiAgICBsZXQgc2hvcnRjdXRTcGFuID0gbnVsbDtcbiAgICBpZiAoc2hvcnRjdXQpIHtcbiAgICAgIHNob3J0Y3V0U3BhbiA9IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zdWJ0bGUgaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgVXNlIDxrYmQgY2xhc3NOYW1lPVwia2V5LWJpbmRpbmcga2V5LWJpbmRpbmctc20gdGV4dC1oaWdobGlnaHRcIj5cbiAgICAgICAgICB7Z2V0S2V5Ym9hcmRTaG9ydGN1dCgpfVxuICAgICAgICAgIDwva2JkPiB0byB0b2dnbGUgdGhpcyBwYW5lbC5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgbGludGVyV2FybmluZyA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJvcHMud2FybkFib3V0TGludGVyKSB7XG4gICAgICBsaW50ZXJXYXJuaW5nID0gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtcGFuZS1saW50ZXItd2FybmluZ1wiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgbnVjbGlkZS1kaWFnbm9zdGljcyBpcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBsaW50ZXIgcGFja2FnZS4gV2UgcmVjb21tZW5kIHRoYXRcbiAgICAgICAgICAgIHlvdSA8YSBvbkNsaWNrPXt0aGlzLnByb3BzLmRpc2FibGVMaW50ZXJ9PmRpc2FibGUgdGhlIGxpbnRlciBwYWNrYWdlPC9hPi4mbmJzcDtcbiAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwOi8vbnVjbGlkZS5pby9kb2NzL2FkdmFuY2VkLXRvcGljcy9saW50ZXItcGFja2FnZS1jb21wYXRpYmlsaXR5L1wiPlxuICAgICAgICAgICAgTGVhcm4gTW9yZTwvYT4uXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgZXJyb3JTcGFuQ2xhc3NOYW1lID0gYGlubGluZS1ibG9jayAke2Vycm9yQ291bnQgPiAwID8gJ3RleHQtZXJyb3InIDogJyd9YDtcbiAgICBjb25zdCB3YXJuaW5nU3BhbkNsYXNzTmFtZSA9IGBpbmxpbmUtYmxvY2sgJHt3YXJuaW5nQ291bnQgPiAwID8gJ3RleHQtd2FybmluZycgOiAnJ31gO1xuXG4gICAgLy8gV2UgaGlkZSB0aGUgaG9yaXpvbnRhbCBvdmVyZmxvdyBpbiB0aGUgUGFuZWxDb21wb25lbnQgYmVjYXVzZSB0aGUgcHJlc2VuY2Ugb2YgdGhlIHNjcm9sbGJhclxuICAgIC8vIHRocm93cyBvZmYgb3VyIGhlaWdodCBjYWxjdWxhdGlvbnMuXG4gICAgcmV0dXJuIChcbiAgICAgIDxQYW5lbENvbXBvbmVudFxuICAgICAgICByZWY9XCJwYW5lbFwiXG4gICAgICAgIGRvY2s9XCJib3R0b21cIlxuICAgICAgICBpbml0aWFsTGVuZ3RoPXtwYW5lbEhlaWdodH1cbiAgICAgICAgb25SZXNpemU9e3RoaXMucHJvcHMub25SZXNpemV9XG4gICAgICAgIG92ZXJmbG93WD1cImhpZGRlblwiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIHtsaW50ZXJXYXJuaW5nfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1wYW5lLW5hdlwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLXBhbmUtbmF2LWxlZnRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtlcnJvclNwYW5DbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgIEVycm9yczoge2Vycm9yQ291bnR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXt3YXJuaW5nU3BhbkNsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgV2FybmluZ3M6IHt3YXJuaW5nQ291bnR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5maWx0ZXJCeUFjdGl2ZVRleHRFZGl0b3J9XG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIlNob3cgb25seSBkaWFnbm9zdGljcyBmb3IgY3VycmVudCBmaWxlXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvckNoYW5nZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1wYW5lLW5hdi1yaWdodFwiPlxuICAgICAgICAgICAgICB7c2hvcnRjdXRTcGFufVxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkRpc21pc3N9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1zdWJ0bGUgYnRuLXNtIGljb24gaWNvbi14IGlubGluZS1ibG9ja1wiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJDbG9zZSBQYW5lbFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8RGlhZ25vc3RpY3NQYW5lXG4gICAgICAgICAgICBzaG93RmlsZU5hbWU9eyF0aGlzLnByb3BzLmZpbHRlckJ5QWN0aXZlVGV4dEVkaXRvcn1cbiAgICAgICAgICAgIGRpYWdub3N0aWNzPXtkaWFnbm9zdGljc31cbiAgICAgICAgICAgIGhlaWdodD17cGFuZUhlaWdodH1cbiAgICAgICAgICAgIHdpZHRoPXt0aGlzLnByb3BzLndpZHRofVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9QYW5lbENvbXBvbmVudD5cbiAgICApO1xuICB9XG5cbiAgX29uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlKGlzQ2hlY2tlZDogYm9vbGVhbikge1xuICAgIHRyYWNrKCdkaWFnbm9zdGljcy1wYW5lbC10b2dnbGUtY3VycmVudC1maWxlJywge2lzQ2hlY2tlZDogaXNDaGVja2VkLnRvU3RyaW5nKCl9KTtcbiAgICB0aGlzLnByb3BzLm9uRmlsdGVyQnlBY3RpdmVUZXh0RWRpdG9yQ2hhbmdlLmNhbGwobnVsbCwgaXNDaGVja2VkKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpYWdub3N0aWNzUGFuZWw7XG4iXX0=