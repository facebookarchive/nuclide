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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _reactForAtom = require('react-for-atom');

var _Button = require('./Button');

var _DiagnosticsMessageText = require('./DiagnosticsMessageText');

var _DiagnosticsTraceItem = require('./DiagnosticsTraceItem');

function plainTextForItem(item) {
  var _require = require('../../nuclide-remote-uri');

  var getPath = _require.getPath;

  var mainComponent = undefined;
  if (item.html != null) {
    // Quick and dirty way to get an approximation for the plain text from HTML.
    // This will work in simple cases, anyway.
    mainComponent = item.html.replace('<br/>', '\n').replace(/<[^>]*>/g, '');
  } else {
    (0, _assert2['default'])(item.text != null);
    mainComponent = item.text;
  }

  var pathComponent = undefined;
  if (item.filePath == null) {
    pathComponent = '';
  } else {
    var lineComponent = item.range != null ? ':' + (item.range.start.row + 1) : '';
    pathComponent = ': ' + getPath(item.filePath) + lineComponent;
  }
  return mainComponent + pathComponent;
}

function plainTextForDiagnostic(message) {
  var trace = message.trace != null ? message.trace : [];
  return [message].concat(_toConsumableArray(trace)).map(plainTextForItem).join('\n');
}

/**
 * Visually groups Buttons passed in as children.
 */
var DiagnosticsMessage = function DiagnosticsMessage(props) {
  var message = props.message;
  var goToLocation = props.goToLocation;
  var fixer = props.fixer;

  var providerClassName = message.type === 'Error' ? 'highlight-error' : 'highlight-warning';
  var copy = function copy() {
    var text = plainTextForDiagnostic(message);
    atom.clipboard.write(text);
  };
  var fixButton = null;
  if (message.fix != null) {
    var applyFix = function applyFix() {
      fixer(message);
    };
    fixButton = _reactForAtom.React.createElement(
      _Button.Button,
      { size: 'EXTRA_SMALL', onClick: applyFix },
      'Fix'
    );
  }
  var header = _reactForAtom.React.createElement(
    'div',
    { className: 'nuclide-diagnostics-gutter-ui-popup-header' },
    fixButton,
    _reactForAtom.React.createElement(
      _Button.Button,
      { size: 'EXTRA_SMALL', onClick: copy },
      'Copy'
    ),
    _reactForAtom.React.createElement(
      'span',
      { className: 'pull-right ' + providerClassName },
      message.providerName
    )
  );
  var traceElements = message.trace ? message.trace.map(function (traceItem, i) {
    return _reactForAtom.React.createElement(_DiagnosticsTraceItem.DiagnosticsTraceItem, {
      key: i,
      trace: traceItem,
      goToLocation: goToLocation
    });
  }) : null;
  return _reactForAtom.React.createElement(
    'div',
    null,
    header,
    _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessageText.DiagnosticsMessageText, { message: message })
    ),
    traceElements
  );
};
exports.DiagnosticsMessage = DiagnosticsMessage;
//# sourceMappingURL=data:application/json;base64,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a0JBQWdCLGlCQUFpQixBQUFHO01BQUUsT0FBTyxDQUFDLFlBQVk7S0FBUTtHQUM3RSxBQUNQLENBQUM7QUFDRixNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsS0FBSyxHQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLFNBQVMsRUFBRSxDQUFDO1dBQy9CO0FBQ0UsU0FBRyxFQUFFLENBQUMsQUFBQztBQUNQLFdBQUssRUFBRSxTQUFTLEFBQUM7QUFDakIsa0JBQVksRUFBRSxZQUFZLEFBQUM7TUFDM0I7R0FBQSxDQUNILEdBQ0MsSUFBSSxDQUFDO0FBQ1QsU0FDRTs7O0lBQ0csTUFBTTtJQUNQOzs7TUFDRSxvRkFBd0IsT0FBTyxFQUFFLE9BQU8sQUFBQyxHQUFHO0tBQ3hDO0lBQ0wsYUFBYTtHQUNWLENBQ047Q0FDSCxDQUFDIiwiZmlsZSI6IkRpYWdub3N0aWNzTWVzc2FnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBUcmFjZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1iYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCdXR0b259IGZyb20gJy4vQnV0dG9uJztcbmltcG9ydCB7RGlhZ25vc3RpY3NNZXNzYWdlVGV4dH0gZnJvbSAnLi9EaWFnbm9zdGljc01lc3NhZ2VUZXh0JztcbmltcG9ydCB7RGlhZ25vc3RpY3NUcmFjZUl0ZW19IGZyb20gJy4vRGlhZ25vc3RpY3NUcmFjZUl0ZW0nO1xuXG50eXBlIERpYWdub3N0aWNzTWVzc2FnZVByb3BzID0ge1xuICBtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2U7XG4gIGdvVG9Mb2NhdGlvbjogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiBtaXhlZDtcbiAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQ7XG59O1xuXG5mdW5jdGlvbiBwbGFpblRleHRGb3JJdGVtKGl0ZW06IEZpbGVEaWFnbm9zdGljTWVzc2FnZSB8IFRyYWNlKTogc3RyaW5nIHtcbiAgY29uc3Qge2dldFBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG4gIGxldCBtYWluQ29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICBpZiAoaXRlbS5odG1sICE9IG51bGwpIHtcbiAgICAvLyBRdWljayBhbmQgZGlydHkgd2F5IHRvIGdldCBhbiBhcHByb3hpbWF0aW9uIGZvciB0aGUgcGxhaW4gdGV4dCBmcm9tIEhUTUwuXG4gICAgLy8gVGhpcyB3aWxsIHdvcmsgaW4gc2ltcGxlIGNhc2VzLCBhbnl3YXkuXG4gICAgbWFpbkNvbXBvbmVudCA9IGl0ZW0uaHRtbC5yZXBsYWNlKCc8YnIvPicsICdcXG4nKS5yZXBsYWNlKC88W14+XSo+L2csICcnKTtcbiAgfSBlbHNlIHtcbiAgICBpbnZhcmlhbnQoaXRlbS50ZXh0ICE9IG51bGwpO1xuICAgIG1haW5Db21wb25lbnQgPSBpdGVtLnRleHQ7XG4gIH1cblxuICBsZXQgcGF0aENvbXBvbmVudDtcbiAgaWYgKGl0ZW0uZmlsZVBhdGggPT0gbnVsbCkge1xuICAgIHBhdGhDb21wb25lbnQgPSAnJztcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBsaW5lQ29tcG9uZW50ID0gaXRlbS5yYW5nZSAhPSBudWxsID8gYDoke2l0ZW0ucmFuZ2Uuc3RhcnQucm93ICsgMX1gIDogJyc7XG4gICAgcGF0aENvbXBvbmVudCA9ICc6ICcgKyBnZXRQYXRoKGl0ZW0uZmlsZVBhdGgpICsgbGluZUNvbXBvbmVudDtcbiAgfVxuICByZXR1cm4gbWFpbkNvbXBvbmVudCArIHBhdGhDb21wb25lbnQ7XG59XG5cbmZ1bmN0aW9uIHBsYWluVGV4dEZvckRpYWdub3N0aWMobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgY29uc3QgdHJhY2UgPSBtZXNzYWdlLnRyYWNlICE9IG51bGwgPyBtZXNzYWdlLnRyYWNlIDogW107XG4gIHJldHVybiBbbWVzc2FnZSwgLi4udHJhY2VdLm1hcChwbGFpblRleHRGb3JJdGVtKS5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBWaXN1YWxseSBncm91cHMgQnV0dG9ucyBwYXNzZWQgaW4gYXMgY2hpbGRyZW4uXG4gKi9cbmV4cG9ydCBjb25zdCBEaWFnbm9zdGljc01lc3NhZ2UgPSAocHJvcHM6IERpYWdub3N0aWNzTWVzc2FnZVByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBnb1RvTG9jYXRpb24sXG4gICAgICBmaXhlcixcbiAgfSA9IHByb3BzO1xuICBjb25zdCBwcm92aWRlckNsYXNzTmFtZSA9IG1lc3NhZ2UudHlwZSA9PT0gJ0Vycm9yJ1xuICAgID8gJ2hpZ2hsaWdodC1lcnJvcidcbiAgICA6ICdoaWdobGlnaHQtd2FybmluZyc7XG4gIGNvbnN0IGNvcHkgPSAoKSA9PiB7XG4gICAgY29uc3QgdGV4dCA9IHBsYWluVGV4dEZvckRpYWdub3N0aWMobWVzc2FnZSk7XG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dCk7XG4gIH07XG4gIGxldCBmaXhCdXR0b24gPSBudWxsO1xuICBpZiAobWVzc2FnZS5maXggIT0gbnVsbCkge1xuICAgIGNvbnN0IGFwcGx5Rml4ID0gKCkgPT4ge1xuICAgICAgZml4ZXIobWVzc2FnZSk7XG4gICAgfTtcbiAgICBmaXhCdXR0b24gPSAoXG4gICAgICA8QnV0dG9uIHNpemU9XCJFWFRSQV9TTUFMTFwiIG9uQ2xpY2s9e2FwcGx5Rml4fT5GaXg8L0J1dHRvbj5cbiAgICApO1xuICB9XG4gIGNvbnN0IGhlYWRlciA9IChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwLWhlYWRlclwiPlxuICAgICAge2ZpeEJ1dHRvbn1cbiAgICAgIDxCdXR0b24gc2l6ZT1cIkVYVFJBX1NNQUxMXCIgb25DbGljaz17Y29weX0+Q29weTwvQnV0dG9uPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgcHVsbC1yaWdodCAke3Byb3ZpZGVyQ2xhc3NOYW1lfWB9PnttZXNzYWdlLnByb3ZpZGVyTmFtZX08L3NwYW4+XG4gICAgPC9kaXY+XG4gICk7XG4gIGNvbnN0IHRyYWNlRWxlbWVudHMgPSBtZXNzYWdlLnRyYWNlXG4gICAgPyBtZXNzYWdlLnRyYWNlLm1hcCgodHJhY2VJdGVtLCBpKSA9PlxuICAgICAgPERpYWdub3N0aWNzVHJhY2VJdGVtXG4gICAgICAgIGtleT17aX1cbiAgICAgICAgdHJhY2U9e3RyYWNlSXRlbX1cbiAgICAgICAgZ29Ub0xvY2F0aW9uPXtnb1RvTG9jYXRpb259XG4gICAgICAvPlxuICAgIClcbiAgICA6IG51bGw7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtoZWFkZXJ9XG4gICAgICA8ZGl2PlxuICAgICAgICA8RGlhZ25vc3RpY3NNZXNzYWdlVGV4dCBtZXNzYWdlPXttZXNzYWdlfSAvPlxuICAgICAgPC9kaXY+XG4gICAgICB7dHJhY2VFbGVtZW50c31cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG4iXX0=