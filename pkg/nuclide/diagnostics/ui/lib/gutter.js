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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.applyUpdateToEditor = applyUpdateToEditor;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _require = require('../../../analytics');

var track = _require.track;

var _require2 = require('react-for-atom');

var React = _require2.React;
var ReactDOM = _require2.ReactDOM;
var PropTypes = React.PropTypes;

var GUTTER_ID = 'nuclide-diagnostics-gutter';

// Needs to be the same as glyph-height in gutter.atom-text-editor.less.
var GLYPH_HEIGHT = 15; // px

var POPUP_DISPOSE_TIMEOUT = 100;

// TODO(mbolin): Make it so that when mousing over an element with this CSS class (or specifically,
// the child element with the "region" CSS class), we also do a showPopupFor(). This seems to be
// tricky given how the DOM of a TextEditor works today. There are div.tile elements, each of which
// has its own div.highlights element and many div.line elements. The div.highlights element has 0
// or more children, each child being a div.highlight with a child div.region. The div.region
// element is defined to be {position: absolute; pointer-events: none; z-index: -1}. The absolute
// positioning and negative z-index make it so it isn't eligible for mouseover events, so we
// might have to listen for mouseover events on TextEditor and then use its own APIs, such as
// decorationsForScreenRowRange(), to see if there is a hit target instead. Since this will be
// happening onmousemove, we also have to be careful to make sure this is not expensive.
var HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight';

var ERROR_HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight-error';
var WARNING_HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight-warning';

var ERROR_GUTTER_CSS = 'nuclide-diagnostics-gutter-ui-gutter-error';
var WARNING_GUTTER_CSS = 'nuclide-diagnostics-gutter-ui-gutter-warning';

var editorToMarkers = new WeakMap();
var itemToEditor = new WeakMap();

function applyUpdateToEditor(editor, update, fixer) {
  var gutter = editor.gutterWithName(GUTTER_ID);
  if (!gutter) {
    // TODO(jessicalin): Determine an appropriate priority so that the gutter:
    // (1) Shows up to the right of the line numbers.
    // (2) Shows the items that are added to it right away.
    // Using a value of 10 fixes (1), but breaks (2). This seems like it is likely a bug in Atom.

    // By default, a gutter will be destroyed when its editor is destroyed,
    // so there is no need to register a callback via onDidDestroy().
    gutter = editor.addGutter({
      name: GUTTER_ID,
      visible: false
    });
  }

  var marker = undefined;
  var markers = editorToMarkers.get(editor);

  // TODO: Consider a more efficient strategy that does not blindly destroy all of the
  // existing markers.
  if (markers) {
    for (marker of markers) {
      marker.destroy();
    }
    markers.clear();
  } else {
    markers = new Set();
  }

  var rowToMessage = new Map();
  function addMessageForRow(message, row) {
    var messages = rowToMessage.get(row);
    if (!messages) {
      messages = [];
      rowToMessage.set(row, messages);
    }
    messages.push(message);
  }

  for (var _message of update.messages) {
    var range = _message.range;
    var highlightMarker = undefined;
    if (range) {
      addMessageForRow(_message, range.start.row);
      highlightMarker = editor.markBufferRange(range);
    } else {
      addMessageForRow(_message, 0);
    }

    var highlightCssClass = undefined;
    if (_message.type === 'Error') {
      highlightCssClass = HIGHLIGHT_CSS + ' ' + ERROR_HIGHLIGHT_CSS;
    } else {
      highlightCssClass = HIGHLIGHT_CSS + ' ' + WARNING_HIGHLIGHT_CSS;
    }

    // This marker underlines text.
    if (highlightMarker) {
      editor.decorateMarker(highlightMarker, {
        type: 'highlight',
        'class': highlightCssClass
      });
      markers.add(highlightMarker);
    }
  }

  // Find all of the gutter markers for the same row and combine them into one marker/popup.
  for (var _ref3 of rowToMessage.entries()) {
    var _ref2 = _slicedToArray(_ref3, 2);

    var row = _ref2[0];
    var messages = _ref2[1];

    // If at least one of the diagnostics is an error rather than the warning,
    // display the glyph in the gutter to represent an error rather than a warning.
    var gutterMarkerCssClass = messages.some(function (msg) {
      return msg.type === 'Error';
    }) ? ERROR_GUTTER_CSS : WARNING_GUTTER_CSS;

    // This marker adds some UI to the gutter.

    var _createGutterItem = createGutterItem(messages, gutterMarkerCssClass, fixer);

    var item = _createGutterItem.item;
    var dispose = _createGutterItem.dispose;

    itemToEditor.set(item, editor);
    var gutterMarker = editor.markBufferPosition([row, 0]);
    gutter.decorateMarker(gutterMarker, { item: item });
    gutterMarker.onDidDestroy(dispose);
    markers.add(gutterMarker);
  }

  editorToMarkers.set(editor, markers);

  // Once the gutter is shown for the first time, it is displayed for the lifetime of the
  // TextEditor.
  if (update.messages.length > 0) {
    gutter.show();
  }
}

function createGutterItem(messages, gutterMarkerCssClass, fixer) {
  var item = window.document.createElement('span');
  item.innerText = '▶'; // Unicode character for a right-pointing triangle.
  item.className = gutterMarkerCssClass;
  var popupElement = null;
  var paneItemSubscription = null;
  var disposeTimeout = null;
  var clearDisposeTimeout = function clearDisposeTimeout() {
    if (disposeTimeout) {
      clearTimeout(disposeTimeout);
    }
  };
  var dispose = function dispose() {
    if (popupElement) {
      ReactDOM.unmountComponentAtNode(popupElement);
      popupElement.parentNode.removeChild(popupElement);
      popupElement = null;
    }
    if (paneItemSubscription) {
      paneItemSubscription.dispose();
      paneItemSubscription = null;
    }
    clearDisposeTimeout();
  };
  var goToLocation = function goToLocation(path, line) {
    // Before we jump to the location, we want to close the popup.
    dispose();
    var options = {
      searchAllPanes: true,
      initialLine: line
    };
    atom.workspace.open(path, options);
  };
  item.addEventListener('mouseenter', function (event) {
    // If there was somehow another popup for this gutter item, dispose it. This can happen if the
    // user manages to scroll and escape disposal.
    dispose();
    popupElement = showPopupFor(messages, item, goToLocation, fixer);
    popupElement.addEventListener('mouseleave', dispose);
    popupElement.addEventListener('mouseenter', clearDisposeTimeout);
    // This makes sure that the popup disappears when you ctrl+tab to switch tabs.
    paneItemSubscription = atom.workspace.onDidChangeActivePaneItem(dispose);
  });
  item.addEventListener('mouseleave', function (event) {
    // When the popup is shown, we want to dispose it if the user manages to move the cursor off of
    // the gutter glyph without moving it onto the popup. Even though the popup appears above (as in
    // Z-index above) the gutter glyph, if you move the cursor such that it is only above the glyph
    // for one frame you can cause the popup to appear without the mouse ever entering it.
    disposeTimeout = setTimeout(dispose, POPUP_DISPOSE_TIMEOUT);
  });
  return { item: item, dispose: dispose };
}

/**
 * Shows a popup for the diagnostic just below the specified item.
 */
function showPopupFor(messages, item, goToLocation, fixer) {
  var children = messages.map(function (message) {
    var contents = createElementForMessage(message, goToLocation, fixer);
    var diagnosticTypeClass = message.type === 'Error' ? 'nuclide-diagnostics-gutter-ui-popup-error' : 'nuclide-diagnostics-gutter-ui-popup-warning';
    // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
    var classes = 'native-key-bindings nuclide-diagnostics-gutter-ui-popup-diagnostic ' + diagnosticTypeClass;
    return React.createElement(
      'div',
      { tabIndex: -1, className: classes },
      contents
    );
  });
  // The popup will be an absolutely positioned child element of <atom-workspace> so that it appears
  // on top of everything.
  var workspaceElement = atom.views.getView(atom.workspace);
  var hostElement = window.document.createElement('div');
  workspaceElement.parentNode.appendChild(hostElement);

  // Move it down vertically so it does not end up under the mouse pointer.

  var _item$getBoundingClientRect = item.getBoundingClientRect();

  var top = _item$getBoundingClientRect.top;
  var left = _item$getBoundingClientRect.left;

  ReactDOM.render(React.createElement(
    DiagnosticsPopup,
    { left: left, top: top },
    children
  ), hostElement);

  // Check to see whether the popup is within the bounds of the TextEditor. If not, display it above
  // the glyph rather than below it.
  var editor = itemToEditor.get(item);
  var editorElement = atom.views.getView(editor);

  var _editorElement$getBoundingClientRect = editorElement.getBoundingClientRect();

  var editorTop = _editorElement$getBoundingClientRect.top;
  var editorHeight = _editorElement$getBoundingClientRect.height;

  var _item$getBoundingClientRect2 = item.getBoundingClientRect();

  var itemTop = _item$getBoundingClientRect2.top;
  var itemHeight = _item$getBoundingClientRect2.height;

  var popupHeight = hostElement.firstElementChild.clientHeight;
  if (itemTop + itemHeight + popupHeight > editorTop + editorHeight) {
    var popupElement = hostElement.firstElementChild;
    // Shift the popup back down by GLYPH_HEIGHT, so that the bottom padding overlaps with the
    // glyph. An additional 4 px is needed to make it look the same way it does when it shows up
    // below. I don't know why.
    popupElement.style.top = String(itemTop - popupHeight + GLYPH_HEIGHT + 4) + 'px';
  }

  try {
    return hostElement;
  } finally {
    messages.forEach(function (message) {
      track('diagnostics-gutter-show-popup', {
        'diagnostics-provider': message.providerName,
        'diagnostics-message': message.text || message.html || ''
      });
    });
  }
}

function createElementForMessage(message, goToLocation, fixer) {
  var providerClassName = message.type === 'Error' ? 'highlight-error' : 'highlight-warning';
  var copy = function copy() {
    var text = plainTextForDiagnostic(message);
    atom.clipboard.write(text);
  };
  var fixButton = null;
  if (message.fix != null) {
    var applyFix = fixer.bind(null, message);
    fixButton = React.createElement(
      'button',
      { className: 'btn btn-xs', onClick: applyFix },
      'Fix'
    );
  }
  var header = React.createElement(
    'div',
    { className: 'nuclide-diagnostics-gutter-ui-popup-header' },
    fixButton,
    React.createElement(
      'button',
      { className: 'btn btn-xs', onClick: copy },
      'Copy'
    ),
    React.createElement(
      'span',
      { className: 'pull-right ' + providerClassName },
      message.providerName
    )
  );
  var traceElements = message.trace ? message.trace.map(function (traceItem) {
    return createElementForTrace(traceItem, goToLocation);
  }) : null;
  return React.createElement(
    'div',
    null,
    header,
    React.createElement(
      'div',
      null,
      createMessageSpan(message)
    ),
    traceElements
  );
}

function plainTextForDiagnostic(message) {
  var _require3 = require('../../../remote-uri');

  var getPath = _require3.getPath;

  function plainTextForItem(item) {
    var mainComponent = undefined;
    if (item.html != null) {
      // Quick and dirty way to get an approximation for the plain text from HTML. This will work in
      // simple cases, anyway.
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
  var trace = message.trace != null ? message.trace : [];
  return [message].concat(_toConsumableArray(trace)).map(plainTextForItem).join('\n');
}

function createElementForTrace(trace, goToLocation) {
  var locSpan = null;
  // Local variable so that the type refinement holds in the onClick handler.
  var path = trace.filePath;
  if (path) {
    var _atom$project$relativizePath = atom.project.relativizePath(path);

    var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 2);

    var relativePath = _atom$project$relativizePath2[1];

    var locString = relativePath;
    if (trace.range) {
      locString += ':' + (trace.range.start.row + 1);
    }
    var onClick = function onClick() {
      track('diagnostics-gutter-goto-location');
      goToLocation(path, Math.max(trace.range ? trace.range.start.row : 0, 0));
    };
    locSpan = React.createElement(
      'span',
      null,
      ': ',
      React.createElement(
        'a',
        { href: '#', onClick: onClick },
        locString
      )
    );
  }
  return React.createElement(
    'div',
    null,
    createMessageSpan(trace),
    locSpan
  );
}

function createMessageSpan(message) {
  if (message.html != null) {
    return React.createElement('span', { dangerouslySetInnerHTML: { __html: message.html } });
  } else if (message.text != null) {
    return React.createElement(
      'span',
      null,
      message.text
    );
  } else {
    return React.createElement(
      'span',
      null,
      'Diagnostic lacks message.'
    );
  }
}

var DiagnosticsPopup = (function (_React$Component) {
  _inherits(DiagnosticsPopup, _React$Component);

  function DiagnosticsPopup() {
    _classCallCheck(this, DiagnosticsPopup);

    _get(Object.getPrototypeOf(DiagnosticsPopup.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiagnosticsPopup, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        {
          className: 'nuclide-diagnostics-gutter-ui-popup',
          style: { left: this.props.left + 'px', top: this.props.top + 'px' }
        },
        this.props.children
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      children: PropTypes.node,
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired
    },
    enumerable: true
  }]);

  return DiagnosticsPopup;
})(React.Component);
//# sourceMappingURL=data:application/json;base64,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akUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRO09BQ2hCLENBQ047S0FDSDs7O1dBZmtCO0FBQ2pCLGNBQVEsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUN4QixVQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLFNBQUcsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7S0FDakM7Ozs7U0FMRyxnQkFBZ0I7R0FBUyxLQUFLLENBQUMsU0FBUyIsImZpbGUiOiJndXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVNZXNzYWdlVXBkYXRlLFxuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIFRyYWNlLFxufSBmcm9tICcuLi8uLi9iYXNlJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi8uLi9hbmFseXRpY3MnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBHVVRURVJfSUQgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXInO1xuXG4vLyBOZWVkcyB0byBiZSB0aGUgc2FtZSBhcyBnbHlwaC1oZWlnaHQgaW4gZ3V0dGVyLmF0b20tdGV4dC1lZGl0b3IubGVzcy5cbmNvbnN0IEdMWVBIX0hFSUdIVCA9IDE1OyAvLyBweFxuXG5jb25zdCBQT1BVUF9ESVNQT1NFX1RJTUVPVVQgPSAxMDA7XG5cbi8vIFRPRE8obWJvbGluKTogTWFrZSBpdCBzbyB0aGF0IHdoZW4gbW91c2luZyBvdmVyIGFuIGVsZW1lbnQgd2l0aCB0aGlzIENTUyBjbGFzcyAob3Igc3BlY2lmaWNhbGx5LFxuLy8gdGhlIGNoaWxkIGVsZW1lbnQgd2l0aCB0aGUgXCJyZWdpb25cIiBDU1MgY2xhc3MpLCB3ZSBhbHNvIGRvIGEgc2hvd1BvcHVwRm9yKCkuIFRoaXMgc2VlbXMgdG8gYmVcbi8vIHRyaWNreSBnaXZlbiBob3cgdGhlIERPTSBvZiBhIFRleHRFZGl0b3Igd29ya3MgdG9kYXkuIFRoZXJlIGFyZSBkaXYudGlsZSBlbGVtZW50cywgZWFjaCBvZiB3aGljaFxuLy8gaGFzIGl0cyBvd24gZGl2LmhpZ2hsaWdodHMgZWxlbWVudCBhbmQgbWFueSBkaXYubGluZSBlbGVtZW50cy4gVGhlIGRpdi5oaWdobGlnaHRzIGVsZW1lbnQgaGFzIDBcbi8vIG9yIG1vcmUgY2hpbGRyZW4sIGVhY2ggY2hpbGQgYmVpbmcgYSBkaXYuaGlnaGxpZ2h0IHdpdGggYSBjaGlsZCBkaXYucmVnaW9uLiBUaGUgZGl2LnJlZ2lvblxuLy8gZWxlbWVudCBpcyBkZWZpbmVkIHRvIGJlIHtwb3NpdGlvbjogYWJzb2x1dGU7IHBvaW50ZXItZXZlbnRzOiBub25lOyB6LWluZGV4OiAtMX0uIFRoZSBhYnNvbHV0ZVxuLy8gcG9zaXRpb25pbmcgYW5kIG5lZ2F0aXZlIHotaW5kZXggbWFrZSBpdCBzbyBpdCBpc24ndCBlbGlnaWJsZSBmb3IgbW91c2VvdmVyIGV2ZW50cywgc28gd2Vcbi8vIG1pZ2h0IGhhdmUgdG8gbGlzdGVuIGZvciBtb3VzZW92ZXIgZXZlbnRzIG9uIFRleHRFZGl0b3IgYW5kIHRoZW4gdXNlIGl0cyBvd24gQVBJcywgc3VjaCBhc1xuLy8gZGVjb3JhdGlvbnNGb3JTY3JlZW5Sb3dSYW5nZSgpLCB0byBzZWUgaWYgdGhlcmUgaXMgYSBoaXQgdGFyZ2V0IGluc3RlYWQuIFNpbmNlIHRoaXMgd2lsbCBiZVxuLy8gaGFwcGVuaW5nIG9ubW91c2Vtb3ZlLCB3ZSBhbHNvIGhhdmUgdG8gYmUgY2FyZWZ1bCB0byBtYWtlIHN1cmUgdGhpcyBpcyBub3QgZXhwZW5zaXZlLlxuY29uc3QgSElHSExJR0hUX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1oaWdobGlnaHQnO1xuXG5jb25zdCBFUlJPUl9ISUdITElHSFRfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWhpZ2hsaWdodC1lcnJvcic7XG5jb25zdCBXQVJOSU5HX0hJR0hMSUdIVF9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktaGlnaGxpZ2h0LXdhcm5pbmcnO1xuXG5jb25zdCBFUlJPUl9HVVRURVJfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWd1dHRlci1lcnJvcic7XG5jb25zdCBXQVJOSU5HX0dVVFRFUl9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktZ3V0dGVyLXdhcm5pbmcnO1xuXG5jb25zdCBlZGl0b3JUb01hcmtlcnM6IFdlYWtNYXA8VGV4dEVkaXRvciwgU2V0PGF0b20kTWFya2VyPj4gPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgaXRlbVRvRWRpdG9yOiBXZWFrTWFwPEhUTUxFbGVtZW50LCBUZXh0RWRpdG9yPiA9IG5ldyBXZWFrTWFwKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVVwZGF0ZVRvRWRpdG9yKFxuICBlZGl0b3I6IFRleHRFZGl0b3IsXG4gIHVwZGF0ZTogRmlsZU1lc3NhZ2VVcGRhdGUsXG4gIGZpeGVyOiAobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKSA9PiB2b2lkLFxuKTogdm9pZCB7XG4gIGxldCBndXR0ZXIgPSBlZGl0b3IuZ3V0dGVyV2l0aE5hbWUoR1VUVEVSX0lEKTtcbiAgaWYgKCFndXR0ZXIpIHtcbiAgICAvLyBUT0RPKGplc3NpY2FsaW4pOiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgcHJpb3JpdHkgc28gdGhhdCB0aGUgZ3V0dGVyOlxuICAgIC8vICgxKSBTaG93cyB1cCB0byB0aGUgcmlnaHQgb2YgdGhlIGxpbmUgbnVtYmVycy5cbiAgICAvLyAoMikgU2hvd3MgdGhlIGl0ZW1zIHRoYXQgYXJlIGFkZGVkIHRvIGl0IHJpZ2h0IGF3YXkuXG4gICAgLy8gVXNpbmcgYSB2YWx1ZSBvZiAxMCBmaXhlcyAoMSksIGJ1dCBicmVha3MgKDIpLiBUaGlzIHNlZW1zIGxpa2UgaXQgaXMgbGlrZWx5IGEgYnVnIGluIEF0b20uXG5cbiAgICAvLyBCeSBkZWZhdWx0LCBhIGd1dHRlciB3aWxsIGJlIGRlc3Ryb3llZCB3aGVuIGl0cyBlZGl0b3IgaXMgZGVzdHJveWVkLFxuICAgIC8vIHNvIHRoZXJlIGlzIG5vIG5lZWQgdG8gcmVnaXN0ZXIgYSBjYWxsYmFjayB2aWEgb25EaWREZXN0cm95KCkuXG4gICAgZ3V0dGVyID0gZWRpdG9yLmFkZEd1dHRlcih7XG4gICAgICBuYW1lOiBHVVRURVJfSUQsXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIGxldCBtYXJrZXI7XG4gIGxldCBtYXJrZXJzID0gZWRpdG9yVG9NYXJrZXJzLmdldChlZGl0b3IpO1xuXG4gIC8vIFRPRE86IENvbnNpZGVyIGEgbW9yZSBlZmZpY2llbnQgc3RyYXRlZ3kgdGhhdCBkb2VzIG5vdCBibGluZGx5IGRlc3Ryb3kgYWxsIG9mIHRoZVxuICAvLyBleGlzdGluZyBtYXJrZXJzLlxuICBpZiAobWFya2Vycykge1xuICAgIGZvciAobWFya2VyIG9mIG1hcmtlcnMpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KCk7XG4gICAgfVxuICAgIG1hcmtlcnMuY2xlYXIoKTtcbiAgfSBlbHNlIHtcbiAgICBtYXJrZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgY29uc3Qgcm93VG9NZXNzYWdlOiBNYXA8bnVtYmVyLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PiA9IG5ldyBNYXAoKTtcbiAgZnVuY3Rpb24gYWRkTWVzc2FnZUZvclJvdyhtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsIHJvdzogbnVtYmVyKSB7XG4gICAgbGV0IG1lc3NhZ2VzID0gcm93VG9NZXNzYWdlLmdldChyb3cpO1xuICAgIGlmICghbWVzc2FnZXMpIHtcbiAgICAgIG1lc3NhZ2VzID0gW107XG4gICAgICByb3dUb01lc3NhZ2Uuc2V0KHJvdywgbWVzc2FnZXMpO1xuICAgIH1cbiAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICB9XG5cbiAgZm9yIChjb25zdCBtZXNzYWdlIG9mIHVwZGF0ZS5tZXNzYWdlcykge1xuICAgIGNvbnN0IHJhbmdlID0gbWVzc2FnZS5yYW5nZTtcbiAgICBsZXQgaGlnaGxpZ2h0TWFya2VyO1xuICAgIGlmIChyYW5nZSkge1xuICAgICAgYWRkTWVzc2FnZUZvclJvdyhtZXNzYWdlLCByYW5nZS5zdGFydC5yb3cpO1xuICAgICAgaGlnaGxpZ2h0TWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZE1lc3NhZ2VGb3JSb3cobWVzc2FnZSwgMCk7XG4gICAgfVxuXG4gICAgbGV0IGhpZ2hsaWdodENzc0NsYXNzO1xuICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdFcnJvcicpIHtcbiAgICAgIGhpZ2hsaWdodENzc0NsYXNzID0gSElHSExJR0hUX0NTUyArICcgJyArIEVSUk9SX0hJR0hMSUdIVF9DU1M7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhpZ2hsaWdodENzc0NsYXNzID0gSElHSExJR0hUX0NTUyArICcgJyArIFdBUk5JTkdfSElHSExJR0hUX0NTUztcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1hcmtlciB1bmRlcmxpbmVzIHRleHQuXG4gICAgaWYgKGhpZ2hsaWdodE1hcmtlcikge1xuICAgICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKGhpZ2hsaWdodE1hcmtlciwge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6IGhpZ2hsaWdodENzc0NsYXNzLFxuICAgICAgfSk7XG4gICAgICBtYXJrZXJzLmFkZChoaWdobGlnaHRNYXJrZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgYWxsIG9mIHRoZSBndXR0ZXIgbWFya2VycyBmb3IgdGhlIHNhbWUgcm93IGFuZCBjb21iaW5lIHRoZW0gaW50byBvbmUgbWFya2VyL3BvcHVwLlxuICBmb3IgKGNvbnN0IFtyb3csIG1lc3NhZ2VzXSBvZiByb3dUb01lc3NhZ2UuZW50cmllcygpKSB7XG4gICAgLy8gSWYgYXQgbGVhc3Qgb25lIG9mIHRoZSBkaWFnbm9zdGljcyBpcyBhbiBlcnJvciByYXRoZXIgdGhhbiB0aGUgd2FybmluZyxcbiAgICAvLyBkaXNwbGF5IHRoZSBnbHlwaCBpbiB0aGUgZ3V0dGVyIHRvIHJlcHJlc2VudCBhbiBlcnJvciByYXRoZXIgdGhhbiBhIHdhcm5pbmcuXG4gICAgY29uc3QgZ3V0dGVyTWFya2VyQ3NzQ2xhc3MgPSBtZXNzYWdlcy5zb21lKG1zZyA9PiBtc2cudHlwZSA9PT0gJ0Vycm9yJylcbiAgICAgID8gRVJST1JfR1VUVEVSX0NTU1xuICAgICAgOiBXQVJOSU5HX0dVVFRFUl9DU1M7XG5cbiAgICAvLyBUaGlzIG1hcmtlciBhZGRzIHNvbWUgVUkgdG8gdGhlIGd1dHRlci5cbiAgICBjb25zdCB7aXRlbSwgZGlzcG9zZX0gPSBjcmVhdGVHdXR0ZXJJdGVtKG1lc3NhZ2VzLCBndXR0ZXJNYXJrZXJDc3NDbGFzcywgZml4ZXIpO1xuICAgIGl0ZW1Ub0VkaXRvci5zZXQoaXRlbSwgZWRpdG9yKTtcbiAgICBjb25zdCBndXR0ZXJNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKFtyb3csIDBdKTtcbiAgICBndXR0ZXIuZGVjb3JhdGVNYXJrZXIoZ3V0dGVyTWFya2VyLCB7aXRlbX0pO1xuICAgIGd1dHRlck1hcmtlci5vbkRpZERlc3Ryb3koZGlzcG9zZSk7XG4gICAgbWFya2Vycy5hZGQoZ3V0dGVyTWFya2VyKTtcbiAgfVxuXG4gIGVkaXRvclRvTWFya2Vycy5zZXQoZWRpdG9yLCBtYXJrZXJzKTtcblxuICAvLyBPbmNlIHRoZSBndXR0ZXIgaXMgc2hvd24gZm9yIHRoZSBmaXJzdCB0aW1lLCBpdCBpcyBkaXNwbGF5ZWQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGVcbiAgLy8gVGV4dEVkaXRvci5cbiAgaWYgKHVwZGF0ZS5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgZ3V0dGVyLnNob3coKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVHdXR0ZXJJdGVtKFxuICBtZXNzYWdlczogQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPixcbiAgZ3V0dGVyTWFya2VyQ3NzQ2xhc3M6IHN0cmluZyxcbiAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4pOiB7aXRlbTogSFRNTEVsZW1lbnQ7IGRpc3Bvc2U6ICgpID0+IHZvaWR9IHtcbiAgY29uc3QgaXRlbSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGl0ZW0uaW5uZXJUZXh0ID0gJ1xcdTI1QjYnOyAvLyBVbmljb2RlIGNoYXJhY3RlciBmb3IgYSByaWdodC1wb2ludGluZyB0cmlhbmdsZS5cbiAgaXRlbS5jbGFzc05hbWUgPSBndXR0ZXJNYXJrZXJDc3NDbGFzcztcbiAgbGV0IHBvcHVwRWxlbWVudCA9IG51bGw7XG4gIGxldCBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gIGxldCBkaXNwb3NlVGltZW91dCA9IG51bGw7XG4gIGNvbnN0IGNsZWFyRGlzcG9zZVRpbWVvdXQgPSAoKSA9PiB7XG4gICAgaWYgKGRpc3Bvc2VUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQoZGlzcG9zZVRpbWVvdXQpO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgZGlzcG9zZSA9ICgpID0+IHtcbiAgICBpZiAocG9wdXBFbGVtZW50KSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHBvcHVwRWxlbWVudCk7XG4gICAgICBwb3B1cEVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwb3B1cEVsZW1lbnQpO1xuICAgICAgcG9wdXBFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHBhbmVJdGVtU3Vic2NyaXB0aW9uKSB7XG4gICAgICBwYW5lSXRlbVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGNsZWFyRGlzcG9zZVRpbWVvdXQoKTtcbiAgfTtcbiAgY29uc3QgZ29Ub0xvY2F0aW9uID0gKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiB7XG4gICAgLy8gQmVmb3JlIHdlIGp1bXAgdG8gdGhlIGxvY2F0aW9uLCB3ZSB3YW50IHRvIGNsb3NlIHRoZSBwb3B1cC5cbiAgICBkaXNwb3NlKCk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgICAgaW5pdGlhbExpbmU6IGxpbmUsXG4gICAgfTtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIG9wdGlvbnMpO1xuICB9O1xuICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBldmVudCA9PiB7XG4gICAgLy8gSWYgdGhlcmUgd2FzIHNvbWVob3cgYW5vdGhlciBwb3B1cCBmb3IgdGhpcyBndXR0ZXIgaXRlbSwgZGlzcG9zZSBpdC4gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZVxuICAgIC8vIHVzZXIgbWFuYWdlcyB0byBzY3JvbGwgYW5kIGVzY2FwZSBkaXNwb3NhbC5cbiAgICBkaXNwb3NlKCk7XG4gICAgcG9wdXBFbGVtZW50ID0gc2hvd1BvcHVwRm9yKG1lc3NhZ2VzLCBpdGVtLCBnb1RvTG9jYXRpb24sIGZpeGVyKTtcbiAgICBwb3B1cEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGRpc3Bvc2UpO1xuICAgIHBvcHVwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgY2xlYXJEaXNwb3NlVGltZW91dCk7XG4gICAgLy8gVGhpcyBtYWtlcyBzdXJlIHRoYXQgdGhlIHBvcHVwIGRpc2FwcGVhcnMgd2hlbiB5b3UgY3RybCt0YWIgdG8gc3dpdGNoIHRhYnMuXG4gICAgcGFuZUl0ZW1TdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKGRpc3Bvc2UpO1xuICB9KTtcbiAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZXZlbnQgPT4ge1xuICAgIC8vIFdoZW4gdGhlIHBvcHVwIGlzIHNob3duLCB3ZSB3YW50IHRvIGRpc3Bvc2UgaXQgaWYgdGhlIHVzZXIgbWFuYWdlcyB0byBtb3ZlIHRoZSBjdXJzb3Igb2ZmIG9mXG4gICAgLy8gdGhlIGd1dHRlciBnbHlwaCB3aXRob3V0IG1vdmluZyBpdCBvbnRvIHRoZSBwb3B1cC4gRXZlbiB0aG91Z2ggdGhlIHBvcHVwIGFwcGVhcnMgYWJvdmUgKGFzIGluXG4gICAgLy8gWi1pbmRleCBhYm92ZSkgdGhlIGd1dHRlciBnbHlwaCwgaWYgeW91IG1vdmUgdGhlIGN1cnNvciBzdWNoIHRoYXQgaXQgaXMgb25seSBhYm92ZSB0aGUgZ2x5cGhcbiAgICAvLyBmb3Igb25lIGZyYW1lIHlvdSBjYW4gY2F1c2UgdGhlIHBvcHVwIHRvIGFwcGVhciB3aXRob3V0IHRoZSBtb3VzZSBldmVyIGVudGVyaW5nIGl0LlxuICAgIGRpc3Bvc2VUaW1lb3V0ID0gc2V0VGltZW91dChkaXNwb3NlLCBQT1BVUF9ESVNQT1NFX1RJTUVPVVQpO1xuICB9KTtcbiAgcmV0dXJuIHtpdGVtLCBkaXNwb3NlfTtcbn1cblxuLyoqXG4gKiBTaG93cyBhIHBvcHVwIGZvciB0aGUgZGlhZ25vc3RpYyBqdXN0IGJlbG93IHRoZSBzcGVjaWZpZWQgaXRlbS5cbiAqL1xuZnVuY3Rpb24gc2hvd1BvcHVwRm9yKFxuICAgIG1lc3NhZ2VzOiBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+LFxuICAgIGl0ZW06IEhUTUxFbGVtZW50LFxuICAgIGdvVG9Mb2NhdGlvbjogKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCBsaW5lOiBudW1iZXIpID0+IG1peGVkLFxuICAgIGZpeGVyOiAobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKSA9PiB2b2lkLFxuICAgICk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgY2hpbGRyZW4gPSBtZXNzYWdlcy5tYXAobWVzc2FnZSA9PiB7XG4gICAgY29uc3QgY29udGVudHMgPSBjcmVhdGVFbGVtZW50Rm9yTWVzc2FnZShtZXNzYWdlLCBnb1RvTG9jYXRpb24sIGZpeGVyKTtcbiAgICBjb25zdCBkaWFnbm9zdGljVHlwZUNsYXNzID0gbWVzc2FnZS50eXBlID09PSAnRXJyb3InXG4gICAgICA/ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cC1lcnJvcidcbiAgICAgIDogJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwLXdhcm5pbmcnO1xuICAgIC8vIG5hdGl2ZS1rZXktYmluZGluZ3MgYW5kIHRhYkluZGV4PS0xIGFyZSBib3RoIG5lZWRlZCB0byBhbGxvdyBjb3B5aW5nIHRoZSB0ZXh0IGluIHRoZSBwb3B1cC5cbiAgICBjb25zdCBjbGFzc2VzID1cbiAgICAgIGBuYXRpdmUta2V5LWJpbmRpbmdzIG51Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwLWRpYWdub3N0aWMgJHtkaWFnbm9zdGljVHlwZUNsYXNzfWA7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgdGFiSW5kZXg9ey0xfSBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICB7Y29udGVudHN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9KTtcbiAgLy8gVGhlIHBvcHVwIHdpbGwgYmUgYW4gYWJzb2x1dGVseSBwb3NpdGlvbmVkIGNoaWxkIGVsZW1lbnQgb2YgPGF0b20td29ya3NwYWNlPiBzbyB0aGF0IGl0IGFwcGVhcnNcbiAgLy8gb24gdG9wIG9mIGV2ZXJ5dGhpbmcuXG4gIGNvbnN0IHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICBjb25zdCBob3N0RWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgd29ya3NwYWNlRWxlbWVudC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGhvc3RFbGVtZW50KTtcblxuICAvLyBNb3ZlIGl0IGRvd24gdmVydGljYWxseSBzbyBpdCBkb2VzIG5vdCBlbmQgdXAgdW5kZXIgdGhlIG1vdXNlIHBvaW50ZXIuXG4gIGNvbnN0IHt0b3AsIGxlZnR9ID0gaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICBSZWFjdERPTS5yZW5kZXIoXG4gICAgPERpYWdub3N0aWNzUG9wdXAgbGVmdD17bGVmdH0gdG9wPXt0b3B9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvRGlhZ25vc3RpY3NQb3B1cD4sXG4gICAgaG9zdEVsZW1lbnRcbiAgKTtcblxuICAvLyBDaGVjayB0byBzZWUgd2hldGhlciB0aGUgcG9wdXAgaXMgd2l0aGluIHRoZSBib3VuZHMgb2YgdGhlIFRleHRFZGl0b3IuIElmIG5vdCwgZGlzcGxheSBpdCBhYm92ZVxuICAvLyB0aGUgZ2x5cGggcmF0aGVyIHRoYW4gYmVsb3cgaXQuXG4gIGNvbnN0IGVkaXRvciA9IGl0ZW1Ub0VkaXRvci5nZXQoaXRlbSk7XG4gIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKTtcbiAgY29uc3Qge3RvcDogZWRpdG9yVG9wLCBoZWlnaHQ6IGVkaXRvckhlaWdodH0gPSBlZGl0b3JFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCB7dG9wOiBpdGVtVG9wLCBoZWlnaHQ6IGl0ZW1IZWlnaHR9ID0gaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgY29uc3QgcG9wdXBIZWlnaHQgPSBob3N0RWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZC5jbGllbnRIZWlnaHQ7XG4gIGlmICgoaXRlbVRvcCArIGl0ZW1IZWlnaHQgKyBwb3B1cEhlaWdodCkgPiAoZWRpdG9yVG9wICsgZWRpdG9ySGVpZ2h0KSkge1xuICAgIGNvbnN0IHBvcHVwRWxlbWVudCA9IGhvc3RFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIC8vIFNoaWZ0IHRoZSBwb3B1cCBiYWNrIGRvd24gYnkgR0xZUEhfSEVJR0hULCBzbyB0aGF0IHRoZSBib3R0b20gcGFkZGluZyBvdmVybGFwcyB3aXRoIHRoZVxuICAgIC8vIGdseXBoLiBBbiBhZGRpdGlvbmFsIDQgcHggaXMgbmVlZGVkIHRvIG1ha2UgaXQgbG9vayB0aGUgc2FtZSB3YXkgaXQgZG9lcyB3aGVuIGl0IHNob3dzIHVwXG4gICAgLy8gYmVsb3cuIEkgZG9uJ3Qga25vdyB3aHkuXG4gICAgcG9wdXBFbGVtZW50LnN0eWxlLnRvcCA9IFN0cmluZyhpdGVtVG9wIC0gcG9wdXBIZWlnaHQgKyBHTFlQSF9IRUlHSFQgKyA0KSArICdweCc7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBob3N0RWxlbWVudDtcbiAgfSBmaW5hbGx5IHtcbiAgICBtZXNzYWdlcy5mb3JFYWNoKG1lc3NhZ2UgPT4ge1xuICAgICAgdHJhY2soJ2RpYWdub3N0aWNzLWd1dHRlci1zaG93LXBvcHVwJywge1xuICAgICAgICAnZGlhZ25vc3RpY3MtcHJvdmlkZXInOiBtZXNzYWdlLnByb3ZpZGVyTmFtZSxcbiAgICAgICAgJ2RpYWdub3N0aWNzLW1lc3NhZ2UnOiBtZXNzYWdlLnRleHQgfHwgbWVzc2FnZS5odG1sIHx8ICcnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEZvck1lc3NhZ2UoXG4gIG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgZ29Ub0xvY2F0aW9uOiAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IG1peGVkLFxuICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZCxcbik6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgcHJvdmlkZXJDbGFzc05hbWUgPSBtZXNzYWdlLnR5cGUgPT09ICdFcnJvcidcbiAgICA/ICdoaWdobGlnaHQtZXJyb3InXG4gICAgOiAnaGlnaGxpZ2h0LXdhcm5pbmcnO1xuICBjb25zdCBjb3B5ID0gKCkgPT4ge1xuICAgIGNvbnN0IHRleHQgPSBwbGFpblRleHRGb3JEaWFnbm9zdGljKG1lc3NhZ2UpO1xuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRleHQpO1xuICB9O1xuICBsZXQgZml4QnV0dG9uID0gbnVsbDtcbiAgaWYgKG1lc3NhZ2UuZml4ICE9IG51bGwpIHtcbiAgICBjb25zdCBhcHBseUZpeCA9IGZpeGVyLmJpbmQobnVsbCwgbWVzc2FnZSk7XG4gICAgZml4QnV0dG9uID0gKFxuICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXhzXCIgb25DbGljaz17YXBwbHlGaXh9PkZpeDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbiAgY29uc3QgaGVhZGVyID0gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtaGVhZGVyXCI+XG4gICAgICB7Zml4QnV0dG9ufVxuICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXhzXCIgb25DbGljaz17Y29weX0+Q29weTwvYnV0dG9uPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgcHVsbC1yaWdodCAke3Byb3ZpZGVyQ2xhc3NOYW1lfWB9PnttZXNzYWdlLnByb3ZpZGVyTmFtZX08L3NwYW4+XG4gICAgPC9kaXY+XG4gICk7XG4gIGNvbnN0IHRyYWNlRWxlbWVudHMgPSBtZXNzYWdlLnRyYWNlXG4gICAgPyBtZXNzYWdlLnRyYWNlLm1hcCh0cmFjZUl0ZW0gPT4gY3JlYXRlRWxlbWVudEZvclRyYWNlKHRyYWNlSXRlbSwgZ29Ub0xvY2F0aW9uKSlcbiAgICA6IG51bGw7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtoZWFkZXJ9XG4gICAgICA8ZGl2PntjcmVhdGVNZXNzYWdlU3BhbihtZXNzYWdlKX08L2Rpdj5cbiAgICAgIHt0cmFjZUVsZW1lbnRzfVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBwbGFpblRleHRGb3JEaWFnbm9zdGljKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIGNvbnN0IHtnZXRQYXRofSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbiAgZnVuY3Rpb24gcGxhaW5UZXh0Rm9ySXRlbShpdGVtOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UgfCBUcmFjZSk6IHN0cmluZyB7XG4gICAgbGV0IG1haW5Db21wb25lbnQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGl0ZW0uaHRtbCAhPSBudWxsKSB7XG4gICAgICAvLyBRdWljayBhbmQgZGlydHkgd2F5IHRvIGdldCBhbiBhcHByb3hpbWF0aW9uIGZvciB0aGUgcGxhaW4gdGV4dCBmcm9tIEhUTUwuIFRoaXMgd2lsbCB3b3JrIGluXG4gICAgICAvLyBzaW1wbGUgY2FzZXMsIGFueXdheS5cbiAgICAgIG1haW5Db21wb25lbnQgPSBpdGVtLmh0bWwucmVwbGFjZSgnPGJyLz4nLCAnXFxuJykucmVwbGFjZSgvPFtePl0qPi9nLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudChpdGVtLnRleHQgIT0gbnVsbCk7XG4gICAgICBtYWluQ29tcG9uZW50ID0gaXRlbS50ZXh0O1xuICAgIH1cblxuICAgIGxldCBwYXRoQ29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChpdGVtLmZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgIHBhdGhDb21wb25lbnQgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGluZUNvbXBvbmVudCA9IGl0ZW0ucmFuZ2UgIT0gbnVsbCA/IGA6JHtpdGVtLnJhbmdlLnN0YXJ0LnJvdyArIDF9YCA6ICcnO1xuICAgICAgcGF0aENvbXBvbmVudCA9ICc6ICcgKyBnZXRQYXRoKGl0ZW0uZmlsZVBhdGgpICsgbGluZUNvbXBvbmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFpbkNvbXBvbmVudCArIHBhdGhDb21wb25lbnQ7XG4gIH1cbiAgY29uc3QgdHJhY2UgPSBtZXNzYWdlLnRyYWNlICE9IG51bGwgPyBtZXNzYWdlLnRyYWNlIDogW107XG4gIHJldHVybiBbbWVzc2FnZSwgLi4udHJhY2VdLm1hcChwbGFpblRleHRGb3JJdGVtKS5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEZvclRyYWNlKFxuICB0cmFjZTogVHJhY2UsXG4gIGdvVG9Mb2NhdGlvbjogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbik6IEhUTUxFbGVtZW50IHtcbiAgbGV0IGxvY1NwYW4gPSBudWxsO1xuICAvLyBMb2NhbCB2YXJpYWJsZSBzbyB0aGF0IHRoZSB0eXBlIHJlZmluZW1lbnQgaG9sZHMgaW4gdGhlIG9uQ2xpY2sgaGFuZGxlci5cbiAgY29uc3QgcGF0aCA9IHRyYWNlLmZpbGVQYXRoO1xuICBpZiAocGF0aCkge1xuICAgIGNvbnN0IFssIHJlbGF0aXZlUGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgocGF0aCk7XG4gICAgbGV0IGxvY1N0cmluZyA9IHJlbGF0aXZlUGF0aDtcbiAgICBpZiAodHJhY2UucmFuZ2UpIHtcbiAgICAgIGxvY1N0cmluZyArPSBgOiR7dHJhY2UucmFuZ2Uuc3RhcnQucm93ICsgMX1gO1xuICAgIH1cbiAgICBjb25zdCBvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgdHJhY2soJ2RpYWdub3N0aWNzLWd1dHRlci1nb3RvLWxvY2F0aW9uJyk7XG4gICAgICBnb1RvTG9jYXRpb24ocGF0aCwgTWF0aC5tYXgodHJhY2UucmFuZ2UgPyB0cmFjZS5yYW5nZS5zdGFydC5yb3cgOiAwLCAwKSk7XG4gICAgfTtcbiAgICBsb2NTcGFuID0gPHNwYW4+OiA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e29uQ2xpY2t9Pntsb2NTdHJpbmd9PC9hPjwvc3Bhbj47XG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAge2NyZWF0ZU1lc3NhZ2VTcGFuKHRyYWNlKX1cbiAgICAgIHtsb2NTcGFufVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNZXNzYWdlU3BhbihtZXNzYWdlOiB7aHRtbD86IHN0cmluZywgdGV4dD86IHN0cmluZ30pOiBIVE1MRWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmh0bWwgIT0gbnVsbCkge1xuICAgIHJldHVybiA8c3BhbiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogbWVzc2FnZS5odG1sfX0gLz47XG4gIH0gZWxzZSBpZiAobWVzc2FnZS50ZXh0ICE9IG51bGwpIHtcbiAgICByZXR1cm4gPHNwYW4+e21lc3NhZ2UudGV4dH08L3NwYW4+O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA8c3Bhbj5EaWFnbm9zdGljIGxhY2tzIG1lc3NhZ2UuPC9zcGFuPjtcbiAgfVxufVxuXG5jbGFzcyBEaWFnbm9zdGljc1BvcHVwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLm5vZGUsXG4gICAgbGVmdDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIHRvcDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cFwiXG4gICAgICAgIHN0eWxlPXt7bGVmdDogdGhpcy5wcm9wcy5sZWZ0ICsgJ3B4JywgdG9wOiB0aGlzLnByb3BzLnRvcCArICdweCd9fVxuICAgICAgICA+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl19