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

var _featureConfig = require('../../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var _require = require('../../../analytics');

var track = _require.track;

var React = require('react-for-atom');

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
      React.unmountComponentAtNode(popupElement);
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

  React.render(React.createElement(
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
  if (message.fix != null && _featureConfig2['default'].get('nuclide-diagnostics-ui.enableAutofix')) {
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
  var _require2 = require('../../../remote-uri');

  var getPath = _require2.getPath;

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
  }]);

  return DiagnosticsPopup;
})(React.Component);

var PropTypes = React.PropTypes;

DiagnosticsPopup.propTypes = {
  children: PropTypes.node,
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired
};
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7T0FDaEIsQ0FDTjtLQUNIOzs7U0FYRyxnQkFBZ0I7R0FBUyxLQUFLLENBQUMsU0FBUzs7SUFjdkMsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7QUFFaEIsZ0JBQWdCLENBQUMsU0FBUyxHQUFHO0FBQzNCLFVBQVEsRUFBRSxTQUFTLENBQUMsSUFBSTtBQUN4QixNQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLEtBQUcsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7Q0FDakMsQ0FBQyIsImZpbGUiOiJndXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVNZXNzYWdlVXBkYXRlLFxuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIFRyYWNlLFxufSBmcm9tICcuLi8uLi9iYXNlJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcblxuY29uc3Qge3RyYWNrfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2FuYWx5dGljcycpO1xuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCBHVVRURVJfSUQgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXInO1xuXG4vLyBOZWVkcyB0byBiZSB0aGUgc2FtZSBhcyBnbHlwaC1oZWlnaHQgaW4gZ3V0dGVyLmF0b20tdGV4dC1lZGl0b3IubGVzcy5cbmNvbnN0IEdMWVBIX0hFSUdIVCA9IDE1OyAvLyBweFxuXG5jb25zdCBQT1BVUF9ESVNQT1NFX1RJTUVPVVQgPSAxMDA7XG5cbi8vIFRPRE8obWJvbGluKTogTWFrZSBpdCBzbyB0aGF0IHdoZW4gbW91c2luZyBvdmVyIGFuIGVsZW1lbnQgd2l0aCB0aGlzIENTUyBjbGFzcyAob3Igc3BlY2lmaWNhbGx5LFxuLy8gdGhlIGNoaWxkIGVsZW1lbnQgd2l0aCB0aGUgXCJyZWdpb25cIiBDU1MgY2xhc3MpLCB3ZSBhbHNvIGRvIGEgc2hvd1BvcHVwRm9yKCkuIFRoaXMgc2VlbXMgdG8gYmVcbi8vIHRyaWNreSBnaXZlbiBob3cgdGhlIERPTSBvZiBhIFRleHRFZGl0b3Igd29ya3MgdG9kYXkuIFRoZXJlIGFyZSBkaXYudGlsZSBlbGVtZW50cywgZWFjaCBvZiB3aGljaFxuLy8gaGFzIGl0cyBvd24gZGl2LmhpZ2hsaWdodHMgZWxlbWVudCBhbmQgbWFueSBkaXYubGluZSBlbGVtZW50cy4gVGhlIGRpdi5oaWdobGlnaHRzIGVsZW1lbnQgaGFzIDBcbi8vIG9yIG1vcmUgY2hpbGRyZW4sIGVhY2ggY2hpbGQgYmVpbmcgYSBkaXYuaGlnaGxpZ2h0IHdpdGggYSBjaGlsZCBkaXYucmVnaW9uLiBUaGUgZGl2LnJlZ2lvblxuLy8gZWxlbWVudCBpcyBkZWZpbmVkIHRvIGJlIHtwb3NpdGlvbjogYWJzb2x1dGU7IHBvaW50ZXItZXZlbnRzOiBub25lOyB6LWluZGV4OiAtMX0uIFRoZSBhYnNvbHV0ZVxuLy8gcG9zaXRpb25pbmcgYW5kIG5lZ2F0aXZlIHotaW5kZXggbWFrZSBpdCBzbyBpdCBpc24ndCBlbGlnaWJsZSBmb3IgbW91c2VvdmVyIGV2ZW50cywgc28gd2Vcbi8vIG1pZ2h0IGhhdmUgdG8gbGlzdGVuIGZvciBtb3VzZW92ZXIgZXZlbnRzIG9uIFRleHRFZGl0b3IgYW5kIHRoZW4gdXNlIGl0cyBvd24gQVBJcywgc3VjaCBhc1xuLy8gZGVjb3JhdGlvbnNGb3JTY3JlZW5Sb3dSYW5nZSgpLCB0byBzZWUgaWYgdGhlcmUgaXMgYSBoaXQgdGFyZ2V0IGluc3RlYWQuIFNpbmNlIHRoaXMgd2lsbCBiZVxuLy8gaGFwcGVuaW5nIG9ubW91c2Vtb3ZlLCB3ZSBhbHNvIGhhdmUgdG8gYmUgY2FyZWZ1bCB0byBtYWtlIHN1cmUgdGhpcyBpcyBub3QgZXhwZW5zaXZlLlxuY29uc3QgSElHSExJR0hUX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1oaWdobGlnaHQnO1xuXG5jb25zdCBFUlJPUl9ISUdITElHSFRfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWhpZ2hsaWdodC1lcnJvcic7XG5jb25zdCBXQVJOSU5HX0hJR0hMSUdIVF9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktaGlnaGxpZ2h0LXdhcm5pbmcnO1xuXG5jb25zdCBFUlJPUl9HVVRURVJfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWd1dHRlci1lcnJvcic7XG5jb25zdCBXQVJOSU5HX0dVVFRFUl9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktZ3V0dGVyLXdhcm5pbmcnO1xuXG5jb25zdCBlZGl0b3JUb01hcmtlcnM6IFdlYWtNYXA8VGV4dEVkaXRvciwgU2V0PGF0b20kTWFya2VyPj4gPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgaXRlbVRvRWRpdG9yOiBXZWFrTWFwPEhUTUxFbGVtZW50LCBUZXh0RWRpdG9yPiA9IG5ldyBXZWFrTWFwKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVVwZGF0ZVRvRWRpdG9yKFxuICBlZGl0b3I6IFRleHRFZGl0b3IsXG4gIHVwZGF0ZTogRmlsZU1lc3NhZ2VVcGRhdGUsXG4gIGZpeGVyOiAobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKSA9PiB2b2lkLFxuKTogdm9pZCB7XG4gIGxldCBndXR0ZXIgPSBlZGl0b3IuZ3V0dGVyV2l0aE5hbWUoR1VUVEVSX0lEKTtcbiAgaWYgKCFndXR0ZXIpIHtcbiAgICAvLyBUT0RPKGplc3NpY2FsaW4pOiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgcHJpb3JpdHkgc28gdGhhdCB0aGUgZ3V0dGVyOlxuICAgIC8vICgxKSBTaG93cyB1cCB0byB0aGUgcmlnaHQgb2YgdGhlIGxpbmUgbnVtYmVycy5cbiAgICAvLyAoMikgU2hvd3MgdGhlIGl0ZW1zIHRoYXQgYXJlIGFkZGVkIHRvIGl0IHJpZ2h0IGF3YXkuXG4gICAgLy8gVXNpbmcgYSB2YWx1ZSBvZiAxMCBmaXhlcyAoMSksIGJ1dCBicmVha3MgKDIpLiBUaGlzIHNlZW1zIGxpa2UgaXQgaXMgbGlrZWx5IGEgYnVnIGluIEF0b20uXG5cbiAgICAvLyBCeSBkZWZhdWx0LCBhIGd1dHRlciB3aWxsIGJlIGRlc3Ryb3llZCB3aGVuIGl0cyBlZGl0b3IgaXMgZGVzdHJveWVkLFxuICAgIC8vIHNvIHRoZXJlIGlzIG5vIG5lZWQgdG8gcmVnaXN0ZXIgYSBjYWxsYmFjayB2aWEgb25EaWREZXN0cm95KCkuXG4gICAgZ3V0dGVyID0gZWRpdG9yLmFkZEd1dHRlcih7XG4gICAgICBuYW1lOiBHVVRURVJfSUQsXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIGxldCBtYXJrZXI7XG4gIGxldCBtYXJrZXJzID0gZWRpdG9yVG9NYXJrZXJzLmdldChlZGl0b3IpO1xuXG4gIC8vIFRPRE86IENvbnNpZGVyIGEgbW9yZSBlZmZpY2llbnQgc3RyYXRlZ3kgdGhhdCBkb2VzIG5vdCBibGluZGx5IGRlc3Ryb3kgYWxsIG9mIHRoZVxuICAvLyBleGlzdGluZyBtYXJrZXJzLlxuICBpZiAobWFya2Vycykge1xuICAgIGZvciAobWFya2VyIG9mIG1hcmtlcnMpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KCk7XG4gICAgfVxuICAgIG1hcmtlcnMuY2xlYXIoKTtcbiAgfSBlbHNlIHtcbiAgICBtYXJrZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgY29uc3Qgcm93VG9NZXNzYWdlOiBNYXA8bnVtYmVyLCBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+PiA9IG5ldyBNYXAoKTtcbiAgZnVuY3Rpb24gYWRkTWVzc2FnZUZvclJvdyhtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsIHJvdzogbnVtYmVyKSB7XG4gICAgbGV0IG1lc3NhZ2VzID0gcm93VG9NZXNzYWdlLmdldChyb3cpO1xuICAgIGlmICghbWVzc2FnZXMpIHtcbiAgICAgIG1lc3NhZ2VzID0gW107XG4gICAgICByb3dUb01lc3NhZ2Uuc2V0KHJvdywgbWVzc2FnZXMpO1xuICAgIH1cbiAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICB9XG5cbiAgZm9yIChjb25zdCBtZXNzYWdlIG9mIHVwZGF0ZS5tZXNzYWdlcykge1xuICAgIGNvbnN0IHJhbmdlID0gbWVzc2FnZS5yYW5nZTtcbiAgICBsZXQgaGlnaGxpZ2h0TWFya2VyO1xuICAgIGlmIChyYW5nZSkge1xuICAgICAgYWRkTWVzc2FnZUZvclJvdyhtZXNzYWdlLCByYW5nZS5zdGFydC5yb3cpO1xuICAgICAgaGlnaGxpZ2h0TWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZE1lc3NhZ2VGb3JSb3cobWVzc2FnZSwgMCk7XG4gICAgfVxuXG4gICAgbGV0IGhpZ2hsaWdodENzc0NsYXNzO1xuICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdFcnJvcicpIHtcbiAgICAgIGhpZ2hsaWdodENzc0NsYXNzID0gSElHSExJR0hUX0NTUyArICcgJyArIEVSUk9SX0hJR0hMSUdIVF9DU1M7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhpZ2hsaWdodENzc0NsYXNzID0gSElHSExJR0hUX0NTUyArICcgJyArIFdBUk5JTkdfSElHSExJR0hUX0NTUztcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1hcmtlciB1bmRlcmxpbmVzIHRleHQuXG4gICAgaWYgKGhpZ2hsaWdodE1hcmtlcikge1xuICAgICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKGhpZ2hsaWdodE1hcmtlciwge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6IGhpZ2hsaWdodENzc0NsYXNzLFxuICAgICAgfSk7XG4gICAgICBtYXJrZXJzLmFkZChoaWdobGlnaHRNYXJrZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgYWxsIG9mIHRoZSBndXR0ZXIgbWFya2VycyBmb3IgdGhlIHNhbWUgcm93IGFuZCBjb21iaW5lIHRoZW0gaW50byBvbmUgbWFya2VyL3BvcHVwLlxuICBmb3IgKGNvbnN0IFtyb3csIG1lc3NhZ2VzXSBvZiByb3dUb01lc3NhZ2UuZW50cmllcygpKSB7XG4gICAgLy8gSWYgYXQgbGVhc3Qgb25lIG9mIHRoZSBkaWFnbm9zdGljcyBpcyBhbiBlcnJvciByYXRoZXIgdGhhbiB0aGUgd2FybmluZyxcbiAgICAvLyBkaXNwbGF5IHRoZSBnbHlwaCBpbiB0aGUgZ3V0dGVyIHRvIHJlcHJlc2VudCBhbiBlcnJvciByYXRoZXIgdGhhbiBhIHdhcm5pbmcuXG4gICAgY29uc3QgZ3V0dGVyTWFya2VyQ3NzQ2xhc3MgPSBtZXNzYWdlcy5zb21lKG1zZyA9PiBtc2cudHlwZSA9PT0gJ0Vycm9yJylcbiAgICAgID8gRVJST1JfR1VUVEVSX0NTU1xuICAgICAgOiBXQVJOSU5HX0dVVFRFUl9DU1M7XG5cbiAgICAvLyBUaGlzIG1hcmtlciBhZGRzIHNvbWUgVUkgdG8gdGhlIGd1dHRlci5cbiAgICBjb25zdCB7aXRlbSwgZGlzcG9zZX0gPSBjcmVhdGVHdXR0ZXJJdGVtKG1lc3NhZ2VzLCBndXR0ZXJNYXJrZXJDc3NDbGFzcywgZml4ZXIpO1xuICAgIGl0ZW1Ub0VkaXRvci5zZXQoaXRlbSwgZWRpdG9yKTtcbiAgICBjb25zdCBndXR0ZXJNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKFtyb3csIDBdKTtcbiAgICBndXR0ZXIuZGVjb3JhdGVNYXJrZXIoZ3V0dGVyTWFya2VyLCB7aXRlbX0pO1xuICAgIGd1dHRlck1hcmtlci5vbkRpZERlc3Ryb3koZGlzcG9zZSk7XG4gICAgbWFya2Vycy5hZGQoZ3V0dGVyTWFya2VyKTtcbiAgfVxuXG4gIGVkaXRvclRvTWFya2Vycy5zZXQoZWRpdG9yLCBtYXJrZXJzKTtcblxuICAvLyBPbmNlIHRoZSBndXR0ZXIgaXMgc2hvd24gZm9yIHRoZSBmaXJzdCB0aW1lLCBpdCBpcyBkaXNwbGF5ZWQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGVcbiAgLy8gVGV4dEVkaXRvci5cbiAgaWYgKHVwZGF0ZS5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgZ3V0dGVyLnNob3coKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVHdXR0ZXJJdGVtKFxuICBtZXNzYWdlczogQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPixcbiAgZ3V0dGVyTWFya2VyQ3NzQ2xhc3M6IHN0cmluZyxcbiAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4pOiB7aXRlbTogSFRNTEVsZW1lbnQ7IGRpc3Bvc2U6ICgpID0+IHZvaWR9IHtcbiAgY29uc3QgaXRlbSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGl0ZW0uaW5uZXJUZXh0ID0gJ1xcdTI1QjYnOyAvLyBVbmljb2RlIGNoYXJhY3RlciBmb3IgYSByaWdodC1wb2ludGluZyB0cmlhbmdsZS5cbiAgaXRlbS5jbGFzc05hbWUgPSBndXR0ZXJNYXJrZXJDc3NDbGFzcztcbiAgbGV0IHBvcHVwRWxlbWVudCA9IG51bGw7XG4gIGxldCBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gIGxldCBkaXNwb3NlVGltZW91dCA9IG51bGw7XG4gIGNvbnN0IGNsZWFyRGlzcG9zZVRpbWVvdXQgPSAoKSA9PiB7XG4gICAgaWYgKGRpc3Bvc2VUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQoZGlzcG9zZVRpbWVvdXQpO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgZGlzcG9zZSA9ICgpID0+IHtcbiAgICBpZiAocG9wdXBFbGVtZW50KSB7XG4gICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHBvcHVwRWxlbWVudCk7XG4gICAgICBwb3B1cEVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwb3B1cEVsZW1lbnQpO1xuICAgICAgcG9wdXBFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHBhbmVJdGVtU3Vic2NyaXB0aW9uKSB7XG4gICAgICBwYW5lSXRlbVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGNsZWFyRGlzcG9zZVRpbWVvdXQoKTtcbiAgfTtcbiAgY29uc3QgZ29Ub0xvY2F0aW9uID0gKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiB7XG4gICAgLy8gQmVmb3JlIHdlIGp1bXAgdG8gdGhlIGxvY2F0aW9uLCB3ZSB3YW50IHRvIGNsb3NlIHRoZSBwb3B1cC5cbiAgICBkaXNwb3NlKCk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgICAgaW5pdGlhbExpbmU6IGxpbmUsXG4gICAgfTtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIG9wdGlvbnMpO1xuICB9O1xuICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBldmVudCA9PiB7XG4gICAgLy8gSWYgdGhlcmUgd2FzIHNvbWVob3cgYW5vdGhlciBwb3B1cCBmb3IgdGhpcyBndXR0ZXIgaXRlbSwgZGlzcG9zZSBpdC4gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZVxuICAgIC8vIHVzZXIgbWFuYWdlcyB0byBzY3JvbGwgYW5kIGVzY2FwZSBkaXNwb3NhbC5cbiAgICBkaXNwb3NlKCk7XG4gICAgcG9wdXBFbGVtZW50ID0gc2hvd1BvcHVwRm9yKG1lc3NhZ2VzLCBpdGVtLCBnb1RvTG9jYXRpb24sIGZpeGVyKTtcbiAgICBwb3B1cEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGRpc3Bvc2UpO1xuICAgIHBvcHVwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgY2xlYXJEaXNwb3NlVGltZW91dCk7XG4gICAgLy8gVGhpcyBtYWtlcyBzdXJlIHRoYXQgdGhlIHBvcHVwIGRpc2FwcGVhcnMgd2hlbiB5b3UgY3RybCt0YWIgdG8gc3dpdGNoIHRhYnMuXG4gICAgcGFuZUl0ZW1TdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKGRpc3Bvc2UpO1xuICB9KTtcbiAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZXZlbnQgPT4ge1xuICAgIC8vIFdoZW4gdGhlIHBvcHVwIGlzIHNob3duLCB3ZSB3YW50IHRvIGRpc3Bvc2UgaXQgaWYgdGhlIHVzZXIgbWFuYWdlcyB0byBtb3ZlIHRoZSBjdXJzb3Igb2ZmIG9mXG4gICAgLy8gdGhlIGd1dHRlciBnbHlwaCB3aXRob3V0IG1vdmluZyBpdCBvbnRvIHRoZSBwb3B1cC4gRXZlbiB0aG91Z2ggdGhlIHBvcHVwIGFwcGVhcnMgYWJvdmUgKGFzIGluXG4gICAgLy8gWi1pbmRleCBhYm92ZSkgdGhlIGd1dHRlciBnbHlwaCwgaWYgeW91IG1vdmUgdGhlIGN1cnNvciBzdWNoIHRoYXQgaXQgaXMgb25seSBhYm92ZSB0aGUgZ2x5cGhcbiAgICAvLyBmb3Igb25lIGZyYW1lIHlvdSBjYW4gY2F1c2UgdGhlIHBvcHVwIHRvIGFwcGVhciB3aXRob3V0IHRoZSBtb3VzZSBldmVyIGVudGVyaW5nIGl0LlxuICAgIGRpc3Bvc2VUaW1lb3V0ID0gc2V0VGltZW91dChkaXNwb3NlLCBQT1BVUF9ESVNQT1NFX1RJTUVPVVQpO1xuICB9KTtcbiAgcmV0dXJuIHtpdGVtLCBkaXNwb3NlfTtcbn1cblxuLyoqXG4gKiBTaG93cyBhIHBvcHVwIGZvciB0aGUgZGlhZ25vc3RpYyBqdXN0IGJlbG93IHRoZSBzcGVjaWZpZWQgaXRlbS5cbiAqL1xuZnVuY3Rpb24gc2hvd1BvcHVwRm9yKFxuICAgIG1lc3NhZ2VzOiBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+LFxuICAgIGl0ZW06IEhUTUxFbGVtZW50LFxuICAgIGdvVG9Mb2NhdGlvbjogKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCBsaW5lOiBudW1iZXIpID0+IG1peGVkLFxuICAgIGZpeGVyOiAobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKSA9PiB2b2lkLFxuICAgICk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgY2hpbGRyZW4gPSBtZXNzYWdlcy5tYXAobWVzc2FnZSA9PiB7XG4gICAgY29uc3QgY29udGVudHMgPSBjcmVhdGVFbGVtZW50Rm9yTWVzc2FnZShtZXNzYWdlLCBnb1RvTG9jYXRpb24sIGZpeGVyKTtcbiAgICBjb25zdCBkaWFnbm9zdGljVHlwZUNsYXNzID0gbWVzc2FnZS50eXBlID09PSAnRXJyb3InXG4gICAgICA/ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cC1lcnJvcidcbiAgICAgIDogJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwLXdhcm5pbmcnO1xuICAgIC8vIG5hdGl2ZS1rZXktYmluZGluZ3MgYW5kIHRhYkluZGV4PS0xIGFyZSBib3RoIG5lZWRlZCB0byBhbGxvdyBjb3B5aW5nIHRoZSB0ZXh0IGluIHRoZSBwb3B1cC5cbiAgICBjb25zdCBjbGFzc2VzID1cbiAgICAgIGBuYXRpdmUta2V5LWJpbmRpbmdzIG51Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwLWRpYWdub3N0aWMgJHtkaWFnbm9zdGljVHlwZUNsYXNzfWA7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgdGFiSW5kZXg9ey0xfSBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICB7Y29udGVudHN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9KTtcbiAgLy8gVGhlIHBvcHVwIHdpbGwgYmUgYW4gYWJzb2x1dGVseSBwb3NpdGlvbmVkIGNoaWxkIGVsZW1lbnQgb2YgPGF0b20td29ya3NwYWNlPiBzbyB0aGF0IGl0IGFwcGVhcnNcbiAgLy8gb24gdG9wIG9mIGV2ZXJ5dGhpbmcuXG4gIGNvbnN0IHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICBjb25zdCBob3N0RWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgd29ya3NwYWNlRWxlbWVudC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGhvc3RFbGVtZW50KTtcblxuICAvLyBNb3ZlIGl0IGRvd24gdmVydGljYWxseSBzbyBpdCBkb2VzIG5vdCBlbmQgdXAgdW5kZXIgdGhlIG1vdXNlIHBvaW50ZXIuXG4gIGNvbnN0IHt0b3AsIGxlZnR9ID0gaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICBSZWFjdC5yZW5kZXIoXG4gICAgPERpYWdub3N0aWNzUG9wdXAgbGVmdD17bGVmdH0gdG9wPXt0b3B9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvRGlhZ25vc3RpY3NQb3B1cD4sXG4gICAgaG9zdEVsZW1lbnQpO1xuXG4gIC8vIENoZWNrIHRvIHNlZSB3aGV0aGVyIHRoZSBwb3B1cCBpcyB3aXRoaW4gdGhlIGJvdW5kcyBvZiB0aGUgVGV4dEVkaXRvci4gSWYgbm90LCBkaXNwbGF5IGl0IGFib3ZlXG4gIC8vIHRoZSBnbHlwaCByYXRoZXIgdGhhbiBiZWxvdyBpdC5cbiAgY29uc3QgZWRpdG9yID0gaXRlbVRvRWRpdG9yLmdldChpdGVtKTtcbiAgY29uc3QgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpO1xuICBjb25zdCB7dG9wOiBlZGl0b3JUb3AsIGhlaWdodDogZWRpdG9ySGVpZ2h0fSA9IGVkaXRvckVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGNvbnN0IHt0b3A6IGl0ZW1Ub3AsIGhlaWdodDogaXRlbUhlaWdodH0gPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBwb3B1cEhlaWdodCA9IGhvc3RFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkLmNsaWVudEhlaWdodDtcbiAgaWYgKChpdGVtVG9wICsgaXRlbUhlaWdodCArIHBvcHVwSGVpZ2h0KSA+IChlZGl0b3JUb3AgKyBlZGl0b3JIZWlnaHQpKSB7XG4gICAgY29uc3QgcG9wdXBFbGVtZW50ID0gaG9zdEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgLy8gU2hpZnQgdGhlIHBvcHVwIGJhY2sgZG93biBieSBHTFlQSF9IRUlHSFQsIHNvIHRoYXQgdGhlIGJvdHRvbSBwYWRkaW5nIG92ZXJsYXBzIHdpdGggdGhlXG4gICAgLy8gZ2x5cGguIEFuIGFkZGl0aW9uYWwgNCBweCBpcyBuZWVkZWQgdG8gbWFrZSBpdCBsb29rIHRoZSBzYW1lIHdheSBpdCBkb2VzIHdoZW4gaXQgc2hvd3MgdXBcbiAgICAvLyBiZWxvdy4gSSBkb24ndCBrbm93IHdoeS5cbiAgICBwb3B1cEVsZW1lbnQuc3R5bGUudG9wID0gU3RyaW5nKGl0ZW1Ub3AgLSBwb3B1cEhlaWdodCArIEdMWVBIX0hFSUdIVCArIDQpICsgJ3B4JztcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGhvc3RFbGVtZW50O1xuICB9IGZpbmFsbHkge1xuICAgIG1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICB0cmFjaygnZGlhZ25vc3RpY3MtZ3V0dGVyLXNob3ctcG9wdXAnLCB7XG4gICAgICAgICdkaWFnbm9zdGljcy1wcm92aWRlcic6IG1lc3NhZ2UucHJvdmlkZXJOYW1lLFxuICAgICAgICAnZGlhZ25vc3RpY3MtbWVzc2FnZSc6IG1lc3NhZ2UudGV4dCB8fCBtZXNzYWdlLmh0bWwgfHwgJycsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Rm9yTWVzc2FnZShcbiAgbWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBnb1RvTG9jYXRpb246IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4gbWl4ZWQsXG4gIGZpeGVyOiAobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKSA9PiB2b2lkLFxuKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBwcm92aWRlckNsYXNzTmFtZSA9IG1lc3NhZ2UudHlwZSA9PT0gJ0Vycm9yJ1xuICAgID8gJ2hpZ2hsaWdodC1lcnJvcidcbiAgICA6ICdoaWdobGlnaHQtd2FybmluZyc7XG4gIGNvbnN0IGNvcHkgPSAoKSA9PiB7XG4gICAgY29uc3QgdGV4dCA9IHBsYWluVGV4dEZvckRpYWdub3N0aWMobWVzc2FnZSk7XG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dCk7XG4gIH07XG4gIGxldCBmaXhCdXR0b24gPSBudWxsO1xuICBpZiAobWVzc2FnZS5maXggIT0gbnVsbCAmJiBmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1kaWFnbm9zdGljcy11aS5lbmFibGVBdXRvZml4JykpIHtcbiAgICBjb25zdCBhcHBseUZpeCA9IGZpeGVyLmJpbmQobnVsbCwgbWVzc2FnZSk7XG4gICAgZml4QnV0dG9uID0gKFxuICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXhzXCIgb25DbGljaz17YXBwbHlGaXh9PkZpeDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbiAgY29uc3QgaGVhZGVyID0gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtaGVhZGVyXCI+XG4gICAgICB7Zml4QnV0dG9ufVxuICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXhzXCIgb25DbGljaz17Y29weX0+Q29weTwvYnV0dG9uPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgcHVsbC1yaWdodCAke3Byb3ZpZGVyQ2xhc3NOYW1lfWB9PnttZXNzYWdlLnByb3ZpZGVyTmFtZX08L3NwYW4+XG4gICAgPC9kaXY+XG4gICk7XG4gIGNvbnN0IHRyYWNlRWxlbWVudHMgPSBtZXNzYWdlLnRyYWNlXG4gICAgPyBtZXNzYWdlLnRyYWNlLm1hcCh0cmFjZUl0ZW0gPT4gY3JlYXRlRWxlbWVudEZvclRyYWNlKHRyYWNlSXRlbSwgZ29Ub0xvY2F0aW9uKSlcbiAgICA6IG51bGw7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtoZWFkZXJ9XG4gICAgICA8ZGl2PntjcmVhdGVNZXNzYWdlU3BhbihtZXNzYWdlKX08L2Rpdj5cbiAgICAgIHt0cmFjZUVsZW1lbnRzfVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBwbGFpblRleHRGb3JEaWFnbm9zdGljKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIGNvbnN0IHtnZXRQYXRofSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbiAgZnVuY3Rpb24gcGxhaW5UZXh0Rm9ySXRlbShpdGVtOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UgfCBUcmFjZSk6IHN0cmluZyB7XG4gICAgbGV0IG1haW5Db21wb25lbnQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGl0ZW0uaHRtbCAhPSBudWxsKSB7XG4gICAgICAvLyBRdWljayBhbmQgZGlydHkgd2F5IHRvIGdldCBhbiBhcHByb3hpbWF0aW9uIGZvciB0aGUgcGxhaW4gdGV4dCBmcm9tIEhUTUwuIFRoaXMgd2lsbCB3b3JrIGluXG4gICAgICAvLyBzaW1wbGUgY2FzZXMsIGFueXdheS5cbiAgICAgIG1haW5Db21wb25lbnQgPSBpdGVtLmh0bWwucmVwbGFjZSgnPGJyLz4nLCAnXFxuJykucmVwbGFjZSgvPFtePl0qPi9nLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudChpdGVtLnRleHQgIT0gbnVsbCk7XG4gICAgICBtYWluQ29tcG9uZW50ID0gaXRlbS50ZXh0O1xuICAgIH1cblxuICAgIGxldCBwYXRoQ29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChpdGVtLmZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgIHBhdGhDb21wb25lbnQgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGluZUNvbXBvbmVudCA9IGl0ZW0ucmFuZ2UgIT0gbnVsbCA/IGA6JHtpdGVtLnJhbmdlLnN0YXJ0LnJvdyArIDF9YCA6ICcnO1xuICAgICAgcGF0aENvbXBvbmVudCA9ICc6ICcgKyBnZXRQYXRoKGl0ZW0uZmlsZVBhdGgpICsgbGluZUNvbXBvbmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFpbkNvbXBvbmVudCArIHBhdGhDb21wb25lbnQ7XG4gIH1cbiAgY29uc3QgdHJhY2UgPSBtZXNzYWdlLnRyYWNlICE9IG51bGwgPyBtZXNzYWdlLnRyYWNlIDogW107XG4gIHJldHVybiBbbWVzc2FnZSwgLi4udHJhY2VdLm1hcChwbGFpblRleHRGb3JJdGVtKS5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEZvclRyYWNlKFxuICB0cmFjZTogVHJhY2UsXG4gIGdvVG9Mb2NhdGlvbjogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbik6IEhUTUxFbGVtZW50IHtcbiAgbGV0IGxvY1NwYW4gPSBudWxsO1xuICAvLyBMb2NhbCB2YXJpYWJsZSBzbyB0aGF0IHRoZSB0eXBlIHJlZmluZW1lbnQgaG9sZHMgaW4gdGhlIG9uQ2xpY2sgaGFuZGxlci5cbiAgY29uc3QgcGF0aCA9IHRyYWNlLmZpbGVQYXRoO1xuICBpZiAocGF0aCkge1xuICAgIGNvbnN0IFssIHJlbGF0aXZlUGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgocGF0aCk7XG4gICAgbGV0IGxvY1N0cmluZyA9IHJlbGF0aXZlUGF0aDtcbiAgICBpZiAodHJhY2UucmFuZ2UpIHtcbiAgICAgIGxvY1N0cmluZyArPSBgOiR7dHJhY2UucmFuZ2Uuc3RhcnQucm93ICsgMX1gO1xuICAgIH1cbiAgICBjb25zdCBvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgdHJhY2soJ2RpYWdub3N0aWNzLWd1dHRlci1nb3RvLWxvY2F0aW9uJyk7XG4gICAgICBnb1RvTG9jYXRpb24ocGF0aCwgTWF0aC5tYXgodHJhY2UucmFuZ2UgPyB0cmFjZS5yYW5nZS5zdGFydC5yb3cgOiAwLCAwKSk7XG4gICAgfTtcbiAgICBsb2NTcGFuID0gPHNwYW4+OiA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e29uQ2xpY2t9Pntsb2NTdHJpbmd9PC9hPjwvc3Bhbj47XG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAge2NyZWF0ZU1lc3NhZ2VTcGFuKHRyYWNlKX1cbiAgICAgIHtsb2NTcGFufVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNZXNzYWdlU3BhbihtZXNzYWdlOiB7aHRtbD86IHN0cmluZywgdGV4dD86IHN0cmluZ30pOiBIVE1MRWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmh0bWwgIT0gbnVsbCkge1xuICAgIHJldHVybiA8c3BhbiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogbWVzc2FnZS5odG1sfX0gLz47XG4gIH0gZWxzZSBpZiAobWVzc2FnZS50ZXh0ICE9IG51bGwpIHtcbiAgICByZXR1cm4gPHNwYW4+e21lc3NhZ2UudGV4dH08L3NwYW4+O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA8c3Bhbj5EaWFnbm9zdGljIGxhY2tzIG1lc3NhZ2UuPC9zcGFuPjtcbiAgfVxufVxuXG5jbGFzcyBEaWFnbm9zdGljc1BvcHVwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXBcIlxuICAgICAgICBzdHlsZT17e2xlZnQ6IHRoaXMucHJvcHMubGVmdCArICdweCcsIHRvcDogdGhpcy5wcm9wcy50b3AgKyAncHgnfX1cbiAgICAgICAgPlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuRGlhZ25vc3RpY3NQb3B1cC5wcm9wVHlwZXMgPSB7XG4gIGNoaWxkcmVuOiBQcm9wVHlwZXMubm9kZSxcbiAgbGVmdDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB0b3A6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbn07XG4iXX0=