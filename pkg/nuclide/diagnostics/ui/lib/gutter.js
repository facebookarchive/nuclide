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
//# sourceMappingURL=data:application/json;base64,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QUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFDLEFBQUM7O1FBRWpFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtPQUNoQixDQUNOO0tBQ0g7OztXQWZrQjtBQUNqQixjQUFRLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDeEIsVUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNqQyxTQUFHLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0tBQ2pDOzs7O1NBTEcsZ0JBQWdCO0dBQVMsS0FBSyxDQUFDLFNBQVMiLCJmaWxlIjoiZ3V0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBGaWxlTWVzc2FnZVVwZGF0ZSxcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBUcmFjZSxcbn0gZnJvbSAnLi4vLi4vYmFzZSc7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vLi4vYW5hbHl0aWNzJyk7XG5jb25zdCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgR1VUVEVSX0lEID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyJztcblxuLy8gTmVlZHMgdG8gYmUgdGhlIHNhbWUgYXMgZ2x5cGgtaGVpZ2h0IGluIGd1dHRlci5hdG9tLXRleHQtZWRpdG9yLmxlc3MuXG5jb25zdCBHTFlQSF9IRUlHSFQgPSAxNTsgLy8gcHhcblxuY29uc3QgUE9QVVBfRElTUE9TRV9USU1FT1VUID0gMTAwO1xuXG4vLyBUT0RPKG1ib2xpbik6IE1ha2UgaXQgc28gdGhhdCB3aGVuIG1vdXNpbmcgb3ZlciBhbiBlbGVtZW50IHdpdGggdGhpcyBDU1MgY2xhc3MgKG9yIHNwZWNpZmljYWxseSxcbi8vIHRoZSBjaGlsZCBlbGVtZW50IHdpdGggdGhlIFwicmVnaW9uXCIgQ1NTIGNsYXNzKSwgd2UgYWxzbyBkbyBhIHNob3dQb3B1cEZvcigpLiBUaGlzIHNlZW1zIHRvIGJlXG4vLyB0cmlja3kgZ2l2ZW4gaG93IHRoZSBET00gb2YgYSBUZXh0RWRpdG9yIHdvcmtzIHRvZGF5LiBUaGVyZSBhcmUgZGl2LnRpbGUgZWxlbWVudHMsIGVhY2ggb2Ygd2hpY2hcbi8vIGhhcyBpdHMgb3duIGRpdi5oaWdobGlnaHRzIGVsZW1lbnQgYW5kIG1hbnkgZGl2LmxpbmUgZWxlbWVudHMuIFRoZSBkaXYuaGlnaGxpZ2h0cyBlbGVtZW50IGhhcyAwXG4vLyBvciBtb3JlIGNoaWxkcmVuLCBlYWNoIGNoaWxkIGJlaW5nIGEgZGl2LmhpZ2hsaWdodCB3aXRoIGEgY2hpbGQgZGl2LnJlZ2lvbi4gVGhlIGRpdi5yZWdpb25cbi8vIGVsZW1lbnQgaXMgZGVmaW5lZCB0byBiZSB7cG9zaXRpb246IGFic29sdXRlOyBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogLTF9LiBUaGUgYWJzb2x1dGVcbi8vIHBvc2l0aW9uaW5nIGFuZCBuZWdhdGl2ZSB6LWluZGV4IG1ha2UgaXQgc28gaXQgaXNuJ3QgZWxpZ2libGUgZm9yIG1vdXNlb3ZlciBldmVudHMsIHNvIHdlXG4vLyBtaWdodCBoYXZlIHRvIGxpc3RlbiBmb3IgbW91c2VvdmVyIGV2ZW50cyBvbiBUZXh0RWRpdG9yIGFuZCB0aGVuIHVzZSBpdHMgb3duIEFQSXMsIHN1Y2ggYXNcbi8vIGRlY29yYXRpb25zRm9yU2NyZWVuUm93UmFuZ2UoKSwgdG8gc2VlIGlmIHRoZXJlIGlzIGEgaGl0IHRhcmdldCBpbnN0ZWFkLiBTaW5jZSB0aGlzIHdpbGwgYmVcbi8vIGhhcHBlbmluZyBvbm1vdXNlbW92ZSwgd2UgYWxzbyBoYXZlIHRvIGJlIGNhcmVmdWwgdG8gbWFrZSBzdXJlIHRoaXMgaXMgbm90IGV4cGVuc2l2ZS5cbmNvbnN0IEhJR0hMSUdIVF9DU1MgPSAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktaGlnaGxpZ2h0JztcblxuY29uc3QgRVJST1JfSElHSExJR0hUX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1oaWdobGlnaHQtZXJyb3InO1xuY29uc3QgV0FSTklOR19ISUdITElHSFRfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWhpZ2hsaWdodC13YXJuaW5nJztcblxuY29uc3QgRVJST1JfR1VUVEVSX0NTUyA9ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1ndXR0ZXItZXJyb3InO1xuY29uc3QgV0FSTklOR19HVVRURVJfQ1NTID0gJ251Y2xpZGUtZGlhZ25vc3RpY3MtZ3V0dGVyLXVpLWd1dHRlci13YXJuaW5nJztcblxuY29uc3QgZWRpdG9yVG9NYXJrZXJzOiBXZWFrTWFwPFRleHRFZGl0b3IsIFNldDxhdG9tJE1hcmtlcj4+ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0ZW1Ub0VkaXRvcjogV2Vha01hcDxIVE1MRWxlbWVudCwgVGV4dEVkaXRvcj4gPSBuZXcgV2Vha01hcCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlVcGRhdGVUb0VkaXRvcihcbiAgZWRpdG9yOiBUZXh0RWRpdG9yLFxuICB1cGRhdGU6IEZpbGVNZXNzYWdlVXBkYXRlLFxuICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZCxcbik6IHZvaWQge1xuICBsZXQgZ3V0dGVyID0gZWRpdG9yLmd1dHRlcldpdGhOYW1lKEdVVFRFUl9JRCk7XG4gIGlmICghZ3V0dGVyKSB7XG4gICAgLy8gVE9ETyhqZXNzaWNhbGluKTogRGV0ZXJtaW5lIGFuIGFwcHJvcHJpYXRlIHByaW9yaXR5IHNvIHRoYXQgdGhlIGd1dHRlcjpcbiAgICAvLyAoMSkgU2hvd3MgdXAgdG8gdGhlIHJpZ2h0IG9mIHRoZSBsaW5lIG51bWJlcnMuXG4gICAgLy8gKDIpIFNob3dzIHRoZSBpdGVtcyB0aGF0IGFyZSBhZGRlZCB0byBpdCByaWdodCBhd2F5LlxuICAgIC8vIFVzaW5nIGEgdmFsdWUgb2YgMTAgZml4ZXMgKDEpLCBidXQgYnJlYWtzICgyKS4gVGhpcyBzZWVtcyBsaWtlIGl0IGlzIGxpa2VseSBhIGJ1ZyBpbiBBdG9tLlxuXG4gICAgLy8gQnkgZGVmYXVsdCwgYSBndXR0ZXIgd2lsbCBiZSBkZXN0cm95ZWQgd2hlbiBpdHMgZWRpdG9yIGlzIGRlc3Ryb3llZCxcbiAgICAvLyBzbyB0aGVyZSBpcyBubyBuZWVkIHRvIHJlZ2lzdGVyIGEgY2FsbGJhY2sgdmlhIG9uRGlkRGVzdHJveSgpLlxuICAgIGd1dHRlciA9IGVkaXRvci5hZGRHdXR0ZXIoe1xuICAgICAgbmFtZTogR1VUVEVSX0lELFxuICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBsZXQgbWFya2VyO1xuICBsZXQgbWFya2VycyA9IGVkaXRvclRvTWFya2Vycy5nZXQoZWRpdG9yKTtcblxuICAvLyBUT0RPOiBDb25zaWRlciBhIG1vcmUgZWZmaWNpZW50IHN0cmF0ZWd5IHRoYXQgZG9lcyBub3QgYmxpbmRseSBkZXN0cm95IGFsbCBvZiB0aGVcbiAgLy8gZXhpc3RpbmcgbWFya2Vycy5cbiAgaWYgKG1hcmtlcnMpIHtcbiAgICBmb3IgKG1hcmtlciBvZiBtYXJrZXJzKSB7XG4gICAgICBtYXJrZXIuZGVzdHJveSgpO1xuICAgIH1cbiAgICBtYXJrZXJzLmNsZWFyKCk7XG4gIH0gZWxzZSB7XG4gICAgbWFya2VycyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIGNvbnN0IHJvd1RvTWVzc2FnZTogTWFwPG51bWJlciwgQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPj4gPSBuZXcgTWFwKCk7XG4gIGZ1bmN0aW9uIGFkZE1lc3NhZ2VGb3JSb3cobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlLCByb3c6IG51bWJlcikge1xuICAgIGxldCBtZXNzYWdlcyA9IHJvd1RvTWVzc2FnZS5nZXQocm93KTtcbiAgICBpZiAoIW1lc3NhZ2VzKSB7XG4gICAgICBtZXNzYWdlcyA9IFtdO1xuICAgICAgcm93VG9NZXNzYWdlLnNldChyb3csIG1lc3NhZ2VzKTtcbiAgICB9XG4gICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgbWVzc2FnZSBvZiB1cGRhdGUubWVzc2FnZXMpIHtcbiAgICBjb25zdCByYW5nZSA9IG1lc3NhZ2UucmFuZ2U7XG4gICAgbGV0IGhpZ2hsaWdodE1hcmtlcjtcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIGFkZE1lc3NhZ2VGb3JSb3cobWVzc2FnZSwgcmFuZ2Uuc3RhcnQucm93KTtcbiAgICAgIGhpZ2hsaWdodE1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRNZXNzYWdlRm9yUm93KG1lc3NhZ2UsIDApO1xuICAgIH1cblxuICAgIGxldCBoaWdobGlnaHRDc3NDbGFzcztcbiAgICBpZiAobWVzc2FnZS50eXBlID09PSAnRXJyb3InKSB7XG4gICAgICBoaWdobGlnaHRDc3NDbGFzcyA9IEhJR0hMSUdIVF9DU1MgKyAnICcgKyBFUlJPUl9ISUdITElHSFRfQ1NTO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaWdobGlnaHRDc3NDbGFzcyA9IEhJR0hMSUdIVF9DU1MgKyAnICcgKyBXQVJOSU5HX0hJR0hMSUdIVF9DU1M7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtYXJrZXIgdW5kZXJsaW5lcyB0ZXh0LlxuICAgIGlmIChoaWdobGlnaHRNYXJrZXIpIHtcbiAgICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihoaWdobGlnaHRNYXJrZXIsIHtcbiAgICAgICAgdHlwZTogJ2hpZ2hsaWdodCcsXG4gICAgICAgIGNsYXNzOiBoaWdobGlnaHRDc3NDbGFzcyxcbiAgICAgIH0pO1xuICAgICAgbWFya2Vycy5hZGQoaGlnaGxpZ2h0TWFya2VyKTtcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIGFsbCBvZiB0aGUgZ3V0dGVyIG1hcmtlcnMgZm9yIHRoZSBzYW1lIHJvdyBhbmQgY29tYmluZSB0aGVtIGludG8gb25lIG1hcmtlci9wb3B1cC5cbiAgZm9yIChjb25zdCBbcm93LCBtZXNzYWdlc10gb2Ygcm93VG9NZXNzYWdlLmVudHJpZXMoKSkge1xuICAgIC8vIElmIGF0IGxlYXN0IG9uZSBvZiB0aGUgZGlhZ25vc3RpY3MgaXMgYW4gZXJyb3IgcmF0aGVyIHRoYW4gdGhlIHdhcm5pbmcsXG4gICAgLy8gZGlzcGxheSB0aGUgZ2x5cGggaW4gdGhlIGd1dHRlciB0byByZXByZXNlbnQgYW4gZXJyb3IgcmF0aGVyIHRoYW4gYSB3YXJuaW5nLlxuICAgIGNvbnN0IGd1dHRlck1hcmtlckNzc0NsYXNzID0gbWVzc2FnZXMuc29tZShtc2cgPT4gbXNnLnR5cGUgPT09ICdFcnJvcicpXG4gICAgICA/IEVSUk9SX0dVVFRFUl9DU1NcbiAgICAgIDogV0FSTklOR19HVVRURVJfQ1NTO1xuXG4gICAgLy8gVGhpcyBtYXJrZXIgYWRkcyBzb21lIFVJIHRvIHRoZSBndXR0ZXIuXG4gICAgY29uc3Qge2l0ZW0sIGRpc3Bvc2V9ID0gY3JlYXRlR3V0dGVySXRlbShtZXNzYWdlcywgZ3V0dGVyTWFya2VyQ3NzQ2xhc3MsIGZpeGVyKTtcbiAgICBpdGVtVG9FZGl0b3Iuc2V0KGl0ZW0sIGVkaXRvcik7XG4gICAgY29uc3QgZ3V0dGVyTWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihbcm93LCAwXSk7XG4gICAgZ3V0dGVyLmRlY29yYXRlTWFya2VyKGd1dHRlck1hcmtlciwge2l0ZW19KTtcbiAgICBndXR0ZXJNYXJrZXIub25EaWREZXN0cm95KGRpc3Bvc2UpO1xuICAgIG1hcmtlcnMuYWRkKGd1dHRlck1hcmtlcik7XG4gIH1cblxuICBlZGl0b3JUb01hcmtlcnMuc2V0KGVkaXRvciwgbWFya2Vycyk7XG5cbiAgLy8gT25jZSB0aGUgZ3V0dGVyIGlzIHNob3duIGZvciB0aGUgZmlyc3QgdGltZSwgaXQgaXMgZGlzcGxheWVkIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlXG4gIC8vIFRleHRFZGl0b3IuXG4gIGlmICh1cGRhdGUubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgIGd1dHRlci5zaG93KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlR3V0dGVySXRlbShcbiAgbWVzc2FnZXM6IEFycmF5PEZpbGVEaWFnbm9zdGljTWVzc2FnZT4sXG4gIGd1dHRlck1hcmtlckNzc0NsYXNzOiBzdHJpbmcsXG4gIGZpeGVyOiAobWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlKSA9PiB2b2lkLFxuKToge2l0ZW06IEhUTUxFbGVtZW50OyBkaXNwb3NlOiAoKSA9PiB2b2lkfSB7XG4gIGNvbnN0IGl0ZW0gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBpdGVtLmlubmVyVGV4dCA9ICdcXHUyNUI2JzsgLy8gVW5pY29kZSBjaGFyYWN0ZXIgZm9yIGEgcmlnaHQtcG9pbnRpbmcgdHJpYW5nbGUuXG4gIGl0ZW0uY2xhc3NOYW1lID0gZ3V0dGVyTWFya2VyQ3NzQ2xhc3M7XG4gIGxldCBwb3B1cEVsZW1lbnQgPSBudWxsO1xuICBsZXQgcGFuZUl0ZW1TdWJzY3JpcHRpb24gPSBudWxsO1xuICBsZXQgZGlzcG9zZVRpbWVvdXQgPSBudWxsO1xuICBjb25zdCBjbGVhckRpc3Bvc2VUaW1lb3V0ID0gKCkgPT4ge1xuICAgIGlmIChkaXNwb3NlVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGRpc3Bvc2VUaW1lb3V0KTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGRpc3Bvc2UgPSAoKSA9PiB7XG4gICAgaWYgKHBvcHVwRWxlbWVudCkge1xuICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShwb3B1cEVsZW1lbnQpO1xuICAgICAgcG9wdXBFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocG9wdXBFbGVtZW50KTtcbiAgICAgIHBvcHVwRWxlbWVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmIChwYW5lSXRlbVN1YnNjcmlwdGlvbikge1xuICAgICAgcGFuZUl0ZW1TdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgcGFuZUl0ZW1TdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgICBjbGVhckRpc3Bvc2VUaW1lb3V0KCk7XG4gIH07XG4gIGNvbnN0IGdvVG9Mb2NhdGlvbiA9IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4ge1xuICAgIC8vIEJlZm9yZSB3ZSBqdW1wIHRvIHRoZSBsb2NhdGlvbiwgd2Ugd2FudCB0byBjbG9zZSB0aGUgcG9wdXAuXG4gICAgZGlzcG9zZSgpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgIGluaXRpYWxMaW5lOiBsaW5lLFxuICAgIH07XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCBvcHRpb25zKTtcbiAgfTtcbiAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZXZlbnQgPT4ge1xuICAgIC8vIElmIHRoZXJlIHdhcyBzb21laG93IGFub3RoZXIgcG9wdXAgZm9yIHRoaXMgZ3V0dGVyIGl0ZW0sIGRpc3Bvc2UgaXQuIFRoaXMgY2FuIGhhcHBlbiBpZiB0aGVcbiAgICAvLyB1c2VyIG1hbmFnZXMgdG8gc2Nyb2xsIGFuZCBlc2NhcGUgZGlzcG9zYWwuXG4gICAgZGlzcG9zZSgpO1xuICAgIHBvcHVwRWxlbWVudCA9IHNob3dQb3B1cEZvcihtZXNzYWdlcywgaXRlbSwgZ29Ub0xvY2F0aW9uLCBmaXhlcik7XG4gICAgcG9wdXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBkaXNwb3NlKTtcbiAgICBwb3B1cEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGNsZWFyRGlzcG9zZVRpbWVvdXQpO1xuICAgIC8vIFRoaXMgbWFrZXMgc3VyZSB0aGF0IHRoZSBwb3B1cCBkaXNhcHBlYXJzIHdoZW4geW91IGN0cmwrdGFiIHRvIHN3aXRjaCB0YWJzLlxuICAgIHBhbmVJdGVtU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShkaXNwb3NlKTtcbiAgfSk7XG4gIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGV2ZW50ID0+IHtcbiAgICAvLyBXaGVuIHRoZSBwb3B1cCBpcyBzaG93biwgd2Ugd2FudCB0byBkaXNwb3NlIGl0IGlmIHRoZSB1c2VyIG1hbmFnZXMgdG8gbW92ZSB0aGUgY3Vyc29yIG9mZiBvZlxuICAgIC8vIHRoZSBndXR0ZXIgZ2x5cGggd2l0aG91dCBtb3ZpbmcgaXQgb250byB0aGUgcG9wdXAuIEV2ZW4gdGhvdWdoIHRoZSBwb3B1cCBhcHBlYXJzIGFib3ZlIChhcyBpblxuICAgIC8vIFotaW5kZXggYWJvdmUpIHRoZSBndXR0ZXIgZ2x5cGgsIGlmIHlvdSBtb3ZlIHRoZSBjdXJzb3Igc3VjaCB0aGF0IGl0IGlzIG9ubHkgYWJvdmUgdGhlIGdseXBoXG4gICAgLy8gZm9yIG9uZSBmcmFtZSB5b3UgY2FuIGNhdXNlIHRoZSBwb3B1cCB0byBhcHBlYXIgd2l0aG91dCB0aGUgbW91c2UgZXZlciBlbnRlcmluZyBpdC5cbiAgICBkaXNwb3NlVGltZW91dCA9IHNldFRpbWVvdXQoZGlzcG9zZSwgUE9QVVBfRElTUE9TRV9USU1FT1VUKTtcbiAgfSk7XG4gIHJldHVybiB7aXRlbSwgZGlzcG9zZX07XG59XG5cbi8qKlxuICogU2hvd3MgYSBwb3B1cCBmb3IgdGhlIGRpYWdub3N0aWMganVzdCBiZWxvdyB0aGUgc3BlY2lmaWVkIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHNob3dQb3B1cEZvcihcbiAgICBtZXNzYWdlczogQXJyYXk8RmlsZURpYWdub3N0aWNNZXNzYWdlPixcbiAgICBpdGVtOiBIVE1MRWxlbWVudCxcbiAgICBnb1RvTG9jYXRpb246IChmaWxlUGF0aDogTnVjbGlkZVVyaSwgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbiAgICBmaXhlcjogKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSkgPT4gdm9pZCxcbiAgICApOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGNoaWxkcmVuID0gbWVzc2FnZXMubWFwKG1lc3NhZ2UgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnRzID0gY3JlYXRlRWxlbWVudEZvck1lc3NhZ2UobWVzc2FnZSwgZ29Ub0xvY2F0aW9uLCBmaXhlcik7XG4gICAgY29uc3QgZGlhZ25vc3RpY1R5cGVDbGFzcyA9IG1lc3NhZ2UudHlwZSA9PT0gJ0Vycm9yJ1xuICAgICAgPyAnbnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtZXJyb3InXG4gICAgICA6ICdudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cC13YXJuaW5nJztcbiAgICAvLyBuYXRpdmUta2V5LWJpbmRpbmdzIGFuZCB0YWJJbmRleD0tMSBhcmUgYm90aCBuZWVkZWQgdG8gYWxsb3cgY29weWluZyB0aGUgdGV4dCBpbiB0aGUgcG9wdXAuXG4gICAgY29uc3QgY2xhc3NlcyA9XG4gICAgICBgbmF0aXZlLWtleS1iaW5kaW5ncyBudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cC1kaWFnbm9zdGljICR7ZGlhZ25vc3RpY1R5cGVDbGFzc31gO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHRhYkluZGV4PXstMX0gY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAge2NvbnRlbnRzfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSk7XG4gIC8vIFRoZSBwb3B1cCB3aWxsIGJlIGFuIGFic29sdXRlbHkgcG9zaXRpb25lZCBjaGlsZCBlbGVtZW50IG9mIDxhdG9tLXdvcmtzcGFjZT4gc28gdGhhdCBpdCBhcHBlYXJzXG4gIC8vIG9uIHRvcCBvZiBldmVyeXRoaW5nLlxuICBjb25zdCB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgY29uc3QgaG9zdEVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHdvcmtzcGFjZUVsZW1lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChob3N0RWxlbWVudCk7XG5cbiAgLy8gTW92ZSBpdCBkb3duIHZlcnRpY2FsbHkgc28gaXQgZG9lcyBub3QgZW5kIHVwIHVuZGVyIHRoZSBtb3VzZSBwb2ludGVyLlxuICBjb25zdCB7dG9wLCBsZWZ0fSA9IGl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgUmVhY3RET00ucmVuZGVyKFxuICAgIDxEaWFnbm9zdGljc1BvcHVwIGxlZnQ9e2xlZnR9IHRvcD17dG9wfT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L0RpYWdub3N0aWNzUG9wdXA+LFxuICAgIGhvc3RFbGVtZW50XG4gICk7XG5cbiAgLy8gQ2hlY2sgdG8gc2VlIHdoZXRoZXIgdGhlIHBvcHVwIGlzIHdpdGhpbiB0aGUgYm91bmRzIG9mIHRoZSBUZXh0RWRpdG9yLiBJZiBub3QsIGRpc3BsYXkgaXQgYWJvdmVcbiAgLy8gdGhlIGdseXBoIHJhdGhlciB0aGFuIGJlbG93IGl0LlxuICBjb25zdCBlZGl0b3IgPSBpdGVtVG9FZGl0b3IuZ2V0KGl0ZW0pO1xuICBjb25zdCBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcik7XG4gIGNvbnN0IHt0b3A6IGVkaXRvclRvcCwgaGVpZ2h0OiBlZGl0b3JIZWlnaHR9ID0gZWRpdG9yRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgY29uc3Qge3RvcDogaXRlbVRvcCwgaGVpZ2h0OiBpdGVtSGVpZ2h0fSA9IGl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGNvbnN0IHBvcHVwSGVpZ2h0ID0gaG9zdEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuY2xpZW50SGVpZ2h0O1xuICBpZiAoKGl0ZW1Ub3AgKyBpdGVtSGVpZ2h0ICsgcG9wdXBIZWlnaHQpID4gKGVkaXRvclRvcCArIGVkaXRvckhlaWdodCkpIHtcbiAgICBjb25zdCBwb3B1cEVsZW1lbnQgPSBob3N0RWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAvLyBTaGlmdCB0aGUgcG9wdXAgYmFjayBkb3duIGJ5IEdMWVBIX0hFSUdIVCwgc28gdGhhdCB0aGUgYm90dG9tIHBhZGRpbmcgb3ZlcmxhcHMgd2l0aCB0aGVcbiAgICAvLyBnbHlwaC4gQW4gYWRkaXRpb25hbCA0IHB4IGlzIG5lZWRlZCB0byBtYWtlIGl0IGxvb2sgdGhlIHNhbWUgd2F5IGl0IGRvZXMgd2hlbiBpdCBzaG93cyB1cFxuICAgIC8vIGJlbG93LiBJIGRvbid0IGtub3cgd2h5LlxuICAgIHBvcHVwRWxlbWVudC5zdHlsZS50b3AgPSBTdHJpbmcoaXRlbVRvcCAtIHBvcHVwSGVpZ2h0ICsgR0xZUEhfSEVJR0hUICsgNCkgKyAncHgnO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gaG9zdEVsZW1lbnQ7XG4gIH0gZmluYWxseSB7XG4gICAgbWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgIHRyYWNrKCdkaWFnbm9zdGljcy1ndXR0ZXItc2hvdy1wb3B1cCcsIHtcbiAgICAgICAgJ2RpYWdub3N0aWNzLXByb3ZpZGVyJzogbWVzc2FnZS5wcm92aWRlck5hbWUsXG4gICAgICAgICdkaWFnbm9zdGljcy1tZXNzYWdlJzogbWVzc2FnZS50ZXh0IHx8IG1lc3NhZ2UuaHRtbCB8fCAnJyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRGb3JNZXNzYWdlKFxuICBtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIGdvVG9Mb2NhdGlvbjogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbiAgZml4ZXI6IChtZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UpID0+IHZvaWQsXG4pOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IHByb3ZpZGVyQ2xhc3NOYW1lID0gbWVzc2FnZS50eXBlID09PSAnRXJyb3InXG4gICAgPyAnaGlnaGxpZ2h0LWVycm9yJ1xuICAgIDogJ2hpZ2hsaWdodC13YXJuaW5nJztcbiAgY29uc3QgY29weSA9ICgpID0+IHtcbiAgICBjb25zdCB0ZXh0ID0gcGxhaW5UZXh0Rm9yRGlhZ25vc3RpYyhtZXNzYWdlKTtcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KTtcbiAgfTtcbiAgbGV0IGZpeEJ1dHRvbiA9IG51bGw7XG4gIGlmIChtZXNzYWdlLmZpeCAhPSBudWxsKSB7XG4gICAgY29uc3QgYXBwbHlGaXggPSAoKSA9PiB7XG4gICAgICBmaXhlcihtZXNzYWdlKTtcbiAgICAgIHRyYWNrKCdkaWFnbm9zdGljcy1ndXR0ZXItYXV0b2ZpeCcpO1xuICAgIH07XG4gICAgZml4QnV0dG9uID0gKFxuICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXhzXCIgb25DbGljaz17YXBwbHlGaXh9PkZpeDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbiAgY29uc3QgaGVhZGVyID0gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1ndXR0ZXItdWktcG9wdXAtaGVhZGVyXCI+XG4gICAgICB7Zml4QnV0dG9ufVxuICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXhzXCIgb25DbGljaz17Y29weX0+Q29weTwvYnV0dG9uPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgcHVsbC1yaWdodCAke3Byb3ZpZGVyQ2xhc3NOYW1lfWB9PnttZXNzYWdlLnByb3ZpZGVyTmFtZX08L3NwYW4+XG4gICAgPC9kaXY+XG4gICk7XG4gIGNvbnN0IHRyYWNlRWxlbWVudHMgPSBtZXNzYWdlLnRyYWNlXG4gICAgPyBtZXNzYWdlLnRyYWNlLm1hcCh0cmFjZUl0ZW0gPT4gY3JlYXRlRWxlbWVudEZvclRyYWNlKHRyYWNlSXRlbSwgZ29Ub0xvY2F0aW9uKSlcbiAgICA6IG51bGw7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIHtoZWFkZXJ9XG4gICAgICA8ZGl2PntjcmVhdGVNZXNzYWdlU3BhbihtZXNzYWdlKX08L2Rpdj5cbiAgICAgIHt0cmFjZUVsZW1lbnRzfVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBwbGFpblRleHRGb3JEaWFnbm9zdGljKG1lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSk6IHN0cmluZyB7XG4gIGNvbnN0IHtnZXRQYXRofSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbiAgZnVuY3Rpb24gcGxhaW5UZXh0Rm9ySXRlbShpdGVtOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UgfCBUcmFjZSk6IHN0cmluZyB7XG4gICAgbGV0IG1haW5Db21wb25lbnQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGl0ZW0uaHRtbCAhPSBudWxsKSB7XG4gICAgICAvLyBRdWljayBhbmQgZGlydHkgd2F5IHRvIGdldCBhbiBhcHByb3hpbWF0aW9uIGZvciB0aGUgcGxhaW4gdGV4dCBmcm9tIEhUTUwuIFRoaXMgd2lsbCB3b3JrIGluXG4gICAgICAvLyBzaW1wbGUgY2FzZXMsIGFueXdheS5cbiAgICAgIG1haW5Db21wb25lbnQgPSBpdGVtLmh0bWwucmVwbGFjZSgnPGJyLz4nLCAnXFxuJykucmVwbGFjZSgvPFtePl0qPi9nLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudChpdGVtLnRleHQgIT0gbnVsbCk7XG4gICAgICBtYWluQ29tcG9uZW50ID0gaXRlbS50ZXh0O1xuICAgIH1cblxuICAgIGxldCBwYXRoQ29tcG9uZW50ID0gdW5kZWZpbmVkO1xuICAgIGlmIChpdGVtLmZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgIHBhdGhDb21wb25lbnQgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGluZUNvbXBvbmVudCA9IGl0ZW0ucmFuZ2UgIT0gbnVsbCA/IGA6JHtpdGVtLnJhbmdlLnN0YXJ0LnJvdyArIDF9YCA6ICcnO1xuICAgICAgcGF0aENvbXBvbmVudCA9ICc6ICcgKyBnZXRQYXRoKGl0ZW0uZmlsZVBhdGgpICsgbGluZUNvbXBvbmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFpbkNvbXBvbmVudCArIHBhdGhDb21wb25lbnQ7XG4gIH1cbiAgY29uc3QgdHJhY2UgPSBtZXNzYWdlLnRyYWNlICE9IG51bGwgPyBtZXNzYWdlLnRyYWNlIDogW107XG4gIHJldHVybiBbbWVzc2FnZSwgLi4udHJhY2VdLm1hcChwbGFpblRleHRGb3JJdGVtKS5qb2luKCdcXG4nKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEZvclRyYWNlKFxuICB0cmFjZTogVHJhY2UsXG4gIGdvVG9Mb2NhdGlvbjogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiBtaXhlZCxcbik6IEhUTUxFbGVtZW50IHtcbiAgbGV0IGxvY1NwYW4gPSBudWxsO1xuICAvLyBMb2NhbCB2YXJpYWJsZSBzbyB0aGF0IHRoZSB0eXBlIHJlZmluZW1lbnQgaG9sZHMgaW4gdGhlIG9uQ2xpY2sgaGFuZGxlci5cbiAgY29uc3QgcGF0aCA9IHRyYWNlLmZpbGVQYXRoO1xuICBpZiAocGF0aCkge1xuICAgIGNvbnN0IFssIHJlbGF0aXZlUGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgocGF0aCk7XG4gICAgbGV0IGxvY1N0cmluZyA9IHJlbGF0aXZlUGF0aDtcbiAgICBpZiAodHJhY2UucmFuZ2UpIHtcbiAgICAgIGxvY1N0cmluZyArPSBgOiR7dHJhY2UucmFuZ2Uuc3RhcnQucm93ICsgMX1gO1xuICAgIH1cbiAgICBjb25zdCBvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgdHJhY2soJ2RpYWdub3N0aWNzLWd1dHRlci1nb3RvLWxvY2F0aW9uJyk7XG4gICAgICBnb1RvTG9jYXRpb24ocGF0aCwgTWF0aC5tYXgodHJhY2UucmFuZ2UgPyB0cmFjZS5yYW5nZS5zdGFydC5yb3cgOiAwLCAwKSk7XG4gICAgfTtcbiAgICBsb2NTcGFuID0gPHNwYW4+OiA8YSBocmVmPVwiI1wiIG9uQ2xpY2s9e29uQ2xpY2t9Pntsb2NTdHJpbmd9PC9hPjwvc3Bhbj47XG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAge2NyZWF0ZU1lc3NhZ2VTcGFuKHRyYWNlKX1cbiAgICAgIHtsb2NTcGFufVxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNZXNzYWdlU3BhbihtZXNzYWdlOiB7aHRtbD86IHN0cmluZywgdGV4dD86IHN0cmluZ30pOiBIVE1MRWxlbWVudCB7XG4gIGlmIChtZXNzYWdlLmh0bWwgIT0gbnVsbCkge1xuICAgIHJldHVybiA8c3BhbiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogbWVzc2FnZS5odG1sfX0gLz47XG4gIH0gZWxzZSBpZiAobWVzc2FnZS50ZXh0ICE9IG51bGwpIHtcbiAgICByZXR1cm4gPHNwYW4+e21lc3NhZ2UudGV4dH08L3NwYW4+O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiA8c3Bhbj5EaWFnbm9zdGljIGxhY2tzIG1lc3NhZ2UuPC9zcGFuPjtcbiAgfVxufVxuXG5jbGFzcyBEaWFnbm9zdGljc1BvcHVwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLm5vZGUsXG4gICAgbGVmdDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIHRvcDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLWd1dHRlci11aS1wb3B1cFwiXG4gICAgICAgIHN0eWxlPXt7bGVmdDogdGhpcy5wcm9wcy5sZWZ0ICsgJ3B4JywgdG9wOiB0aGlzLnByb3BzLnRvcCArICdweCd9fVxuICAgICAgICA+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl19