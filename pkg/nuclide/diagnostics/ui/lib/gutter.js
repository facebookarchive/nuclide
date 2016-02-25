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
//# sourceMappingURL=data:application/json;base64,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R0FBRyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLElBQUksRUFBQyxBQUFDO1FBQ2pFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtPQUNoQixDQUNOO0tBQ0g7OztXQWRrQjtBQUNqQixjQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ25DLFVBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDakMsU0FBRyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtLQUNqQzs7OztTQUxHLGdCQUFnQjtHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6Imd1dHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZU1lc3NhZ2VVcGRhdGUsXG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgVHJhY2UsXG59IGZyb20gJy4uLy4uL2Jhc2UnO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge3RyYWNrfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2FuYWx5dGljcycpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IEdVVFRFUl9JRCA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlcic7XG5cbi8vIE5lZWRzIHRvIGJlIHRoZSBzYW1lIGFzIGdseXBoLWhlaWdodCBpbiBndXR0ZXIuYXRvbS10ZXh0LWVkaXRvci5sZXNzLlxuY29uc3QgR0xZUEhfSEVJR0hUID0gMTU7IC8vIHB4XG5cbmNvbnN0IFBPUFVQX0RJU1BPU0VfVElNRU9VVCA9IDEwMDtcblxuLy8gVE9ETyhtYm9saW4pOiBNYWtlIGl0IHNvIHRoYXQgd2hlbiBtb3VzaW5nIG92ZXIgYW4gZWxlbWVudCB3aXRoIHRoaXMgQ1NTIGNsYXNzIChvciBzcGVjaWZpY2FsbHksXG4vLyB0aGUgY2hpbGQgZWxlbWVudCB3aXRoIHRoZSBcInJlZ2lvblwiIENTUyBjbGFzcyksIHdlIGFsc28gZG8gYSBzaG93UG9wdXBGb3IoKS4gVGhpcyBzZWVtcyB0byBiZVxuLy8gdHJpY2t5IGdpdmVuIGhvdyB0aGUgRE9NIG9mIGEgVGV4dEVkaXRvciB3b3JrcyB0b2RheS4gVGhlcmUgYXJlIGRpdi50aWxlIGVsZW1lbnRzLCBlYWNoIG9mIHdoaWNoXG4vLyBoYXMgaXRzIG93biBkaXYuaGlnaGxpZ2h0cyBlbGVtZW50IGFuZCBtYW55IGRpdi5saW5lIGVsZW1lbnRzLiBUaGUgZGl2LmhpZ2hsaWdodHMgZWxlbWVudCBoYXMgMFxuLy8gb3IgbW9yZSBjaGlsZHJlbiwgZWFjaCBjaGlsZCBiZWluZyBhIGRpdi5oaWdobGlnaHQgd2l0aCBhIGNoaWxkIGRpdi5yZWdpb24uIFRoZSBkaXYucmVnaW9uXG4vLyBlbGVtZW50IGlzIGRlZmluZWQgdG8gYmUge3Bvc2l0aW9uOiBhYnNvbHV0ZTsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHotaW5kZXg6IC0xfS4gVGhlIGFic29sdXRlXG4vLyBwb3NpdGlvbmluZyBhbmQgbmVnYXRpdmUgei1pbmRleCBtYWtlIGl0IHNvIGl0IGlzbid0IGVsaWdpYmxlIGZvciBtb3VzZW92ZXIgZXZlbnRzLCBzbyB3ZVxuLy8gbWlnaHQgaGF2ZSB0byBsaXN0ZW4gZm9yIG1vdXNlb3ZlciBldmVudHMgb24gVGV4dEVkaXRvciBhbmQgdGhlbiB1c2UgaXRzIG93biBBUElzLCBzdWNoIGFzXG4vLyBkZWNvcmF0aW9uc0ZvclNjcmVlblJvd1JhbmdlKCksIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGhpdCB0YXJnZXQgaW5zdGVhZC4gU2luY2UgdGhpcyB3aWxsIGJlXG4vLyBoYXBwZW5pbmcgb25tb3VzZW1vdmUsIHdlIGFsc28gaGF2ZSB0byBiZSBjYXJlZnVsIHRvIG1ha2Ugc3VyZSB0aGlzIGlzIG5vdCBleHBlbnNpdmUuXG5jb25zdCBISUdITElHSFRfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWhpZ2hsaWdodCc7XG5cbmNvbnN0IEVSUk9SX0hJR0hMSUdIVF9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktaGlnaGxpZ2h0LWVycm9yJztcbmNvbnN0IFdBUk5JTkdfSElHSExJR0hUX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1oaWdobGlnaHQtd2FybmluZyc7XG5cbmNvbnN0IEVSUk9SX0dVVFRFUl9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktZ3V0dGVyLWVycm9yJztcbmNvbnN0IFdBUk5JTkdfR1VUVEVSX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1ndXR0ZXItd2FybmluZyc7XG5cbmNvbnN0IGVkaXRvclRvTWFya2VyczogV2Vha01hcDxUZXh0RWRpdG9yLCBTZXQ8YXRvbSRNYXJrZXI+PiA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdGVtVG9FZGl0b3I6IFdlYWtNYXA8SFRNTEVsZW1lbnQsIFRleHRFZGl0b3I+ID0gbmV3IFdlYWtNYXAoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VXBkYXRlVG9FZGl0b3IoXG4gIGVkaXRvcjogVGV4dEVkaXRvcixcbiAgdXBkYXRlOiBGaWxlTWVzc2FnZVVwZGF0ZSxcbiAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4pOiB2b2lkIHtcbiAgbGV0IGd1dHRlciA9IGVkaXRvci5ndXR0ZXJXaXRoTmFtZShHVVRURVJfSUQpO1xuICBpZiAoIWd1dHRlcikge1xuICAgIC8vIFRPRE8oamVzc2ljYWxpbik6IERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBwcmlvcml0eSBzbyB0aGF0IHRoZSBndXR0ZXI6XG4gICAgLy8gKDEpIFNob3dzIHVwIHRvIHRoZSByaWdodCBvZiB0aGUgbGluZSBudW1iZXJzLlxuICAgIC8vICgyKSBTaG93cyB0aGUgaXRlbXMgdGhhdCBhcmUgYWRkZWQgdG8gaXQgcmlnaHQgYXdheS5cbiAgICAvLyBVc2luZyBhIHZhbHVlIG9mIDEwIGZpeGVzICgxKSwgYnV0IGJyZWFrcyAoMikuIFRoaXMgc2VlbXMgbGlrZSBpdCBpcyBsaWtlbHkgYSBidWcgaW4gQXRvbS5cblxuICAgIC8vIEJ5IGRlZmF1bHQsIGEgZ3V0dGVyIHdpbGwgYmUgZGVzdHJveWVkIHdoZW4gaXRzIGVkaXRvciBpcyBkZXN0cm95ZWQsXG4gICAgLy8gc28gdGhlcmUgaXMgbm8gbmVlZCB0byByZWdpc3RlciBhIGNhbGxiYWNrIHZpYSBvbkRpZERlc3Ryb3koKS5cbiAgICBndXR0ZXIgPSBlZGl0b3IuYWRkR3V0dGVyKHtcbiAgICAgIG5hbWU6IEdVVFRFUl9JRCxcbiAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgbGV0IG1hcmtlcjtcbiAgbGV0IG1hcmtlcnMgPSBlZGl0b3JUb01hcmtlcnMuZ2V0KGVkaXRvcik7XG5cbiAgLy8gVE9ETzogQ29uc2lkZXIgYSBtb3JlIGVmZmljaWVudCBzdHJhdGVneSB0aGF0IGRvZXMgbm90IGJsaW5kbHkgZGVzdHJveSBhbGwgb2YgdGhlXG4gIC8vIGV4aXN0aW5nIG1hcmtlcnMuXG4gIGlmIChtYXJrZXJzKSB7XG4gICAgZm9yIChtYXJrZXIgb2YgbWFya2Vycykge1xuICAgICAgbWFya2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgbWFya2Vycy5jbGVhcigpO1xuICB9IGVsc2Uge1xuICAgIG1hcmtlcnMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICBjb25zdCByb3dUb01lc3NhZ2U6IE1hcDxudW1iZXIsIEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4+ID0gbmV3IE1hcCgpO1xuICBmdW5jdGlvbiBhZGRNZXNzYWdlRm9yUm93KG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSwgcm93OiBudW1iZXIpIHtcbiAgICBsZXQgbWVzc2FnZXMgPSByb3dUb01lc3NhZ2UuZ2V0KHJvdyk7XG4gICAgaWYgKCFtZXNzYWdlcykge1xuICAgICAgbWVzc2FnZXMgPSBbXTtcbiAgICAgIHJvd1RvTWVzc2FnZS5zZXQocm93LCBtZXNzYWdlcyk7XG4gICAgfVxuICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgdXBkYXRlLm1lc3NhZ2VzKSB7XG4gICAgY29uc3QgcmFuZ2UgPSBtZXNzYWdlLnJhbmdlO1xuICAgIGxldCBoaWdobGlnaHRNYXJrZXI7XG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICBhZGRNZXNzYWdlRm9yUm93KG1lc3NhZ2UsIHJhbmdlLnN0YXJ0LnJvdyk7XG4gICAgICBoaWdobGlnaHRNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkTWVzc2FnZUZvclJvdyhtZXNzYWdlLCAwKTtcbiAgICB9XG5cbiAgICBsZXQgaGlnaGxpZ2h0Q3NzQ2xhc3M7XG4gICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0Vycm9yJykge1xuICAgICAgaGlnaGxpZ2h0Q3NzQ2xhc3MgPSBISUdITElHSFRfQ1NTICsgJyAnICsgRVJST1JfSElHSExJR0hUX0NTUztcbiAgICB9IGVsc2Uge1xuICAgICAgaGlnaGxpZ2h0Q3NzQ2xhc3MgPSBISUdITElHSFRfQ1NTICsgJyAnICsgV0FSTklOR19ISUdITElHSFRfQ1NTO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWFya2VyIHVuZGVybGluZXMgdGV4dC5cbiAgICBpZiAoaGlnaGxpZ2h0TWFya2VyKSB7XG4gICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoaGlnaGxpZ2h0TWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogaGlnaGxpZ2h0Q3NzQ2xhc3MsXG4gICAgICB9KTtcbiAgICAgIG1hcmtlcnMuYWRkKGhpZ2hsaWdodE1hcmtlcik7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCBhbGwgb2YgdGhlIGd1dHRlciBtYXJrZXJzIGZvciB0aGUgc2FtZSByb3cgYW5kIGNvbWJpbmUgdGhlbSBpbnRvIG9uZSBtYXJrZXIvcG9wdXAuXG4gIGZvciAoY29uc3QgW3JvdywgbWVzc2FnZXNdIG9mIHJvd1RvTWVzc2FnZS5lbnRyaWVzKCkpIHtcbiAgICAvLyBJZiBhdCBsZWFzdCBvbmUgb2YgdGhlIGRpYWdub3N0aWNzIGlzIGFuIGVycm9yIHJhdGhlciB0aGFuIHRoZSB3YXJuaW5nLFxuICAgIC8vIGRpc3BsYXkgdGhlIGdseXBoIGluIHRoZSBndXR0ZXIgdG8gcmVwcmVzZW50IGFuIGVycm9yIHJhdGhlciB0aGFuIGEgd2FybmluZy5cbiAgICBjb25zdCBndXR0ZXJNYXJrZXJDc3NDbGFzcyA9IG1lc3NhZ2VzLnNvbWUobXNnID0+IG1zZy50eXBlID09PSAnRXJyb3InKVxuICAgICAgPyBFUlJPUl9HVVRURVJfQ1NTXG4gICAgICA6IFdBUk5JTkdfR1VUVEVSX0NTUztcblxuICAgIC8vIFRoaXMgbWFya2VyIGFkZHMgc29tZSBVSSB0byB0aGUgZ3V0dGVyLlxuICAgIGNvbnN0IHtpdGVtLCBkaXNwb3NlfSA9IGNyZWF0ZUd1dHRlckl0ZW0obWVzc2FnZXMsIGd1dHRlck1hcmtlckNzc0NsYXNzLCBmaXhlcik7XG4gICAgaXRlbVRvRWRpdG9yLnNldChpdGVtLCBlZGl0b3IpO1xuICAgIGNvbnN0IGd1dHRlck1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oW3JvdywgMF0pO1xuICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihndXR0ZXJNYXJrZXIsIHtpdGVtfSk7XG4gICAgZ3V0dGVyTWFya2VyLm9uRGlkRGVzdHJveShkaXNwb3NlKTtcbiAgICBtYXJrZXJzLmFkZChndXR0ZXJNYXJrZXIpO1xuICB9XG5cbiAgZWRpdG9yVG9NYXJrZXJzLnNldChlZGl0b3IsIG1hcmtlcnMpO1xuXG4gIC8vIE9uY2UgdGhlIGd1dHRlciBpcyBzaG93biBmb3IgdGhlIGZpcnN0IHRpbWUsIGl0IGlzIGRpc3BsYXllZCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZVxuICAvLyBUZXh0RWRpdG9yLlxuICBpZiAodXBkYXRlLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBndXR0ZXIuc2hvdygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUd1dHRlckl0ZW0oXG4gIG1lc3NhZ2VzOiBBcnJheTxGaWxlRGlhZ25vc3RpY01lc3NhZ2U+LFxuICBndXR0ZXJNYXJrZXJDc3NDbGFzczogc3RyaW5nLFxuICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZCxcbik6IHtpdGVtOiBIVE1MRWxlbWVudDsgZGlzcG9zZTogKCkgPT4gdm9pZH0ge1xuICBjb25zdCBpdGVtID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgaXRlbS5pbm5lclRleHQgPSAnXFx1MjVCNic7IC8vIFVuaWNvZGUgY2hhcmFjdGVyIGZvciBhIHJpZ2h0LXBvaW50aW5nIHRyaWFuZ2xlLlxuICBpdGVtLmNsYXNzTmFtZSA9IGd1dHRlck1hcmtlckNzc0NsYXNzO1xuICBsZXQgcG9wdXBFbGVtZW50ID0gbnVsbDtcbiAgbGV0IHBhbmVJdGVtU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgbGV0IGRpc3Bvc2VUaW1lb3V0ID0gbnVsbDtcbiAgY29uc3QgY2xlYXJEaXNwb3NlVGltZW91dCA9ICgpID0+IHtcbiAgICBpZiAoZGlzcG9zZVRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dChkaXNwb3NlVGltZW91dCk7XG4gICAgfVxuICB9O1xuICBjb25zdCBkaXNwb3NlID0gKCkgPT4ge1xuICAgIGlmIChwb3B1cEVsZW1lbnQpIHtcbiAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUocG9wdXBFbGVtZW50KTtcbiAgICAgIHBvcHVwRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHBvcHVwRWxlbWVudCk7XG4gICAgICBwb3B1cEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAocGFuZUl0ZW1TdWJzY3JpcHRpb24pIHtcbiAgICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgY2xlYXJEaXNwb3NlVGltZW91dCgpO1xuICB9O1xuICBjb25zdCBnb1RvTG9jYXRpb24gPSAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IHtcbiAgICAvLyBCZWZvcmUgd2UganVtcCB0byB0aGUgbG9jYXRpb24sIHdlIHdhbnQgdG8gY2xvc2UgdGhlIHBvcHVwLlxuICAgIGRpc3Bvc2UoKTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICBpbml0aWFsTGluZTogbGluZSxcbiAgICB9O1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwgb3B0aW9ucyk7XG4gIH07XG4gIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGV2ZW50ID0+IHtcbiAgICAvLyBJZiB0aGVyZSB3YXMgc29tZWhvdyBhbm90aGVyIHBvcHVwIGZvciB0aGlzIGd1dHRlciBpdGVtLCBkaXNwb3NlIGl0LiBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlXG4gICAgLy8gdXNlciBtYW5hZ2VzIHRvIHNjcm9sbCBhbmQgZXNjYXBlIGRpc3Bvc2FsLlxuICAgIGRpc3Bvc2UoKTtcbiAgICBwb3B1cEVsZW1lbnQgPSBzaG93UG9wdXBGb3IobWVzc2FnZXMsIGl0ZW0sIGdvVG9Mb2NhdGlvbiwgZml4ZXIpO1xuICAgIHBvcHVwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZGlzcG9zZSk7XG4gICAgcG9wdXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBjbGVhckRpc3Bvc2VUaW1lb3V0KTtcbiAgICAvLyBUaGlzIG1ha2VzIHN1cmUgdGhhdCB0aGUgcG9wdXAgZGlzYXBwZWFycyB3aGVuIHlvdSBjdHJsK3RhYiB0byBzd2l0Y2ggdGFicy5cbiAgICBwYW5lSXRlbVN1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oZGlzcG9zZSk7XG4gIH0pO1xuICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBldmVudCA9PiB7XG4gICAgLy8gV2hlbiB0aGUgcG9wdXAgaXMgc2hvd24sIHdlIHdhbnQgdG8gZGlzcG9zZSBpdCBpZiB0aGUgdXNlciBtYW5hZ2VzIHRvIG1vdmUgdGhlIGN1cnNvciBvZmYgb2ZcbiAgICAvLyB0aGUgZ3V0dGVyIGdseXBoIHdpdGhvdXQgbW92aW5nIGl0IG9udG8gdGhlIHBvcHVwLiBFdmVuIHRob3VnaCB0aGUgcG9wdXAgYXBwZWFycyBhYm92ZSAoYXMgaW5cbiAgICAvLyBaLWluZGV4IGFib3ZlKSB0aGUgZ3V0dGVyIGdseXBoLCBpZiB5b3UgbW92ZSB0aGUgY3Vyc29yIHN1Y2ggdGhhdCBpdCBpcyBvbmx5IGFib3ZlIHRoZSBnbHlwaFxuICAgIC8vIGZvciBvbmUgZnJhbWUgeW91IGNhbiBjYXVzZSB0aGUgcG9wdXAgdG8gYXBwZWFyIHdpdGhvdXQgdGhlIG1vdXNlIGV2ZXIgZW50ZXJpbmcgaXQuXG4gICAgZGlzcG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGRpc3Bvc2UsIFBPUFVQX0RJU1BPU0VfVElNRU9VVCk7XG4gIH0pO1xuICByZXR1cm4ge2l0ZW0sIGRpc3Bvc2V9O1xufVxuXG4vKipcbiAqIFNob3dzIGEgcG9wdXAgZm9yIHRoZSBkaWFnbm9zdGljIGp1c3QgYmVsb3cgdGhlIHNwZWNpZmllZCBpdGVtLlxuICovXG5mdW5jdGlvbiBzaG93UG9wdXBGb3IoXG4gICAgbWVzc2FnZXM6IEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4sXG4gICAgaXRlbTogSFRNTEVsZW1lbnQsXG4gICAgZ29Ub0xvY2F0aW9uOiAoZmlsZVBhdGg6IE51Y2xpZGVVcmksIGxpbmU6IG51bWJlcikgPT4gbWl4ZWQsXG4gICAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4gICAgKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBjaGlsZHJlbiA9IG1lc3NhZ2VzLm1hcChtZXNzYWdlID0+IHtcbiAgICBjb25zdCBjb250ZW50cyA9IGNyZWF0ZUVsZW1lbnRGb3JNZXNzYWdlKG1lc3NhZ2UsIGdvVG9Mb2NhdGlvbiwgZml4ZXIpO1xuICAgIGNvbnN0IGRpYWdub3N0aWNUeXBlQ2xhc3MgPSBtZXNzYWdlLnR5cGUgPT09ICdFcnJvcidcbiAgICAgID8gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLXBvcHVwLWVycm9yJ1xuICAgICAgOiAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtd2FybmluZyc7XG4gICAgLy8gbmF0aXZlLWtleS1iaW5kaW5ncyBhbmQgdGFiSW5kZXg9LTEgYXJlIGJvdGggbmVlZGVkIHRvIGFsbG93IGNvcHlpbmcgdGhlIHRleHQgaW4gdGhlIHBvcHVwLlxuICAgIGNvbnN0IGNsYXNzZXMgPVxuICAgICAgYG5hdGl2ZS1rZXktYmluZGluZ3MgbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtZGlhZ25vc3RpYyAke2RpYWdub3N0aWNUeXBlQ2xhc3N9YDtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiB0YWJJbmRleD17LTF9IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgIHtjb250ZW50c31cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0pO1xuICAvLyBUaGUgcG9wdXAgd2lsbCBiZSBhbiBhYnNvbHV0ZWx5IHBvc2l0aW9uZWQgY2hpbGQgZWxlbWVudCBvZiA8YXRvbS13b3Jrc3BhY2U+IHNvIHRoYXQgaXQgYXBwZWFyc1xuICAvLyBvbiB0b3Agb2YgZXZlcnl0aGluZy5cbiAgY29uc3Qgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gIGNvbnN0IGhvc3RFbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB3b3Jrc3BhY2VFbGVtZW50LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoaG9zdEVsZW1lbnQpO1xuXG4gIC8vIE1vdmUgaXQgZG93biB2ZXJ0aWNhbGx5IHNvIGl0IGRvZXMgbm90IGVuZCB1cCB1bmRlciB0aGUgbW91c2UgcG9pbnRlci5cbiAgY29uc3Qge3RvcCwgbGVmdH0gPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gIC8vIFRPRE8oc3NvcmFsbGVuKTogUmVtb3ZlIHRoZSBgY2hpbGRyZW5gIHByb3Agd2hlbiBGbG93IGlzIGFibGUgdG8gYXNzb2NpYXRlIEpTWCBjaGlsZHJlbiB3aXRoXG4gIC8vICAgdGhlIHByb3AgbmFtZWQgYGNoaWxkcmVuYC4gSlNYIGNoaWxkcmVuIG92ZXJ3cml0ZSB0aGUgcHJvcCBvZiB0aGUgc2FtZSBuYW1lLCBzbyBkbyB0aGF0IGZvclxuICAvLyAgIG5vdyB0byBhcHBlYXNlIGJvdGggRVNMaW50IGFuZCBGbG93LlxuICAvL1xuICAvLyAgIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8xMzU1I2lzc3VlY29tbWVudC0xNzg4ODM4OTFcbiAgUmVhY3RET00ucmVuZGVyKFxuICAgIDxEaWFnbm9zdGljc1BvcHVwIGNoaWxkcmVuPXtjaGlsZHJlbn0gbGVmdD17bGVmdH0gdG9wPXt0b3B9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvRGlhZ25vc3RpY3NQb3B1cD4sXG4gICAgaG9zdEVsZW1lbnRcbiAgKTtcblxuICAvLyBDaGVjayB0byBzZWUgd2hldGhlciB0aGUgcG9wdXAgaXMgd2l0aGluIHRoZSBib3VuZHMgb2YgdGhlIFRleHRFZGl0b3IuIElmIG5vdCwgZGlzcGxheSBpdCBhYm92ZVxuICAvLyB0aGUgZ2x5cGggcmF0aGVyIHRoYW4gYmVsb3cgaXQuXG4gIGNvbnN0IGVkaXRvciA9IGl0ZW1Ub0VkaXRvci5nZXQoaXRlbSk7XG4gIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKTtcbiAgY29uc3Qge3RvcDogZWRpdG9yVG9wLCBoZWlnaHQ6IGVkaXRvckhlaWdodH0gPSBlZGl0b3JFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCB7dG9wOiBpdGVtVG9wLCBoZWlnaHQ6IGl0ZW1IZWlnaHR9ID0gaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgY29uc3QgcG9wdXBIZWlnaHQgPSBob3N0RWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZC5jbGllbnRIZWlnaHQ7XG4gIGlmICgoaXRlbVRvcCArIGl0ZW1IZWlnaHQgKyBwb3B1cEhlaWdodCkgPiAoZWRpdG9yVG9wICsgZWRpdG9ySGVpZ2h0KSkge1xuICAgIGNvbnN0IHBvcHVwRWxlbWVudCA9IGhvc3RFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIC8vIFNoaWZ0IHRoZSBwb3B1cCBiYWNrIGRvd24gYnkgR0xZUEhfSEVJR0hULCBzbyB0aGF0IHRoZSBib3R0b20gcGFkZGluZyBvdmVybGFwcyB3aXRoIHRoZVxuICAgIC8vIGdseXBoLiBBbiBhZGRpdGlvbmFsIDQgcHggaXMgbmVlZGVkIHRvIG1ha2UgaXQgbG9vayB0aGUgc2FtZSB3YXkgaXQgZG9lcyB3aGVuIGl0IHNob3dzIHVwXG4gICAgLy8gYmVsb3cuIEkgZG9uJ3Qga25vdyB3aHkuXG4gICAgcG9wdXBFbGVtZW50LnN0eWxlLnRvcCA9IFN0cmluZyhpdGVtVG9wIC0gcG9wdXBIZWlnaHQgKyBHTFlQSF9IRUlHSFQgKyA0KSArICdweCc7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBob3N0RWxlbWVudDtcbiAgfSBmaW5hbGx5IHtcbiAgICBtZXNzYWdlcy5mb3JFYWNoKG1lc3NhZ2UgPT4ge1xuICAgICAgdHJhY2soJ2RpYWdub3N0aWNzLWd1dHRlci1zaG93LXBvcHVwJywge1xuICAgICAgICAnZGlhZ25vc3RpY3MtcHJvdmlkZXInOiBtZXNzYWdlLnByb3ZpZGVyTmFtZSxcbiAgICAgICAgJ2RpYWdub3N0aWNzLW1lc3NhZ2UnOiBtZXNzYWdlLnRleHQgfHwgbWVzc2FnZS5odG1sIHx8ICcnLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEZvck1lc3NhZ2UoXG4gIG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgZ29Ub0xvY2F0aW9uOiAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IG1peGVkLFxuICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZCxcbik6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IHByb3ZpZGVyQ2xhc3NOYW1lID0gbWVzc2FnZS50eXBlID09PSAnRXJyb3InXG4gICAgPyAnaGlnaGxpZ2h0LWVycm9yJ1xuICAgIDogJ2hpZ2hsaWdodC13YXJuaW5nJztcbiAgY29uc3QgY29weSA9ICgpID0+IHtcbiAgICBjb25zdCB0ZXh0ID0gcGxhaW5UZXh0Rm9yRGlhZ25vc3RpYyhtZXNzYWdlKTtcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KTtcbiAgfTtcbiAgbGV0IGZpeEJ1dHRvbiA9IG51bGw7XG4gIGlmIChtZXNzYWdlLmZpeCAhPSBudWxsKSB7XG4gICAgY29uc3QgYXBwbHlGaXggPSAoKSA9PiB7XG4gICAgICBmaXhlcihtZXNzYWdlKTtcbiAgICAgIHRyYWNrKCdkaWFnbm9zdGljcy1ndXR0ZXItYXV0b2ZpeCcpO1xuICAgIH07XG4gICAgZml4QnV0dG9uID0gKFxuICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXhzXCIgb25DbGljaz17YXBwbHlGaXh9PkZpeDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbiAgY29uc3QgaGVhZGVyID0gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtaGVhZGVyXCI+XG4gICAgICB7Zml4QnV0dG9ufVxuICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXhzXCIgb25DbGljaz17Y29weX0+Q29weTwvYnV0dG9uPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgcHVsbC1yaWdodCAke3Byb3ZpZGVyQ2xhc3NOYW1lfWB9PnttZXNzYWdlLnByb3ZpZGVyTmFtZX08L3NwYW4+XG4gICAgPC9kaXY+XG4gICk7XG4gIGNvbnN0IHRyYWNlRWxlbWVudHMgPSBtZXNzYWdlLnRyYWNlXG4gICAgPyBtZXNzYWdlLnRyYWNlLm1hcCh0cmFjZUl0ZW0gPT4gY3JlYXRlRWxlbWVudEZvclRyYWNlKHRyYWNlSXRlbSwgZ29Ub0xvY2F0aW9uKSlcbiAgICA6IG51bGw7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtoZWFkZXJ9XG4gICAgICA8ZGl2PntjcmVhdGVNZXNzYWdlU3BhbihtZXNzYWdlKX08L2Rpdj5cbiAgICAgIHt0cmFjZUVsZW1lbnRzfVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBwbGFpblRleHRGb3JEaWFnbm9zdGljKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIGNvbnN0IHtnZXRQYXRofSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbiAgZnVuY3Rpb24gcGxhaW5UZXh0Rm9ySXRlbShpdGVtOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UgfCBUcmFjZSk6IHN0cmluZyB7XG4gICAgbGV0IG1haW5Db21wb25lbnQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGl0ZW0uaHRtbCAhPSBudWxsKSB7XG4gICAgICAvLyBRdWljayBhbmQgZGlydHkgd2F5IHRvIGdldCBhbiBhcHByb3hpbWF0aW9uIGZvciB0aGUgcGxhaW4gdGV4dCBmcm9tIEhUTUwuIFRoaXMgd2lsbCB3b3JrIGluXG4gICAgICAvLyBzaW1wbGUgY2FzZXMsIGFueXdheS5cbiAgICAgIG1haW5Db21wb25lbnQgPSBpdGVtLmh0bWwucmVwbGFjZSgnPGJyLz4nLCAnXFxuJykucmVwbGFjZSgvPFtePl0qPi9nLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudChpdGVtLnRleHQgIT0gbnVsbCk7XG4gICAgICBtYWluQ29tcG9uZW50ID0gaXRlbS50ZXh0O1xuICAgIH1cblxuICAgIGxldCBwYXRoQ29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChpdGVtLmZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgIHBhdGhDb21wb25lbnQgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGluZUNvbXBvbmVudCA9IGl0ZW0ucmFuZ2UgIT0gbnVsbCA/IGA6JHtpdGVtLnJhbmdlLnN0YXJ0LnJvdyArIDF9YCA6ICcnO1xuICAgICAgcGF0aENvbXBvbmVudCA9ICc6ICcgKyBnZXRQYXRoKGl0ZW0uZmlsZVBhdGgpICsgbGluZUNvbXBvbmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFpbkNvbXBvbmVudCArIHBhdGhDb21wb25lbnQ7XG4gIH1cbiAgY29uc3QgdHJhY2UgPSBtZXNzYWdlLnRyYWNlICE9IG51bGwgPyBtZXNzYWdlLnRyYWNlIDogW107XG4gIHJldHVybiBbbWVzc2FnZSwgLi4udHJhY2VdLm1hcChwbGFpblRleHRGb3JJdGVtKS5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEZvclRyYWNlKFxuICB0cmFjZTogVHJhY2UsXG4gIGdvVG9Mb2NhdGlvbjogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbik6IFJlYWN0RWxlbWVudCB7XG4gIGxldCBsb2NTcGFuID0gbnVsbDtcbiAgLy8gTG9jYWwgdmFyaWFibGUgc28gdGhhdCB0aGUgdHlwZSByZWZpbmVtZW50IGhvbGRzIGluIHRoZSBvbkNsaWNrIGhhbmRsZXIuXG4gIGNvbnN0IHBhdGggPSB0cmFjZS5maWxlUGF0aDtcbiAgaWYgKHBhdGgpIHtcbiAgICBjb25zdCBbLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGgpO1xuICAgIGxldCBsb2NTdHJpbmcgPSByZWxhdGl2ZVBhdGg7XG4gICAgaWYgKHRyYWNlLnJhbmdlKSB7XG4gICAgICBsb2NTdHJpbmcgKz0gYDoke3RyYWNlLnJhbmdlLnN0YXJ0LnJvdyArIDF9YDtcbiAgICB9XG4gICAgY29uc3Qgb25DbGljayA9ICgpID0+IHtcbiAgICAgIHRyYWNrKCdkaWFnbm9zdGljcy1ndXR0ZXItZ290by1sb2NhdGlvbicpO1xuICAgICAgZ29Ub0xvY2F0aW9uKHBhdGgsIE1hdGgubWF4KHRyYWNlLnJhbmdlID8gdHJhY2UucmFuZ2Uuc3RhcnQucm93IDogMCwgMCkpO1xuICAgIH07XG4gICAgbG9jU3BhbiA9IDxzcGFuPjogPGEgaHJlZj1cIiNcIiBvbkNsaWNrPXtvbkNsaWNrfT57bG9jU3RyaW5nfTwvYT48L3NwYW4+O1xuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtjcmVhdGVNZXNzYWdlU3Bhbih0cmFjZSl9XG4gICAgICB7bG9jU3Bhbn1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWVzc2FnZVNwYW4obWVzc2FnZToge2h0bWw/OiBzdHJpbmc7IHRleHQ/OiBzdHJpbmd9KTogUmVhY3RFbGVtZW50IHtcbiAgaWYgKG1lc3NhZ2UuaHRtbCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIDxzcGFuIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBtZXNzYWdlLmh0bWx9fSAvPjtcbiAgfSBlbHNlIGlmIChtZXNzYWdlLnRleHQgIT0gbnVsbCkge1xuICAgIHJldHVybiA8c3Bhbj57bWVzc2FnZS50ZXh0fTwvc3Bhbj47XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIDxzcGFuPkRpYWdub3N0aWMgbGFja3MgbWVzc2FnZS48L3NwYW4+O1xuICB9XG59XG5cbmNsYXNzIERpYWdub3N0aWNzUG9wdXAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgIGxlZnQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICB0b3A6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXBcIlxuICAgICAgICBzdHlsZT17e2xlZnQ6IHRoaXMucHJvcHMubGVmdCArICdweCcsIHRvcDogdGhpcy5wcm9wcy50b3AgKyAncHgnfX0+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl19