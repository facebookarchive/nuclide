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

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _require = require('../../nuclide-analytics');

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
    var column = 0;
    (0, _nuclideAtomHelpers.goToLocation)(path, line, column);
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
  var children = messages.map(function (message, index) {
    var contents = createElementForMessage(message, goToLocation, fixer);
    var diagnosticTypeClass = message.type === 'Error' ? 'nuclide-diagnostics-gutter-ui-popup-error' : 'nuclide-diagnostics-gutter-ui-popup-warning';
    // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
    var classes = 'native-key-bindings nuclide-diagnostics-gutter-ui-popup-diagnostic ' + diagnosticTypeClass;
    return React.createElement(
      'div',
      { className: classes, key: index, tabIndex: -1 },
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

  // TODO(ssorallen): Remove the `children` prop when Flow is able to associate JSX children with
  //   the prop named `children`. JSX children overwrite the prop of the same name, so do that for
  //   now to appease both ESLint and Flow.
  //
  //   https://github.com/facebook/flow/issues/1355#issuecomment-178883891
  ReactDOM.render(React.createElement(
    DiagnosticsPopup,
    { children: children, left: left, top: top },
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
    var applyFix = function applyFix() {
      fixer(message);
      track('diagnostics-gutter-autofix');
    };
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
  var _require3 = require('../../nuclide-remote-uri');

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
          style: { left: this.props.left + 'px', top: this.props.top + 'px' } },
        this.props.children
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      children: PropTypes.node.isRequired,
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired
    },
    enumerable: true
  }]);

  return DiagnosticsPopup;
})(React.Component);
//# sourceMappingURL=data:application/json;base64,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QUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksRUFBQyxBQUFDO1FBQ2pFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtPQUNoQixDQUNOO0tBQ0g7OztXQWRrQjtBQUNqQixjQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ25DLFVBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDakMsU0FBRyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtLQUNqQzs7OztTQUxHLGdCQUFnQjtHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6Imd1dHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZU1lc3NhZ2VVcGRhdGUsXG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgVHJhY2UsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtYmFzZSc7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHtnb1RvTG9jYXRpb24gYXMgYXRvbUdvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IEdVVFRFUl9JRCA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlcic7XG5cbi8vIE5lZWRzIHRvIGJlIHRoZSBzYW1lIGFzIGdseXBoLWhlaWdodCBpbiBndXR0ZXIuYXRvbS10ZXh0LWVkaXRvci5sZXNzLlxuY29uc3QgR0xZUEhfSEVJR0hUID0gMTU7IC8vIHB4XG5cbmNvbnN0IFBPUFVQX0RJU1BPU0VfVElNRU9VVCA9IDEwMDtcblxuLy8gVE9ETyhtYm9saW4pOiBNYWtlIGl0IHNvIHRoYXQgd2hlbiBtb3VzaW5nIG92ZXIgYW4gZWxlbWVudCB3aXRoIHRoaXMgQ1NTIGNsYXNzIChvciBzcGVjaWZpY2FsbHksXG4vLyB0aGUgY2hpbGQgZWxlbWVudCB3aXRoIHRoZSBcInJlZ2lvblwiIENTUyBjbGFzcyksIHdlIGFsc28gZG8gYSBzaG93UG9wdXBGb3IoKS4gVGhpcyBzZWVtcyB0byBiZVxuLy8gdHJpY2t5IGdpdmVuIGhvdyB0aGUgRE9NIG9mIGEgVGV4dEVkaXRvciB3b3JrcyB0b2RheS4gVGhlcmUgYXJlIGRpdi50aWxlIGVsZW1lbnRzLCBlYWNoIG9mIHdoaWNoXG4vLyBoYXMgaXRzIG93biBkaXYuaGlnaGxpZ2h0cyBlbGVtZW50IGFuZCBtYW55IGRpdi5saW5lIGVsZW1lbnRzLiBUaGUgZGl2LmhpZ2hsaWdodHMgZWxlbWVudCBoYXMgMFxuLy8gb3IgbW9yZSBjaGlsZHJlbiwgZWFjaCBjaGlsZCBiZWluZyBhIGRpdi5oaWdobGlnaHQgd2l0aCBhIGNoaWxkIGRpdi5yZWdpb24uIFRoZSBkaXYucmVnaW9uXG4vLyBlbGVtZW50IGlzIGRlZmluZWQgdG8gYmUge3Bvc2l0aW9uOiBhYnNvbHV0ZTsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHotaW5kZXg6IC0xfS4gVGhlIGFic29sdXRlXG4vLyBwb3NpdGlvbmluZyBhbmQgbmVnYXRpdmUgei1pbmRleCBtYWtlIGl0IHNvIGl0IGlzbid0IGVsaWdpYmxlIGZvciBtb3VzZW92ZXIgZXZlbnRzLCBzbyB3ZVxuLy8gbWlnaHQgaGF2ZSB0byBsaXN0ZW4gZm9yIG1vdXNlb3ZlciBldmVudHMgb24gVGV4dEVkaXRvciBhbmQgdGhlbiB1c2UgaXRzIG93biBBUElzLCBzdWNoIGFzXG4vLyBkZWNvcmF0aW9uc0ZvclNjcmVlblJvd1JhbmdlKCksIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGhpdCB0YXJnZXQgaW5zdGVhZC4gU2luY2UgdGhpcyB3aWxsIGJlXG4vLyBoYXBwZW5pbmcgb25tb3VzZW1vdmUsIHdlIGFsc28gaGF2ZSB0byBiZSBjYXJlZnVsIHRvIG1ha2Ugc3VyZSB0aGlzIGlzIG5vdCBleHBlbnNpdmUuXG5jb25zdCBISUdITElHSFRfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWhpZ2hsaWdodCc7XG5cbmNvbnN0IEVSUk9SX0hJR0hMSUdIVF9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktaGlnaGxpZ2h0LWVycm9yJztcbmNvbnN0IFdBUk5JTkdfSElHSExJR0hUX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1oaWdobGlnaHQtd2FybmluZyc7XG5cbmNvbnN0IEVSUk9SX0dVVFRFUl9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktZ3V0dGVyLWVycm9yJztcbmNvbnN0IFdBUk5JTkdfR1VUVEVSX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1ndXR0ZXItd2FybmluZyc7XG5cbmNvbnN0IGVkaXRvclRvTWFya2VyczogV2Vha01hcDxUZXh0RWRpdG9yLCBTZXQ8YXRvbSRNYXJrZXI+PiA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdGVtVG9FZGl0b3I6IFdlYWtNYXA8SFRNTEVsZW1lbnQsIFRleHRFZGl0b3I+ID0gbmV3IFdlYWtNYXAoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VXBkYXRlVG9FZGl0b3IoXG4gIGVkaXRvcjogVGV4dEVkaXRvcixcbiAgdXBkYXRlOiBGaWxlTWVzc2FnZVVwZGF0ZSxcbiAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4pOiB2b2lkIHtcbiAgbGV0IGd1dHRlciA9IGVkaXRvci5ndXR0ZXJXaXRoTmFtZShHVVRURVJfSUQpO1xuICBpZiAoIWd1dHRlcikge1xuICAgIC8vIFRPRE8oamVzc2ljYWxpbik6IERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBwcmlvcml0eSBzbyB0aGF0IHRoZSBndXR0ZXI6XG4gICAgLy8gKDEpIFNob3dzIHVwIHRvIHRoZSByaWdodCBvZiB0aGUgbGluZSBudW1iZXJzLlxuICAgIC8vICgyKSBTaG93cyB0aGUgaXRlbXMgdGhhdCBhcmUgYWRkZWQgdG8gaXQgcmlnaHQgYXdheS5cbiAgICAvLyBVc2luZyBhIHZhbHVlIG9mIDEwIGZpeGVzICgxKSwgYnV0IGJyZWFrcyAoMikuIFRoaXMgc2VlbXMgbGlrZSBpdCBpcyBsaWtlbHkgYSBidWcgaW4gQXRvbS5cblxuICAgIC8vIEJ5IGRlZmF1bHQsIGEgZ3V0dGVyIHdpbGwgYmUgZGVzdHJveWVkIHdoZW4gaXRzIGVkaXRvciBpcyBkZXN0cm95ZWQsXG4gICAgLy8gc28gdGhlcmUgaXMgbm8gbmVlZCB0byByZWdpc3RlciBhIGNhbGxiYWNrIHZpYSBvbkRpZERlc3Ryb3koKS5cbiAgICBndXR0ZXIgPSBlZGl0b3IuYWRkR3V0dGVyKHtcbiAgICAgIG5hbWU6IEdVVFRFUl9JRCxcbiAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgbGV0IG1hcmtlcjtcbiAgbGV0IG1hcmtlcnMgPSBlZGl0b3JUb01hcmtlcnMuZ2V0KGVkaXRvcik7XG5cbiAgLy8gVE9ETzogQ29uc2lkZXIgYSBtb3JlIGVmZmljaWVudCBzdHJhdGVneSB0aGF0IGRvZXMgbm90IGJsaW5kbHkgZGVzdHJveSBhbGwgb2YgdGhlXG4gIC8vIGV4aXN0aW5nIG1hcmtlcnMuXG4gIGlmIChtYXJrZXJzKSB7XG4gICAgZm9yIChtYXJrZXIgb2YgbWFya2Vycykge1xuICAgICAgbWFya2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgbWFya2Vycy5jbGVhcigpO1xuICB9IGVsc2Uge1xuICAgIG1hcmtlcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBjb25zdCByb3dUb01lc3NhZ2U6IE1hcDxudW1iZXIsIEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+ID0gbmV3IE1hcCgpO1xuICBmdW5jdGlvbiBhZGRNZXNzYWdlRm9yUm93KG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSwgcm93OiBudW1iZXIpIHtcbiAgICBsZXQgbWVzc2FnZXMgPSByb3dUb01lc3NhZ2UuZ2V0KHJvdyk7XG4gICAgaWYgKCFtZXNzYWdlcykge1xuICAgICAgbWVzc2FnZXMgPSBbXTtcbiAgICAgIHJvd1RvTWVzc2FnZS5zZXQocm93LCBtZXNzYWdlcyk7XG4gICAgfVxuICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgdXBkYXRlLm1lc3NhZ2VzKSB7XG4gICAgY29uc3QgcmFuZ2UgPSBtZXNzYWdlLnJhbmdlO1xuICAgIGxldCBoaWdobGlnaHRNYXJrZXI7XG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICBhZGRNZXNzYWdlRm9yUm93KG1lc3NhZ2UsIHJhbmdlLnN0YXJ0LnJvdyk7XG4gICAgICBoaWdobGlnaHRNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkTWVzc2FnZUZvclJvdyhtZXNzYWdlLCAwKTtcbiAgICB9XG5cbiAgICBsZXQgaGlnaGxpZ2h0Q3NzQ2xhc3M7XG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0Vycm9yJykge1xuICAgICAgaGlnaGxpZ2h0Q3NzQ2xhc3MgPSBISUdITElHSFRfQ1NTICsgJyAnICsgRVJST1JfSElHSExJR0hUX0NTUztcbiAgICB9IGVsc2Uge1xuICAgICAgaGlnaGxpZ2h0Q3NzQ2xhc3MgPSBISUdITElHSFRfQ1NTICsgJyAnICsgV0FSTklOR19ISUdITElHSFRfQ1NTO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWFya2VyIHVuZGVybGluZXMgdGV4dC5cbiAgICBpZiAoaGlnaGxpZ2h0TWFya2VyKSB7XG4gICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoaGlnaGxpZ2h0TWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogaGlnaGxpZ2h0Q3NzQ2xhc3MsXG4gICAgICB9KTtcbiAgICAgIG1hcmtlcnMuYWRkKGhpZ2hsaWdodE1hcmtlcik7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCBhbGwgb2YgdGhlIGd1dHRlciBtYXJrZXJzIGZvciB0aGUgc2FtZSByb3cgYW5kIGNvbWJpbmUgdGhlbSBpbnRvIG9uZSBtYXJrZXIvcG9wdXAuXG4gIGZvciAoY29uc3QgW3JvdywgbWVzc2FnZXNdIG9mIHJvd1RvTWVzc2FnZS5lbnRyaWVzKCkpIHtcbiAgICAvLyBJZiBhdCBsZWFzdCBvbmUgb2YgdGhlIGRpYWdub3N0aWNzIGlzIGFuIGVycm9yIHJhdGhlciB0aGFuIHRoZSB3YXJuaW5nLFxuICAgIC8vIGRpc3BsYXkgdGhlIGdseXBoIGluIHRoZSBndXR0ZXIgdG8gcmVwcmVzZW50IGFuIGVycm9yIHJhdGhlciB0aGFuIGEgd2FybmluZy5cbiAgICBjb25zdCBndXR0ZXJNYXJrZXJDc3NDbGFzcyA9IG1lc3NhZ2VzLnNvbWUobXNnID0+IG1zZy50eXBlID09PSAnRXJyb3InKVxuICAgICAgPyBFUlJPUl9HVVRURVJfQ1NTXG4gICAgICA6IFdBUk5JTkdfR1VUVEVSX0NTUztcblxuICAgIC8vIFRoaXMgbWFya2VyIGFkZHMgc29tZSBVSSB0byB0aGUgZ3V0dGVyLlxuICAgIGNvbnN0IHtpdGVtLCBkaXNwb3NlfSA9IGNyZWF0ZUd1dHRlckl0ZW0obWVzc2FnZXMsIGd1dHRlck1hcmtlckNzc0NsYXNzLCBmaXhlcik7XG4gICAgaXRlbVRvRWRpdG9yLnNldChpdGVtLCBlZGl0b3IpO1xuICAgIGNvbnN0IGd1dHRlck1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oW3JvdywgMF0pO1xuICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihndXR0ZXJNYXJrZXIsIHtpdGVtfSk7XG4gICAgZ3V0dGVyTWFya2VyLm9uRGlkRGVzdHJveShkaXNwb3NlKTtcbiAgICBtYXJrZXJzLmFkZChndXR0ZXJNYXJrZXIpO1xuICB9XG5cbiAgZWRpdG9yVG9NYXJrZXJzLnNldChlZGl0b3IsIG1hcmtlcnMpO1xuXG4gIC8vIE9uY2UgdGhlIGd1dHRlciBpcyBzaG93biBmb3IgdGhlIGZpcnN0IHRpbWUsIGl0IGlzIGRpc3BsYXllZCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZVxuICAvLyBUZXh0RWRpdG9yLlxuICBpZiAodXBkYXRlLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBndXR0ZXIuc2hvdygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUd1dHRlckl0ZW0oXG4gIG1lc3NhZ2VzOiBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+LFxuICBndXR0ZXJNYXJrZXJDc3NDbGFzczogc3RyaW5nLFxuICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZCxcbik6IHtpdGVtOiBIVE1MRWxlbWVudDsgZGlzcG9zZTogKCkgPT4gdm9pZH0ge1xuICBjb25zdCBpdGVtID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgaXRlbS5pbm5lclRleHQgPSAnXFx1MjVCNic7IC8vIFVuaWNvZGUgY2hhcmFjdGVyIGZvciBhIHJpZ2h0LXBvaW50aW5nIHRyaWFuZ2xlLlxuICBpdGVtLmNsYXNzTmFtZSA9IGd1dHRlck1hcmtlckNzc0NsYXNzO1xuICBsZXQgcG9wdXBFbGVtZW50ID0gbnVsbDtcbiAgbGV0IHBhbmVJdGVtU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgbGV0IGRpc3Bvc2VUaW1lb3V0ID0gbnVsbDtcbiAgY29uc3QgY2xlYXJEaXNwb3NlVGltZW91dCA9ICgpID0+IHtcbiAgICBpZiAoZGlzcG9zZVRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dChkaXNwb3NlVGltZW91dCk7XG4gICAgfVxuICB9O1xuICBjb25zdCBkaXNwb3NlID0gKCkgPT4ge1xuICAgIGlmIChwb3B1cEVsZW1lbnQpIHtcbiAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUocG9wdXBFbGVtZW50KTtcbiAgICAgIHBvcHVwRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHBvcHVwRWxlbWVudCk7XG4gICAgICBwb3B1cEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAocGFuZUl0ZW1TdWJzY3JpcHRpb24pIHtcbiAgICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgY2xlYXJEaXNwb3NlVGltZW91dCgpO1xuICB9O1xuICBjb25zdCBnb1RvTG9jYXRpb24gPSAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IHtcbiAgICAvLyBCZWZvcmUgd2UganVtcCB0byB0aGUgbG9jYXRpb24sIHdlIHdhbnQgdG8gY2xvc2UgdGhlIHBvcHVwLlxuICAgIGRpc3Bvc2UoKTtcbiAgICBjb25zdCBjb2x1bW4gPSAwO1xuICAgIGF0b21Hb1RvTG9jYXRpb24ocGF0aCwgbGluZSwgY29sdW1uKTtcbiAgfTtcbiAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZXZlbnQgPT4ge1xuICAgIC8vIElmIHRoZXJlIHdhcyBzb21laG93IGFub3RoZXIgcG9wdXAgZm9yIHRoaXMgZ3V0dGVyIGl0ZW0sIGRpc3Bvc2UgaXQuIFRoaXMgY2FuIGhhcHBlbiBpZiB0aGVcbiAgICAvLyB1c2VyIG1hbmFnZXMgdG8gc2Nyb2xsIGFuZCBlc2NhcGUgZGlzcG9zYWwuXG4gICAgZGlzcG9zZSgpO1xuICAgIHBvcHVwRWxlbWVudCA9IHNob3dQb3B1cEZvcihtZXNzYWdlcywgaXRlbSwgZ29Ub0xvY2F0aW9uLCBmaXhlcik7XG4gICAgcG9wdXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBkaXNwb3NlKTtcbiAgICBwb3B1cEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGNsZWFyRGlzcG9zZVRpbWVvdXQpO1xuICAgIC8vIFRoaXMgbWFrZXMgc3VyZSB0aGF0IHRoZSBwb3B1cCBkaXNhcHBlYXJzIHdoZW4geW91IGN0cmwrdGFiIHRvIHN3aXRjaCB0YWJzLlxuICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShkaXNwb3NlKTtcbiAgfSk7XG4gIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGV2ZW50ID0+IHtcbiAgICAvLyBXaGVuIHRoZSBwb3B1cCBpcyBzaG93biwgd2Ugd2FudCB0byBkaXNwb3NlIGl0IGlmIHRoZSB1c2VyIG1hbmFnZXMgdG8gbW92ZSB0aGUgY3Vyc29yIG9mZiBvZlxuICAgIC8vIHRoZSBndXR0ZXIgZ2x5cGggd2l0aG91dCBtb3ZpbmcgaXQgb250byB0aGUgcG9wdXAuIEV2ZW4gdGhvdWdoIHRoZSBwb3B1cCBhcHBlYXJzIGFib3ZlIChhcyBpblxuICAgIC8vIFotaW5kZXggYWJvdmUpIHRoZSBndXR0ZXIgZ2x5cGgsIGlmIHlvdSBtb3ZlIHRoZSBjdXJzb3Igc3VjaCB0aGF0IGl0IGlzIG9ubHkgYWJvdmUgdGhlIGdseXBoXG4gICAgLy8gZm9yIG9uZSBmcmFtZSB5b3UgY2FuIGNhdXNlIHRoZSBwb3B1cCB0byBhcHBlYXIgd2l0aG91dCB0aGUgbW91c2UgZXZlciBlbnRlcmluZyBpdC5cbiAgICBkaXNwb3NlVGltZW91dCA9IHNldFRpbWVvdXQoZGlzcG9zZSwgUE9QVVBfRElTUE9TRV9USU1FT1VUKTtcbiAgfSk7XG4gIHJldHVybiB7aXRlbSwgZGlzcG9zZX07XG59XG5cbi8qKlxuICogU2hvd3MgYSBwb3B1cCBmb3IgdGhlIGRpYWdub3N0aWMganVzdCBiZWxvdyB0aGUgc3BlY2lmaWVkIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHNob3dQb3B1cEZvcihcbiAgICBtZXNzYWdlczogQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPixcbiAgICBpdGVtOiBIVE1MRWxlbWVudCxcbiAgICBnb1RvTG9jYXRpb246IChmaWxlUGF0aDogTnVjbGlkZVVyaSwgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbiAgICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZCxcbiAgICApOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGNoaWxkcmVuID0gbWVzc2FnZXMubWFwKChtZXNzYWdlLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnRzID0gY3JlYXRlRWxlbWVudEZvck1lc3NhZ2UobWVzc2FnZSwgZ29Ub0xvY2F0aW9uLCBmaXhlcik7XG4gICAgY29uc3QgZGlhZ25vc3RpY1R5cGVDbGFzcyA9IG1lc3NhZ2UudHlwZSA9PT0gJ0Vycm9yJ1xuICAgICAgPyAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtZXJyb3InXG4gICAgICA6ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cC13YXJuaW5nJztcbiAgICAvLyBuYXRpdmUta2V5LWJpbmRpbmdzIGFuZCB0YWJJbmRleD0tMSBhcmUgYm90aCBuZWVkZWQgdG8gYWxsb3cgY29weWluZyB0aGUgdGV4dCBpbiB0aGUgcG9wdXAuXG4gICAgY29uc3QgY2xhc3NlcyA9XG4gICAgICBgbmF0aXZlLWtleS1iaW5kaW5ncyBudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cC1kaWFnbm9zdGljICR7ZGlhZ25vc3RpY1R5cGVDbGFzc31gO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30ga2V5PXtpbmRleH0gdGFiSW5kZXg9ey0xfT5cbiAgICAgICAge2NvbnRlbnRzfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSk7XG4gIC8vIFRoZSBwb3B1cCB3aWxsIGJlIGFuIGFic29sdXRlbHkgcG9zaXRpb25lZCBjaGlsZCBlbGVtZW50IG9mIDxhdG9tLXdvcmtzcGFjZT4gc28gdGhhdCBpdCBhcHBlYXJzXG4gIC8vIG9uIHRvcCBvZiBldmVyeXRoaW5nLlxuICBjb25zdCB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgY29uc3QgaG9zdEVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHdvcmtzcGFjZUVsZW1lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChob3N0RWxlbWVudCk7XG5cbiAgLy8gTW92ZSBpdCBkb3duIHZlcnRpY2FsbHkgc28gaXQgZG9lcyBub3QgZW5kIHVwIHVuZGVyIHRoZSBtb3VzZSBwb2ludGVyLlxuICBjb25zdCB7dG9wLCBsZWZ0fSA9IGl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgLy8gVE9ETyhzc29yYWxsZW4pOiBSZW1vdmUgdGhlIGBjaGlsZHJlbmAgcHJvcCB3aGVuIEZsb3cgaXMgYWJsZSB0byBhc3NvY2lhdGUgSlNYIGNoaWxkcmVuIHdpdGhcbiAgLy8gICB0aGUgcHJvcCBuYW1lZCBgY2hpbGRyZW5gLiBKU1ggY2hpbGRyZW4gb3ZlcndyaXRlIHRoZSBwcm9wIG9mIHRoZSBzYW1lIG5hbWUsIHNvIGRvIHRoYXQgZm9yXG4gIC8vICAgbm93IHRvIGFwcGVhc2UgYm90aCBFU0xpbnQgYW5kIEZsb3cuXG4gIC8vXG4gIC8vICAgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvaXNzdWVzLzEzNTUjaXNzdWVjb21tZW50LTE3ODg4Mzg5MVxuICBSZWFjdERPTS5yZW5kZXIoXG4gICAgPERpYWdub3N0aWNzUG9wdXAgY2hpbGRyZW49e2NoaWxkcmVufSBsZWZ0PXtsZWZ0fSB0b3A9e3RvcH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9EaWFnbm9zdGljc1BvcHVwPixcbiAgICBob3N0RWxlbWVudFxuICApO1xuXG4gIC8vIENoZWNrIHRvIHNlZSB3aGV0aGVyIHRoZSBwb3B1cCBpcyB3aXRoaW4gdGhlIGJvdW5kcyBvZiB0aGUgVGV4dEVkaXRvci4gSWYgbm90LCBkaXNwbGF5IGl0IGFib3ZlXG4gIC8vIHRoZSBnbHlwaCByYXRoZXIgdGhhbiBiZWxvdyBpdC5cbiAgY29uc3QgZWRpdG9yID0gaXRlbVRvRWRpdG9yLmdldChpdGVtKTtcbiAgY29uc3QgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpO1xuICBjb25zdCB7dG9wOiBlZGl0b3JUb3AsIGhlaWdodDogZWRpdG9ySGVpZ2h0fSA9IGVkaXRvckVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGNvbnN0IHt0b3A6IGl0ZW1Ub3AsIGhlaWdodDogaXRlbUhlaWdodH0gPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBwb3B1cEhlaWdodCA9IGhvc3RFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkLmNsaWVudEhlaWdodDtcbiAgaWYgKChpdGVtVG9wICsgaXRlbUhlaWdodCArIHBvcHVwSGVpZ2h0KSA+IChlZGl0b3JUb3AgKyBlZGl0b3JIZWlnaHQpKSB7XG4gICAgY29uc3QgcG9wdXBFbGVtZW50ID0gaG9zdEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgLy8gU2hpZnQgdGhlIHBvcHVwIGJhY2sgZG93biBieSBHTFlQSF9IRUlHSFQsIHNvIHRoYXQgdGhlIGJvdHRvbSBwYWRkaW5nIG92ZXJsYXBzIHdpdGggdGhlXG4gICAgLy8gZ2x5cGguIEFuIGFkZGl0aW9uYWwgNCBweCBpcyBuZWVkZWQgdG8gbWFrZSBpdCBsb29rIHRoZSBzYW1lIHdheSBpdCBkb2VzIHdoZW4gaXQgc2hvd3MgdXBcbiAgICAvLyBiZWxvdy4gSSBkb24ndCBrbm93IHdoeS5cbiAgICBwb3B1cEVsZW1lbnQuc3R5bGUudG9wID0gU3RyaW5nKGl0ZW1Ub3AgLSBwb3B1cEhlaWdodCArIEdMWVBIX0hFSUdIVCArIDQpICsgJ3B4JztcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGhvc3RFbGVtZW50O1xuICB9IGZpbmFsbHkge1xuICAgIG1lc3NhZ2VzLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICB0cmFjaygnZGlhZ25vc3RpY3MtZ3V0dGVyLXNob3ctcG9wdXAnLCB7XG4gICAgICAgICdkaWFnbm9zdGljcy1wcm92aWRlcic6IG1lc3NhZ2UucHJvdmlkZXJOYW1lLFxuICAgICAgICAnZGlhZ25vc3RpY3MtbWVzc2FnZSc6IG1lc3NhZ2UudGV4dCB8fCBtZXNzYWdlLmh0bWwgfHwgJycsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Rm9yTWVzc2FnZShcbiAgbWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBnb1RvTG9jYXRpb246IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4gbWl4ZWQsXG4gIGZpeGVyOiAobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKSA9PiB2b2lkLFxuKTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgcHJvdmlkZXJDbGFzc05hbWUgPSBtZXNzYWdlLnR5cGUgPT09ICdFcnJvcidcbiAgICA/ICdoaWdobGlnaHQtZXJyb3InXG4gICAgOiAnaGlnaGxpZ2h0LXdhcm5pbmcnO1xuICBjb25zdCBjb3B5ID0gKCkgPT4ge1xuICAgIGNvbnN0IHRleHQgPSBwbGFpblRleHRGb3JEaWFnbm9zdGljKG1lc3NhZ2UpO1xuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRleHQpO1xuICB9O1xuICBsZXQgZml4QnV0dG9uID0gbnVsbDtcbiAgaWYgKG1lc3NhZ2UuZml4ICE9IG51bGwpIHtcbiAgICBjb25zdCBhcHBseUZpeCA9ICgpID0+IHtcbiAgICAgIGZpeGVyKG1lc3NhZ2UpO1xuICAgICAgdHJhY2soJ2RpYWdub3N0aWNzLWd1dHRlci1hdXRvZml4Jyk7XG4gICAgfTtcbiAgICBmaXhCdXR0b24gPSAoXG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4teHNcIiBvbkNsaWNrPXthcHBseUZpeH0+Rml4PC9idXR0b24+XG4gICAgKTtcbiAgfVxuICBjb25zdCBoZWFkZXIgPSAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cC1oZWFkZXJcIj5cbiAgICAgIHtmaXhCdXR0b259XG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4teHNcIiBvbkNsaWNrPXtjb3B5fT5Db3B5PC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2BwdWxsLXJpZ2h0ICR7cHJvdmlkZXJDbGFzc05hbWV9YH0+e21lc3NhZ2UucHJvdmlkZXJOYW1lfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgKTtcbiAgY29uc3QgdHJhY2VFbGVtZW50cyA9IG1lc3NhZ2UudHJhY2VcbiAgICA/IG1lc3NhZ2UudHJhY2UubWFwKHRyYWNlSXRlbSA9PiBjcmVhdGVFbGVtZW50Rm9yVHJhY2UodHJhY2VJdGVtLCBnb1RvTG9jYXRpb24pKVxuICAgIDogbnVsbDtcbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAge2hlYWRlcn1cbiAgICAgIDxkaXY+e2NyZWF0ZU1lc3NhZ2VTcGFuKG1lc3NhZ2UpfTwvZGl2PlxuICAgICAge3RyYWNlRWxlbWVudHN9XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmZ1bmN0aW9uIHBsYWluVGV4dEZvckRpYWdub3N0aWMobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKTogc3RyaW5nIHtcbiAgY29uc3Qge2dldFBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG4gIGZ1bmN0aW9uIHBsYWluVGV4dEZvckl0ZW0oaXRlbTogRmlsZURpYWdub3N0aWNNZXNzYWdlIHwgVHJhY2UpOiBzdHJpbmcge1xuICAgIGxldCBtYWluQ29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChpdGVtLmh0bWwgIT0gbnVsbCkge1xuICAgICAgLy8gUXVpY2sgYW5kIGRpcnR5IHdheSB0byBnZXQgYW4gYXBwcm94aW1hdGlvbiBmb3IgdGhlIHBsYWluIHRleHQgZnJvbSBIVE1MLiBUaGlzIHdpbGwgd29yayBpblxuICAgICAgLy8gc2ltcGxlIGNhc2VzLCBhbnl3YXkuXG4gICAgICBtYWluQ29tcG9uZW50ID0gaXRlbS5odG1sLnJlcGxhY2UoJzxici8+JywgJ1xcbicpLnJlcGxhY2UoLzxbXj5dKj4vZywgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnZhcmlhbnQoaXRlbS50ZXh0ICE9IG51bGwpO1xuICAgICAgbWFpbkNvbXBvbmVudCA9IGl0ZW0udGV4dDtcbiAgICB9XG5cbiAgICBsZXQgcGF0aENvbXBvbmVudCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoaXRlbS5maWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICBwYXRoQ29tcG9uZW50ID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxpbmVDb21wb25lbnQgPSBpdGVtLnJhbmdlICE9IG51bGwgPyBgOiR7aXRlbS5yYW5nZS5zdGFydC5yb3cgKyAxfWAgOiAnJztcbiAgICAgIHBhdGhDb21wb25lbnQgPSAnOiAnICsgZ2V0UGF0aChpdGVtLmZpbGVQYXRoKSArIGxpbmVDb21wb25lbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1haW5Db21wb25lbnQgKyBwYXRoQ29tcG9uZW50O1xuICB9XG4gIGNvbnN0IHRyYWNlID0gbWVzc2FnZS50cmFjZSAhPSBudWxsID8gbWVzc2FnZS50cmFjZSA6IFtdO1xuICByZXR1cm4gW21lc3NhZ2UsIC4uLnRyYWNlXS5tYXAocGxhaW5UZXh0Rm9ySXRlbSkuam9pbignXFxuJyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRGb3JUcmFjZShcbiAgdHJhY2U6IFRyYWNlLFxuICBnb1RvTG9jYXRpb246IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4gbWl4ZWQsXG4pOiBSZWFjdEVsZW1lbnQge1xuICBsZXQgbG9jU3BhbiA9IG51bGw7XG4gIC8vIExvY2FsIHZhcmlhYmxlIHNvIHRoYXQgdGhlIHR5cGUgcmVmaW5lbWVudCBob2xkcyBpbiB0aGUgb25DbGljayBoYW5kbGVyLlxuICBjb25zdCBwYXRoID0gdHJhY2UuZmlsZVBhdGg7XG4gIGlmIChwYXRoKSB7XG4gICAgY29uc3QgWywgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChwYXRoKTtcbiAgICBsZXQgbG9jU3RyaW5nID0gcmVsYXRpdmVQYXRoO1xuICAgIGlmICh0cmFjZS5yYW5nZSkge1xuICAgICAgbG9jU3RyaW5nICs9IGA6JHt0cmFjZS5yYW5nZS5zdGFydC5yb3cgKyAxfWA7XG4gICAgfVxuICAgIGNvbnN0IG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICB0cmFjaygnZGlhZ25vc3RpY3MtZ3V0dGVyLWdvdG8tbG9jYXRpb24nKTtcbiAgICAgIGdvVG9Mb2NhdGlvbihwYXRoLCBNYXRoLm1heCh0cmFjZS5yYW5nZSA/IHRyYWNlLnJhbmdlLnN0YXJ0LnJvdyA6IDAsIDApKTtcbiAgICB9O1xuICAgIGxvY1NwYW4gPSA8c3Bhbj46IDxhIGhyZWY9XCIjXCIgb25DbGljaz17b25DbGlja30+e2xvY1N0cmluZ308L2E+PC9zcGFuPjtcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICB7Y3JlYXRlTWVzc2FnZVNwYW4odHJhY2UpfVxuICAgICAge2xvY1NwYW59XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VTcGFuKG1lc3NhZ2U6IHtodG1sPzogc3RyaW5nOyB0ZXh0Pzogc3RyaW5nfSk6IFJlYWN0RWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmh0bWwgIT0gbnVsbCkge1xuICAgIHJldHVybiA8c3BhbiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogbWVzc2FnZS5odG1sfX0gLz47XG4gIH0gZWxzZSBpZiAobWVzc2FnZS50ZXh0ICE9IG51bGwpIHtcbiAgICByZXR1cm4gPHNwYW4+e21lc3NhZ2UudGV4dH08L3NwYW4+O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA8c3Bhbj5EaWFnbm9zdGljIGxhY2tzIG1lc3NhZ2UuPC9zcGFuPjtcbiAgfVxufVxuXG5jbGFzcyBEaWFnbm9zdGljc1BvcHVwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcbiAgICBsZWZ0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgdG9wOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwXCJcbiAgICAgICAgc3R5bGU9e3tsZWZ0OiB0aGlzLnByb3BzLmxlZnQgKyAncHgnLCB0b3A6IHRoaXMucHJvcHMudG9wICsgJ3B4J319PlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==