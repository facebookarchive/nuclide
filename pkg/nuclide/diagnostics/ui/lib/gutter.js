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
//# sourceMappingURL=data:application/json;base64,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QUMsUUFBUTtPQUNoQixDQUNOO0tBQ0g7OztXQWZrQjtBQUNqQixjQUFRLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDeEIsVUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNqQyxTQUFHLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0tBQ2pDOzs7O1NBTEcsZ0JBQWdCO0dBQVMsS0FBSyxDQUFDLFNBQVMiLCJmaWxlIjoiZ3V0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBGaWxlTWVzc2FnZVVwZGF0ZSxcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBUcmFjZSxcbn0gZnJvbSAnLi4vLi4vYmFzZSc7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vLi4vYW5hbHl0aWNzJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IEdVVFRFUl9JRCA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlcic7XG5cbi8vIE5lZWRzIHRvIGJlIHRoZSBzYW1lIGFzIGdseXBoLWhlaWdodCBpbiBndXR0ZXIuYXRvbS10ZXh0LWVkaXRvci5sZXNzLlxuY29uc3QgR0xZUEhfSEVJR0hUID0gMTU7IC8vIHB4XG5cbmNvbnN0IFBPUFVQX0RJU1BPU0VfVElNRU9VVCA9IDEwMDtcblxuLy8gVE9ETyhtYm9saW4pOiBNYWtlIGl0IHNvIHRoYXQgd2hlbiBtb3VzaW5nIG92ZXIgYW4gZWxlbWVudCB3aXRoIHRoaXMgQ1NTIGNsYXNzIChvciBzcGVjaWZpY2FsbHksXG4vLyB0aGUgY2hpbGQgZWxlbWVudCB3aXRoIHRoZSBcInJlZ2lvblwiIENTUyBjbGFzcyksIHdlIGFsc28gZG8gYSBzaG93UG9wdXBGb3IoKS4gVGhpcyBzZWVtcyB0byBiZVxuLy8gdHJpY2t5IGdpdmVuIGhvdyB0aGUgRE9NIG9mIGEgVGV4dEVkaXRvciB3b3JrcyB0b2RheS4gVGhlcmUgYXJlIGRpdi50aWxlIGVsZW1lbnRzLCBlYWNoIG9mIHdoaWNoXG4vLyBoYXMgaXRzIG93biBkaXYuaGlnaGxpZ2h0cyBlbGVtZW50IGFuZCBtYW55IGRpdi5saW5lIGVsZW1lbnRzLiBUaGUgZGl2LmhpZ2hsaWdodHMgZWxlbWVudCBoYXMgMFxuLy8gb3IgbW9yZSBjaGlsZHJlbiwgZWFjaCBjaGlsZCBiZWluZyBhIGRpdi5oaWdobGlnaHQgd2l0aCBhIGNoaWxkIGRpdi5yZWdpb24uIFRoZSBkaXYucmVnaW9uXG4vLyBlbGVtZW50IGlzIGRlZmluZWQgdG8gYmUge3Bvc2l0aW9uOiBhYnNvbHV0ZTsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHotaW5kZXg6IC0xfS4gVGhlIGFic29sdXRlXG4vLyBwb3NpdGlvbmluZyBhbmQgbmVnYXRpdmUgei1pbmRleCBtYWtlIGl0IHNvIGl0IGlzbid0IGVsaWdpYmxlIGZvciBtb3VzZW92ZXIgZXZlbnRzLCBzbyB3ZVxuLy8gbWlnaHQgaGF2ZSB0byBsaXN0ZW4gZm9yIG1vdXNlb3ZlciBldmVudHMgb24gVGV4dEVkaXRvciBhbmQgdGhlbiB1c2UgaXRzIG93biBBUElzLCBzdWNoIGFzXG4vLyBkZWNvcmF0aW9uc0ZvclNjcmVlblJvd1JhbmdlKCksIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGhpdCB0YXJnZXQgaW5zdGVhZC4gU2luY2UgdGhpcyB3aWxsIGJlXG4vLyBoYXBwZW5pbmcgb25tb3VzZW1vdmUsIHdlIGFsc28gaGF2ZSB0byBiZSBjYXJlZnVsIHRvIG1ha2Ugc3VyZSB0aGlzIGlzIG5vdCBleHBlbnNpdmUuXG5jb25zdCBISUdITElHSFRfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWhpZ2hsaWdodCc7XG5cbmNvbnN0IEVSUk9SX0hJR0hMSUdIVF9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktaGlnaGxpZ2h0LWVycm9yJztcbmNvbnN0IFdBUk5JTkdfSElHSExJR0hUX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1oaWdobGlnaHQtd2FybmluZyc7XG5cbmNvbnN0IEVSUk9SX0dVVFRFUl9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktZ3V0dGVyLWVycm9yJztcbmNvbnN0IFdBUk5JTkdfR1VUVEVSX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1ndXR0ZXItd2FybmluZyc7XG5cbmNvbnN0IGVkaXRvclRvTWFya2VyczogV2Vha01hcDxUZXh0RWRpdG9yLCBTZXQ8YXRvbSRNYXJrZXI+PiA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdGVtVG9FZGl0b3I6IFdlYWtNYXA8SFRNTEVsZW1lbnQsIFRleHRFZGl0b3I+ID0gbmV3IFdlYWtNYXAoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VXBkYXRlVG9FZGl0b3IoXG4gIGVkaXRvcjogVGV4dEVkaXRvcixcbiAgdXBkYXRlOiBGaWxlTWVzc2FnZVVwZGF0ZSxcbiAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4pOiB2b2lkIHtcbiAgbGV0IGd1dHRlciA9IGVkaXRvci5ndXR0ZXJXaXRoTmFtZShHVVRURVJfSUQpO1xuICBpZiAoIWd1dHRlcikge1xuICAgIC8vIFRPRE8oamVzc2ljYWxpbik6IERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBwcmlvcml0eSBzbyB0aGF0IHRoZSBndXR0ZXI6XG4gICAgLy8gKDEpIFNob3dzIHVwIHRvIHRoZSByaWdodCBvZiB0aGUgbGluZSBudW1iZXJzLlxuICAgIC8vICgyKSBTaG93cyB0aGUgaXRlbXMgdGhhdCBhcmUgYWRkZWQgdG8gaXQgcmlnaHQgYXdheS5cbiAgICAvLyBVc2luZyBhIHZhbHVlIG9mIDEwIGZpeGVzICgxKSwgYnV0IGJyZWFrcyAoMikuIFRoaXMgc2VlbXMgbGlrZSBpdCBpcyBsaWtlbHkgYSBidWcgaW4gQXRvbS5cblxuICAgIC8vIEJ5IGRlZmF1bHQsIGEgZ3V0dGVyIHdpbGwgYmUgZGVzdHJveWVkIHdoZW4gaXRzIGVkaXRvciBpcyBkZXN0cm95ZWQsXG4gICAgLy8gc28gdGhlcmUgaXMgbm8gbmVlZCB0byByZWdpc3RlciBhIGNhbGxiYWNrIHZpYSBvbkRpZERlc3Ryb3koKS5cbiAgICBndXR0ZXIgPSBlZGl0b3IuYWRkR3V0dGVyKHtcbiAgICAgIG5hbWU6IEdVVFRFUl9JRCxcbiAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgbGV0IG1hcmtlcjtcbiAgbGV0IG1hcmtlcnMgPSBlZGl0b3JUb01hcmtlcnMuZ2V0KGVkaXRvcik7XG5cbiAgLy8gVE9ETzogQ29uc2lkZXIgYSBtb3JlIGVmZmljaWVudCBzdHJhdGVneSB0aGF0IGRvZXMgbm90IGJsaW5kbHkgZGVzdHJveSBhbGwgb2YgdGhlXG4gIC8vIGV4aXN0aW5nIG1hcmtlcnMuXG4gIGlmIChtYXJrZXJzKSB7XG4gICAgZm9yIChtYXJrZXIgb2YgbWFya2Vycykge1xuICAgICAgbWFya2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgbWFya2Vycy5jbGVhcigpO1xuICB9IGVsc2Uge1xuICAgIG1hcmtlcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBjb25zdCByb3dUb01lc3NhZ2U6IE1hcDxudW1iZXIsIEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+ID0gbmV3IE1hcCgpO1xuICBmdW5jdGlvbiBhZGRNZXNzYWdlRm9yUm93KG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSwgcm93OiBudW1iZXIpIHtcbiAgICBsZXQgbWVzc2FnZXMgPSByb3dUb01lc3NhZ2UuZ2V0KHJvdyk7XG4gICAgaWYgKCFtZXNzYWdlcykge1xuICAgICAgbWVzc2FnZXMgPSBbXTtcbiAgICAgIHJvd1RvTWVzc2FnZS5zZXQocm93LCBtZXNzYWdlcyk7XG4gICAgfVxuICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgdXBkYXRlLm1lc3NhZ2VzKSB7XG4gICAgY29uc3QgcmFuZ2UgPSBtZXNzYWdlLnJhbmdlO1xuICAgIGxldCBoaWdobGlnaHRNYXJrZXI7XG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICBhZGRNZXNzYWdlRm9yUm93KG1lc3NhZ2UsIHJhbmdlLnN0YXJ0LnJvdyk7XG4gICAgICBoaWdobGlnaHRNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkTWVzc2FnZUZvclJvdyhtZXNzYWdlLCAwKTtcbiAgICB9XG5cbiAgICBsZXQgaGlnaGxpZ2h0Q3NzQ2xhc3M7XG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0Vycm9yJykge1xuICAgICAgaGlnaGxpZ2h0Q3NzQ2xhc3MgPSBISUdITElHSFRfQ1NTICsgJyAnICsgRVJST1JfSElHSExJR0hUX0NTUztcbiAgICB9IGVsc2Uge1xuICAgICAgaGlnaGxpZ2h0Q3NzQ2xhc3MgPSBISUdITElHSFRfQ1NTICsgJyAnICsgV0FSTklOR19ISUdITElHSFRfQ1NTO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWFya2VyIHVuZGVybGluZXMgdGV4dC5cbiAgICBpZiAoaGlnaGxpZ2h0TWFya2VyKSB7XG4gICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoaGlnaGxpZ2h0TWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogaGlnaGxpZ2h0Q3NzQ2xhc3MsXG4gICAgICB9KTtcbiAgICAgIG1hcmtlcnMuYWRkKGhpZ2hsaWdodE1hcmtlcik7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCBhbGwgb2YgdGhlIGd1dHRlciBtYXJrZXJzIGZvciB0aGUgc2FtZSByb3cgYW5kIGNvbWJpbmUgdGhlbSBpbnRvIG9uZSBtYXJrZXIvcG9wdXAuXG4gIGZvciAoY29uc3QgW3JvdywgbWVzc2FnZXNdIG9mIHJvd1RvTWVzc2FnZS5lbnRyaWVzKCkpIHtcbiAgICAvLyBJZiBhdCBsZWFzdCBvbmUgb2YgdGhlIGRpYWdub3N0aWNzIGlzIGFuIGVycm9yIHJhdGhlciB0aGFuIHRoZSB3YXJuaW5nLFxuICAgIC8vIGRpc3BsYXkgdGhlIGdseXBoIGluIHRoZSBndXR0ZXIgdG8gcmVwcmVzZW50IGFuIGVycm9yIHJhdGhlciB0aGFuIGEgd2FybmluZy5cbiAgICBjb25zdCBndXR0ZXJNYXJrZXJDc3NDbGFzcyA9IG1lc3NhZ2VzLnNvbWUobXNnID0+IG1zZy50eXBlID09PSAnRXJyb3InKVxuICAgICAgPyBFUlJPUl9HVVRURVJfQ1NTXG4gICAgICA6IFdBUk5JTkdfR1VUVEVSX0NTUztcblxuICAgIC8vIFRoaXMgbWFya2VyIGFkZHMgc29tZSBVSSB0byB0aGUgZ3V0dGVyLlxuICAgIGNvbnN0IHtpdGVtLCBkaXNwb3NlfSA9IGNyZWF0ZUd1dHRlckl0ZW0obWVzc2FnZXMsIGd1dHRlck1hcmtlckNzc0NsYXNzLCBmaXhlcik7XG4gICAgaXRlbVRvRWRpdG9yLnNldChpdGVtLCBlZGl0b3IpO1xuICAgIGNvbnN0IGd1dHRlck1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oW3JvdywgMF0pO1xuICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihndXR0ZXJNYXJrZXIsIHtpdGVtfSk7XG4gICAgZ3V0dGVyTWFya2VyLm9uRGlkRGVzdHJveShkaXNwb3NlKTtcbiAgICBtYXJrZXJzLmFkZChndXR0ZXJNYXJrZXIpO1xuICB9XG5cbiAgZWRpdG9yVG9NYXJrZXJzLnNldChlZGl0b3IsIG1hcmtlcnMpO1xuXG4gIC8vIE9uY2UgdGhlIGd1dHRlciBpcyBzaG93biBmb3IgdGhlIGZpcnN0IHRpbWUsIGl0IGlzIGRpc3BsYXllZCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZVxuICAvLyBUZXh0RWRpdG9yLlxuICBpZiAodXBkYXRlLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBndXR0ZXIuc2hvdygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUd1dHRlckl0ZW0oXG4gIG1lc3NhZ2VzOiBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+LFxuICBndXR0ZXJNYXJrZXJDc3NDbGFzczogc3RyaW5nLFxuICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZCxcbik6IHtpdGVtOiBIVE1MRWxlbWVudDsgZGlzcG9zZTogKCkgPT4gdm9pZH0ge1xuICBjb25zdCBpdGVtID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgaXRlbS5pbm5lclRleHQgPSAnXFx1MjVCNic7IC8vIFVuaWNvZGUgY2hhcmFjdGVyIGZvciBhIHJpZ2h0LXBvaW50aW5nIHRyaWFuZ2xlLlxuICBpdGVtLmNsYXNzTmFtZSA9IGd1dHRlck1hcmtlckNzc0NsYXNzO1xuICBsZXQgcG9wdXBFbGVtZW50ID0gbnVsbDtcbiAgbGV0IHBhbmVJdGVtU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgbGV0IGRpc3Bvc2VUaW1lb3V0ID0gbnVsbDtcbiAgY29uc3QgY2xlYXJEaXNwb3NlVGltZW91dCA9ICgpID0+IHtcbiAgICBpZiAoZGlzcG9zZVRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dChkaXNwb3NlVGltZW91dCk7XG4gICAgfVxuICB9O1xuICBjb25zdCBkaXNwb3NlID0gKCkgPT4ge1xuICAgIGlmIChwb3B1cEVsZW1lbnQpIHtcbiAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUocG9wdXBFbGVtZW50KTtcbiAgICAgIHBvcHVwRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHBvcHVwRWxlbWVudCk7XG4gICAgICBwb3B1cEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAocGFuZUl0ZW1TdWJzY3JpcHRpb24pIHtcbiAgICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgY2xlYXJEaXNwb3NlVGltZW91dCgpO1xuICB9O1xuICBjb25zdCBnb1RvTG9jYXRpb24gPSAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IHtcbiAgICAvLyBCZWZvcmUgd2UganVtcCB0byB0aGUgbG9jYXRpb24sIHdlIHdhbnQgdG8gY2xvc2UgdGhlIHBvcHVwLlxuICAgIGRpc3Bvc2UoKTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICBpbml0aWFsTGluZTogbGluZSxcbiAgICB9O1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwgb3B0aW9ucyk7XG4gIH07XG4gIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGV2ZW50ID0+IHtcbiAgICAvLyBJZiB0aGVyZSB3YXMgc29tZWhvdyBhbm90aGVyIHBvcHVwIGZvciB0aGlzIGd1dHRlciBpdGVtLCBkaXNwb3NlIGl0LiBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlXG4gICAgLy8gdXNlciBtYW5hZ2VzIHRvIHNjcm9sbCBhbmQgZXNjYXBlIGRpc3Bvc2FsLlxuICAgIGRpc3Bvc2UoKTtcbiAgICBwb3B1cEVsZW1lbnQgPSBzaG93UG9wdXBGb3IobWVzc2FnZXMsIGl0ZW0sIGdvVG9Mb2NhdGlvbiwgZml4ZXIpO1xuICAgIHBvcHVwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZGlzcG9zZSk7XG4gICAgcG9wdXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBjbGVhckRpc3Bvc2VUaW1lb3V0KTtcbiAgICAvLyBUaGlzIG1ha2VzIHN1cmUgdGhhdCB0aGUgcG9wdXAgZGlzYXBwZWFycyB3aGVuIHlvdSBjdHJsK3RhYiB0byBzd2l0Y2ggdGFicy5cbiAgICBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oZGlzcG9zZSk7XG4gIH0pO1xuICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBldmVudCA9PiB7XG4gICAgLy8gV2hlbiB0aGUgcG9wdXAgaXMgc2hvd24sIHdlIHdhbnQgdG8gZGlzcG9zZSBpdCBpZiB0aGUgdXNlciBtYW5hZ2VzIHRvIG1vdmUgdGhlIGN1cnNvciBvZmYgb2ZcbiAgICAvLyB0aGUgZ3V0dGVyIGdseXBoIHdpdGhvdXQgbW92aW5nIGl0IG9udG8gdGhlIHBvcHVwLiBFdmVuIHRob3VnaCB0aGUgcG9wdXAgYXBwZWFycyBhYm92ZSAoYXMgaW5cbiAgICAvLyBaLWluZGV4IGFib3ZlKSB0aGUgZ3V0dGVyIGdseXBoLCBpZiB5b3UgbW92ZSB0aGUgY3Vyc29yIHN1Y2ggdGhhdCBpdCBpcyBvbmx5IGFib3ZlIHRoZSBnbHlwaFxuICAgIC8vIGZvciBvbmUgZnJhbWUgeW91IGNhbiBjYXVzZSB0aGUgcG9wdXAgdG8gYXBwZWFyIHdpdGhvdXQgdGhlIG1vdXNlIGV2ZXIgZW50ZXJpbmcgaXQuXG4gICAgZGlzcG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGRpc3Bvc2UsIFBPUFVQX0RJU1BPU0VfVElNRU9VVCk7XG4gIH0pO1xuICByZXR1cm4ge2l0ZW0sIGRpc3Bvc2V9O1xufVxuXG4vKipcbiAqIFNob3dzIGEgcG9wdXAgZm9yIHRoZSBkaWFnbm9zdGljIGp1c3QgYmVsb3cgdGhlIHNwZWNpZmllZCBpdGVtLlxuICovXG5mdW5jdGlvbiBzaG93UG9wdXBGb3IoXG4gICAgbWVzc2FnZXM6IEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4sXG4gICAgaXRlbTogSFRNTEVsZW1lbnQsXG4gICAgZ29Ub0xvY2F0aW9uOiAoZmlsZVBhdGg6IE51Y2xpZGVVcmksIGxpbmU6IG51bWJlcikgPT4gbWl4ZWQsXG4gICAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4gICAgKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBjaGlsZHJlbiA9IG1lc3NhZ2VzLm1hcChtZXNzYWdlID0+IHtcbiAgICBjb25zdCBjb250ZW50cyA9IGNyZWF0ZUVsZW1lbnRGb3JNZXNzYWdlKG1lc3NhZ2UsIGdvVG9Mb2NhdGlvbiwgZml4ZXIpO1xuICAgIGNvbnN0IGRpYWdub3N0aWNUeXBlQ2xhc3MgPSBtZXNzYWdlLnR5cGUgPT09ICdFcnJvcidcbiAgICAgID8gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwLWVycm9yJ1xuICAgICAgOiAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtd2FybmluZyc7XG4gICAgLy8gbmF0aXZlLWtleS1iaW5kaW5ncyBhbmQgdGFiSW5kZXg9LTEgYXJlIGJvdGggbmVlZGVkIHRvIGFsbG93IGNvcHlpbmcgdGhlIHRleHQgaW4gdGhlIHBvcHVwLlxuICAgIGNvbnN0IGNsYXNzZXMgPVxuICAgICAgYG5hdGl2ZS1rZXktYmluZGluZ3MgbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtZGlhZ25vc3RpYyAke2RpYWdub3N0aWNUeXBlQ2xhc3N9YDtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiB0YWJJbmRleD17LTF9IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgIHtjb250ZW50c31cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0pO1xuICAvLyBUaGUgcG9wdXAgd2lsbCBiZSBhbiBhYnNvbHV0ZWx5IHBvc2l0aW9uZWQgY2hpbGQgZWxlbWVudCBvZiA8YXRvbS13b3Jrc3BhY2U+IHNvIHRoYXQgaXQgYXBwZWFyc1xuICAvLyBvbiB0b3Agb2YgZXZlcnl0aGluZy5cbiAgY29uc3Qgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gIGNvbnN0IGhvc3RFbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB3b3Jrc3BhY2VFbGVtZW50LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoaG9zdEVsZW1lbnQpO1xuXG4gIC8vIE1vdmUgaXQgZG93biB2ZXJ0aWNhbGx5IHNvIGl0IGRvZXMgbm90IGVuZCB1cCB1bmRlciB0aGUgbW91c2UgcG9pbnRlci5cbiAgY29uc3Qge3RvcCwgbGVmdH0gPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gIFJlYWN0LnJlbmRlcihcbiAgICA8RGlhZ25vc3RpY3NQb3B1cCBsZWZ0PXtsZWZ0fSB0b3A9e3RvcH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9EaWFnbm9zdGljc1BvcHVwPixcbiAgICBob3N0RWxlbWVudCk7XG5cbiAgLy8gQ2hlY2sgdG8gc2VlIHdoZXRoZXIgdGhlIHBvcHVwIGlzIHdpdGhpbiB0aGUgYm91bmRzIG9mIHRoZSBUZXh0RWRpdG9yLiBJZiBub3QsIGRpc3BsYXkgaXQgYWJvdmVcbiAgLy8gdGhlIGdseXBoIHJhdGhlciB0aGFuIGJlbG93IGl0LlxuICBjb25zdCBlZGl0b3IgPSBpdGVtVG9FZGl0b3IuZ2V0KGl0ZW0pO1xuICBjb25zdCBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcik7XG4gIGNvbnN0IHt0b3A6IGVkaXRvclRvcCwgaGVpZ2h0OiBlZGl0b3JIZWlnaHR9ID0gZWRpdG9yRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgY29uc3Qge3RvcDogaXRlbVRvcCwgaGVpZ2h0OiBpdGVtSGVpZ2h0fSA9IGl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGNvbnN0IHBvcHVwSGVpZ2h0ID0gaG9zdEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuY2xpZW50SGVpZ2h0O1xuICBpZiAoKGl0ZW1Ub3AgKyBpdGVtSGVpZ2h0ICsgcG9wdXBIZWlnaHQpID4gKGVkaXRvclRvcCArIGVkaXRvckhlaWdodCkpIHtcbiAgICBjb25zdCBwb3B1cEVsZW1lbnQgPSBob3N0RWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAvLyBTaGlmdCB0aGUgcG9wdXAgYmFjayBkb3duIGJ5IEdMWVBIX0hFSUdIVCwgc28gdGhhdCB0aGUgYm90dG9tIHBhZGRpbmcgb3ZlcmxhcHMgd2l0aCB0aGVcbiAgICAvLyBnbHlwaC4gQW4gYWRkaXRpb25hbCA0IHB4IGlzIG5lZWRlZCB0byBtYWtlIGl0IGxvb2sgdGhlIHNhbWUgd2F5IGl0IGRvZXMgd2hlbiBpdCBzaG93cyB1cFxuICAgIC8vIGJlbG93LiBJIGRvbid0IGtub3cgd2h5LlxuICAgIHBvcHVwRWxlbWVudC5zdHlsZS50b3AgPSBTdHJpbmcoaXRlbVRvcCAtIHBvcHVwSGVpZ2h0ICsgR0xZUEhfSEVJR0hUICsgNCkgKyAncHgnO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gaG9zdEVsZW1lbnQ7XG4gIH0gZmluYWxseSB7XG4gICAgbWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIHRyYWNrKCdkaWFnbm9zdGljcy1ndXR0ZXItc2hvdy1wb3B1cCcsIHtcbiAgICAgICAgJ2RpYWdub3N0aWNzLXByb3ZpZGVyJzogbWVzc2FnZS5wcm92aWRlck5hbWUsXG4gICAgICAgICdkaWFnbm9zdGljcy1tZXNzYWdlJzogbWVzc2FnZS50ZXh0IHx8IG1lc3NhZ2UuaHRtbCB8fCAnJyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRGb3JNZXNzYWdlKFxuICBtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIGdvVG9Mb2NhdGlvbjogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbiAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4pOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IHByb3ZpZGVyQ2xhc3NOYW1lID0gbWVzc2FnZS50eXBlID09PSAnRXJyb3InXG4gICAgPyAnaGlnaGxpZ2h0LWVycm9yJ1xuICAgIDogJ2hpZ2hsaWdodC13YXJuaW5nJztcbiAgY29uc3QgY29weSA9ICgpID0+IHtcbiAgICBjb25zdCB0ZXh0ID0gcGxhaW5UZXh0Rm9yRGlhZ25vc3RpYyhtZXNzYWdlKTtcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KTtcbiAgfTtcbiAgbGV0IGZpeEJ1dHRvbiA9IG51bGw7XG4gIGlmIChtZXNzYWdlLmZpeCAhPSBudWxsKSB7XG4gICAgY29uc3QgYXBwbHlGaXggPSBmaXhlci5iaW5kKG51bGwsIG1lc3NhZ2UpO1xuICAgIGZpeEJ1dHRvbiA9IChcbiAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi14c1wiIG9uQ2xpY2s9e2FwcGx5Rml4fT5GaXg8L2J1dHRvbj5cbiAgICApO1xuICB9XG4gIGNvbnN0IGhlYWRlciA9IChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwLWhlYWRlclwiPlxuICAgICAge2ZpeEJ1dHRvbn1cbiAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi14c1wiIG9uQ2xpY2s9e2NvcHl9PkNvcHk8L2J1dHRvbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHB1bGwtcmlnaHQgJHtwcm92aWRlckNsYXNzTmFtZX1gfT57bWVzc2FnZS5wcm92aWRlck5hbWV9PC9zcGFuPlxuICAgIDwvZGl2PlxuICApO1xuICBjb25zdCB0cmFjZUVsZW1lbnRzID0gbWVzc2FnZS50cmFjZVxuICAgID8gbWVzc2FnZS50cmFjZS5tYXAodHJhY2VJdGVtID0+IGNyZWF0ZUVsZW1lbnRGb3JUcmFjZSh0cmFjZUl0ZW0sIGdvVG9Mb2NhdGlvbikpXG4gICAgOiBudWxsO1xuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICB7aGVhZGVyfVxuICAgICAgPGRpdj57Y3JlYXRlTWVzc2FnZVNwYW4obWVzc2FnZSl9PC9kaXY+XG4gICAgICB7dHJhY2VFbGVtZW50c31cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuZnVuY3Rpb24gcGxhaW5UZXh0Rm9yRGlhZ25vc3RpYyhtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpOiBzdHJpbmcge1xuICBjb25zdCB7Z2V0UGF0aH0gPSByZXF1aXJlKCcuLi8uLi8uLi9yZW1vdGUtdXJpJyk7XG4gIGZ1bmN0aW9uIHBsYWluVGV4dEZvckl0ZW0oaXRlbTogRmlsZURpYWdub3N0aWNNZXNzYWdlIHwgVHJhY2UpOiBzdHJpbmcge1xuICAgIGxldCBtYWluQ29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChpdGVtLmh0bWwgIT0gbnVsbCkge1xuICAgICAgLy8gUXVpY2sgYW5kIGRpcnR5IHdheSB0byBnZXQgYW4gYXBwcm94aW1hdGlvbiBmb3IgdGhlIHBsYWluIHRleHQgZnJvbSBIVE1MLiBUaGlzIHdpbGwgd29yayBpblxuICAgICAgLy8gc2ltcGxlIGNhc2VzLCBhbnl3YXkuXG4gICAgICBtYWluQ29tcG9uZW50ID0gaXRlbS5odG1sLnJlcGxhY2UoJzxici8+JywgJ1xcbicpLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnZhcmlhbnQoaXRlbS50ZXh0ICE9IG51bGwpO1xuICAgICAgbWFpbkNvbXBvbmVudCA9IGl0ZW0udGV4dDtcbiAgICB9XG5cbiAgICBsZXQgcGF0aENvbXBvbmVudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoaXRlbS5maWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICBwYXRoQ29tcG9uZW50ID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxpbmVDb21wb25lbnQgPSBpdGVtLnJhbmdlICE9IG51bGwgPyBgOiR7aXRlbS5yYW5nZS5zdGFydC5yb3cgKyAxfWAgOiAnJztcbiAgICAgIHBhdGhDb21wb25lbnQgPSAnOiAnICsgZ2V0UGF0aChpdGVtLmZpbGVQYXRoKSArIGxpbmVDb21wb25lbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1haW5Db21wb25lbnQgKyBwYXRoQ29tcG9uZW50O1xuICB9XG4gIGNvbnN0IHRyYWNlID0gbWVzc2FnZS50cmFjZSAhPSBudWxsID8gbWVzc2FnZS50cmFjZSA6IFtdO1xuICByZXR1cm4gW21lc3NhZ2UsIC4uLnRyYWNlXS5tYXAocGxhaW5UZXh0Rm9ySXRlbSkuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRGb3JUcmFjZShcbiAgdHJhY2U6IFRyYWNlLFxuICBnb1RvTG9jYXRpb246IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4gbWl4ZWQsXG4pOiBIVE1MRWxlbWVudCB7XG4gIGxldCBsb2NTcGFuID0gbnVsbDtcbiAgLy8gTG9jYWwgdmFyaWFibGUgc28gdGhhdCB0aGUgdHlwZSByZWZpbmVtZW50IGhvbGRzIGluIHRoZSBvbkNsaWNrIGhhbmRsZXIuXG4gIGNvbnN0IHBhdGggPSB0cmFjZS5maWxlUGF0aDtcbiAgaWYgKHBhdGgpIHtcbiAgICBjb25zdCBbLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGgpO1xuICAgIGxldCBsb2NTdHJpbmcgPSByZWxhdGl2ZVBhdGg7XG4gICAgaWYgKHRyYWNlLnJhbmdlKSB7XG4gICAgICBsb2NTdHJpbmcgKz0gYDoke3RyYWNlLnJhbmdlLnN0YXJ0LnJvdyArIDF9YDtcbiAgICB9XG4gICAgY29uc3Qgb25DbGljayA9ICgpID0+IHtcbiAgICAgIHRyYWNrKCdkaWFnbm9zdGljcy1ndXR0ZXItZ290by1sb2NhdGlvbicpO1xuICAgICAgZ29Ub0xvY2F0aW9uKHBhdGgsIE1hdGgubWF4KHRyYWNlLnJhbmdlID8gdHJhY2UucmFuZ2Uuc3RhcnQucm93IDogMCwgMCkpO1xuICAgIH07XG4gICAgbG9jU3BhbiA9IDxzcGFuPjogPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXtvbkNsaWNrfT57bG9jU3RyaW5nfTwvYT48L3NwYW4+O1xuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtjcmVhdGVNZXNzYWdlU3Bhbih0cmFjZSl9XG4gICAgICB7bG9jU3Bhbn1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWVzc2FnZVNwYW4obWVzc2FnZToge2h0bWw/OiBzdHJpbmcsIHRleHQ/OiBzdHJpbmd9KTogSFRNTEVsZW1lbnQge1xuICBpZiAobWVzc2FnZS5odG1sICE9IG51bGwpIHtcbiAgICByZXR1cm4gPHNwYW4gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG1lc3NhZ2UuaHRtbH19IC8+O1xuICB9IGVsc2UgaWYgKG1lc3NhZ2UudGV4dCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIDxzcGFuPnttZXNzYWdlLnRleHR9PC9zcGFuPjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gPHNwYW4+RGlhZ25vc3RpYyBsYWNrcyBtZXNzYWdlLjwvc3Bhbj47XG4gIH1cbn1cblxuY2xhc3MgRGlhZ25vc3RpY3NQb3B1cCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5ub2RlLFxuICAgIGxlZnQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICB0b3A6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXBcIlxuICAgICAgICBzdHlsZT17e2xlZnQ6IHRoaXMucHJvcHMubGVmdCArICdweCcsIHRvcDogdGhpcy5wcm9wcy50b3AgKyAncHgnfX1cbiAgICAgICAgPlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==