Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _nuclideUiLibDiagnosticsMessage = require('../../nuclide-ui/lib/DiagnosticsMessage');

function renderMessage(fixer, goToLocation, message, index) {
  var className = (0, _classnames2['default'])(
  // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
  'native-key-bindings', 'nuclide-diagnostics-gutter-ui-popup-diagnostic', {
    'nuclide-diagnostics-gutter-ui-popup-error': message.type === 'Error',
    'nuclide-diagnostics-gutter-ui-popup-warning': message.type !== 'Error'
  });
  return _reactForAtom.React.createElement(
    'div',
    { className: className, key: index, tabIndex: -1 },
    _reactForAtom.React.createElement(_nuclideUiLibDiagnosticsMessage.DiagnosticsMessage, {
      fixer: fixer,
      goToLocation: goToLocation,
      key: index,
      message: message
    })
  );
}

// TODO move LESS styles to nuclide-ui
var DiagnosticsPopup = function DiagnosticsPopup(props) {
  var fixer = props.fixer;
  var goToLocation = props.goToLocation;
  var left = props.left;
  var messages = props.messages;
  var top = props.top;

  var rest = _objectWithoutProperties(props, ['fixer', 'goToLocation', 'left', 'messages', 'top']);

  return _reactForAtom.React.createElement(
    'div',
    _extends({
      className: 'nuclide-diagnostics-gutter-ui-popup',
      style: {
        left: left,
        top: top
      }
    }, rest),
    messages.map(renderMessage.bind(null, fixer, goToLocation))
  );
};
exports.DiagnosticsPopup = DiagnosticsPopup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNzUG9wdXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWdCb0IsZ0JBQWdCOzswQkFDYixZQUFZOzs7OzhDQUNGLHlDQUF5Qzs7QUFVMUUsU0FBUyxhQUFhLENBQ3BCLEtBQStDLEVBQy9DLFlBQTJELEVBQzNELE9BQThCLEVBQzlCLEtBQWEsRUFDRTtBQUNmLE1BQU0sU0FBUyxHQUFHOztBQUVoQix1QkFBcUIsRUFDckIsZ0RBQWdELEVBQ2hEO0FBQ0UsK0NBQTJDLEVBQUUsT0FBTyxDQUFDLElBQUksS0FBSyxPQUFPO0FBQ3JFLGlEQUE2QyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEtBQUssT0FBTztHQUN4RSxDQUNGLENBQUM7QUFDRixTQUNFOztNQUFLLFNBQVMsRUFBRSxTQUFTLEFBQUMsRUFBQyxHQUFHLEVBQUUsS0FBSyxBQUFDLEVBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxBQUFDO0lBQ2xEO0FBQ0UsV0FBSyxFQUFFLEtBQUssQUFBQztBQUNiLGtCQUFZLEVBQUUsWUFBWSxBQUFDO0FBQzNCLFNBQUcsRUFBRSxLQUFLLEFBQUM7QUFDWCxhQUFPLEVBQUUsT0FBTyxBQUFDO01BQ2pCO0dBQ0UsQ0FDTjtDQUNIOzs7QUFHTSxJQUFNLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixDQUFJLEtBQUssRUFBNEI7TUFFOUQsS0FBSyxHQU1ILEtBQUssQ0FOUCxLQUFLO01BQ0wsWUFBWSxHQUtWLEtBQUssQ0FMUCxZQUFZO01BQ1osSUFBSSxHQUlGLEtBQUssQ0FKUCxJQUFJO01BQ0osUUFBUSxHQUdOLEtBQUssQ0FIUCxRQUFRO01BQ1IsR0FBRyxHQUVELEtBQUssQ0FGUCxHQUFHOztNQUNBLElBQUksNEJBQ0wsS0FBSzs7QUFDVCxTQUNFOzs7QUFDRSxlQUFTLEVBQUMscUNBQXFDO0FBQy9DLFdBQUssRUFBRTtBQUNMLFlBQUksRUFBSixJQUFJO0FBQ0osV0FBRyxFQUFILEdBQUc7T0FDSixBQUFDO09BQ0UsSUFBSTtJQUNQLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0dBQ3hELENBQ047Q0FDSCxDQUFDIiwiZmlsZSI6IkRpYWdub3N0aWNzUG9wdXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1iYXNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7RGlhZ25vc3RpY3NNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9EaWFnbm9zdGljc01lc3NhZ2UnO1xuXG50eXBlIERpYWdub3N0aWNzUG9wdXBQcm9wcyA9IHtcbiAgbWVzc2FnZXM6IEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT47XG4gIGdvVG9Mb2NhdGlvbjogKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCBsaW5lOiBudW1iZXIpID0+IG1peGVkO1xuICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZDtcbiAgbGVmdDogbnVtYmVyO1xuICB0b3A6IG51bWJlcjtcbn07XG5cbmZ1bmN0aW9uIHJlbmRlck1lc3NhZ2UoXG4gIGZpeGVyOiAobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKSA9PiB2b2lkLFxuICBnb1RvTG9jYXRpb246IChmaWxlUGF0aDogTnVjbGlkZVVyaSwgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbiAgbWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBpbmRleDogbnVtYmVyXG4pOiBSZWFjdC5FbGVtZW50IHtcbiAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NuYW1lcyhcbiAgICAvLyBuYXRpdmUta2V5LWJpbmRpbmdzIGFuZCB0YWJJbmRleD0tMSBhcmUgYm90aCBuZWVkZWQgdG8gYWxsb3cgY29weWluZyB0aGUgdGV4dCBpbiB0aGUgcG9wdXAuXG4gICAgJ25hdGl2ZS1rZXktYmluZGluZ3MnLFxuICAgICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cC1kaWFnbm9zdGljJyxcbiAgICB7XG4gICAgICAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtZXJyb3InOiBtZXNzYWdlLnR5cGUgPT09ICdFcnJvcicsXG4gICAgICAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtd2FybmluZyc6IG1lc3NhZ2UudHlwZSAhPT0gJ0Vycm9yJyxcbiAgICB9XG4gICk7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZX0ga2V5PXtpbmRleH0gdGFiSW5kZXg9ey0xfT5cbiAgICAgIDxEaWFnbm9zdGljc01lc3NhZ2VcbiAgICAgICAgZml4ZXI9e2ZpeGVyfVxuICAgICAgICBnb1RvTG9jYXRpb249e2dvVG9Mb2NhdGlvbn1cbiAgICAgICAga2V5PXtpbmRleH1cbiAgICAgICAgbWVzc2FnZT17bWVzc2FnZX1cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbi8vIFRPRE8gbW92ZSBMRVNTIHN0eWxlcyB0byBudWNsaWRlLXVpXG5leHBvcnQgY29uc3QgRGlhZ25vc3RpY3NQb3B1cCA9IChwcm9wczogRGlhZ25vc3RpY3NQb3B1cFByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBmaXhlcixcbiAgICBnb1RvTG9jYXRpb24sXG4gICAgbGVmdCxcbiAgICBtZXNzYWdlcyxcbiAgICB0b3AsXG4gICAgLi4ucmVzdCxcbiAgfSA9IHByb3BzO1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwXCJcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGxlZnQsXG4gICAgICAgIHRvcCxcbiAgICAgIH19XG4gICAgICB7Li4ucmVzdH0+XG4gICAgICB7bWVzc2FnZXMubWFwKHJlbmRlck1lc3NhZ2UuYmluZChudWxsLCBmaXhlciwgZ29Ub0xvY2F0aW9uKSl9XG4gICAgPC9kaXY+XG4gICk7XG59O1xuIl19