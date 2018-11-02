"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyUpdateToEditor = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../../../../nuclide-commons-atom/range");

  _range = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireWildcard(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _BlockDecoration() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-ui/BlockDecoration"));

  _BlockDecoration = function () {
    return data;
  };

  return data;
}

function GroupUtils() {
  const data = _interopRequireWildcard(require("./GroupUtils"));

  GroupUtils = function () {
    return data;
  };

  return data;
}

function _aim() {
  const data = require("./aim");

  _aim = function () {
    return data;
  };

  return data;
}

function _getDiagnosticDatatip() {
  const data = require("./getDiagnosticDatatip.js");

  _getDiagnosticDatatip = function () {
    return data;
  };

  return data;
}

function _processTimed() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/processTimed"));

  _processTimed = function () {
    return data;
  };

  return data;
}

function _AbortController() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/AbortController"));

  _AbortController = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* eslint-env browser */
const APPLY_UPDATE_TO_EDITOR_SAMPLE_RATE = 40;
const DESTROY_DIAGNOSTICS_POPUP_DELAY = 200;
const GUTTER_ID = 'diagnostics-gutter';
const MARKERS_LINE_CHUNK_SIZE = 5;
const PROCESS_CHUNK_TIME_LIMIT = 10;
const PROCESS_CHUNK_DELAY = 50; // TODO(mbolin): Make it so that when mousing over an element with this CSS class (or specifically,
// the child element with the "region" CSS class), we also do a showPopupFor(). This seems to be
// tricky given how the DOM of a TextEditor works today. There are div.tile elements, each of which
// has its own div.highlights element and many div.line elements. The div.highlights element has 0
// or more children, each child being a div.highlight with a child div.region. The div.region
// element is defined to be {position: absolute; pointer-events: none; z-index: -1}. The absolute
// positioning and negative z-index make it so it isn't eligible for mouseover events, so we
// might have to listen for mouseover events on TextEditor and then use its own APIs, such as
// decorationsForScreenRowRange(), to see if there is a hit target instead. Since this will be
// happening onmousemove, we also have to be careful to make sure this is not expensive.

const HIGHLIGHT_CSS = 'diagnostics-gutter-ui-highlight';
const HIGHLIGHT_CSS_LEVELS = {
  Error: 'diagnostics-gutter-ui-highlight-error',
  Warning: 'diagnostics-gutter-ui-highlight-warning',
  Info: 'diagnostics-gutter-ui-highlight-info',
  Hint: ''
};
const GUTTER_CSS_GROUPS = {
  review: 'diagnostics-gutter-ui-gutter-review',
  errors: 'diagnostics-gutter-ui-gutter-error',
  warnings: 'diagnostics-gutter-ui-gutter-warning',
  info: 'diagnostics-gutter-ui-gutter-info',
  action: 'diagnostics-gutter-ui-gutter-action',
  hidden: ''
};
const itemToEditor = new WeakMap();
const editorToAbortController = new WeakMap();
const editorToMarkers = new WeakMap();
const editorToProcessState = new WeakMap();
const editorToGutterOpen = new WeakMap();
const handleSpawnPopupEvents = new _rxjsCompatUmdMin.Subject();
const SpawnPopupEvents = handleSpawnPopupEvents.switchMap(({
  messages,
  diagnosticUpdater,
  gutter,
  item,
  editorElement,
  gutterMarker
}) => {
  return spawnPopup(messages, diagnosticUpdater, gutter, item).let((0, _observable().completingSwitchMap)(popupElement => {
    const innerPopupElement = popupElement.firstChild;

    if (!(innerPopupElement instanceof HTMLElement)) {
      throw new Error("Invariant violation: \"innerPopupElement instanceof HTMLElement\"");
    } // Events which should cause the popup to close.


    return _rxjsCompatUmdMin.Observable.merge((0, _aim().hoveringOrAiming)(item, innerPopupElement, editorElement), // This makes sure that the popup disappears when you ctrl+tab to switch tabs.
    (0, _event().observableFromSubscribeFunction)(cb => atom.workspace.onDidChangeActivePaneItem(cb)).mapTo(false), (0, _event().observableFromSubscribeFunction)(cb => gutterMarker.onDidDestroy(cb)).delay(DESTROY_DIAGNOSTICS_POPUP_DELAY).mapTo(false), _rxjsCompatUmdMin.Observable.fromEvent(item, 'click').filter(() => messages.some(message => message.kind === 'review')).mapTo(false));
  })).takeUntil((0, _event().observableFromSubscribeFunction)(cb => gutter.onDidDestroy(cb))).takeWhile(Boolean);
}).share();
/*
 * Processes (clears old markers and creates new ones) a section of the editorTop
 * beginning with `startingLine`.
 *
 * Returns whether the last chunk was processed
 */

function processChunk(editor) {
  const state = (0, _nullthrows().default)(editorToProcessState.get(editor));
  const {
    blockDecorationFragments,
    diagnosticUpdater,
    gutter,
    messages,
    openedMessageIds,
    setOpenMessageIds,
    startingLine
  } = state;
  let {
    rolloverMessage
  } = state;
  const lastEditorRow = editor.getLastBufferRow();
  const endingLine = Math.min(startingLine + MARKERS_LINE_CHUNK_SIZE, // ending line is **exclusive**, and we always want to process the last line
  // of the editor, so use one more than it.
  lastEditorRow + 1);
  let markerMap = editorToMarkers.get(editor);

  if (markerMap == null) {
    markerMap = new Map();
    editorToMarkers.set(editor, markerMap);
  } // Remove all prior markers in this range


  let rangeMarkers = markerMap.get(startingLine);

  if (rangeMarkers) {
    for (const marker of rangeMarkers) {
      marker.destroy();
    }

    rangeMarkers.clear();
  } else {
    rangeMarkers = new Set();
    markerMap.set(startingLine, rangeMarkers);
  }

  let nextRolloverMessage;
  const rowToMessage = new Map(); // Using a while loop rather than for...of since for...of closes iterators
  // when it completes abruptly through a break -- we want this state to be
  // carried to the next iteration

  while (true) {
    var _message$range, _message$range$start;

    let message; // If the last iteration passed along a "rollover" and we haven't processed
    // it yet, process that first.

    if (rolloverMessage != null) {
      message = rolloverMessage;
      rolloverMessage = null;
    } else {
      // Otherwise, pull from the message iterator.
      // $FlowFixMe Flow doesn't understand Symbol.iterator
      const {
        value,
        done
      } = messages[Symbol.iterator]().next();

      if (done) {
        break;
      }

      message = value;
    }

    const row = (_message$range = message.range) === null || _message$range === void 0 ? void 0 : (_message$range$start = _message$range.start) === null || _message$range$start === void 0 ? void 0 : _message$range$start.row;

    if (row != null && row >= endingLine) {
      // We've read too far. Since we can't peek at iterators, we have to read
      // one message "too far" into the next chunk. Store it so it is available
      // to the next iteration to process. Then leave this iteration.
      nextRolloverMessage = message;
      break;
    }

    const wordRange = message && message.range != null && message.range.isEmpty() ? (0, _range().wordAtPosition)(editor, message.range.start) : null;
    const range = wordRange != null ? wordRange.range : message.range;
    const highlightCssClass = (0, _classnames().default)(HIGHLIGHT_CSS, HIGHLIGHT_CSS_LEVELS[message.type], message.stale ? 'diagnostics-gutter-ui-highlight-stale' : '');

    if (range) {
      const highlightMarkers = highlightEditorRange(editor, range, highlightCssClass);

      for (const marker of highlightMarkers) {
        rangeMarkers.add(marker);
      }

      addMessageForRow(rowToMessage, message, range.start.row);
    } else {
      addMessageForRow(rowToMessage, message, 0);
    }
  }

  const gutterMarkers = combineMarkers({
    editor,
    gutter,
    rowToMessage,
    diagnosticUpdater,
    openedMessageIds,
    setOpenMessageIds
  });

  for (const marker of gutterMarkers) {
    rangeMarkers.add(marker);
    marker.onDidDestroy(() => {
      if (rangeMarkers != null) {
        rangeMarkers.delete(marker);
      }
    });
  } // create diagnostics messages with block decoration and maintain their openness


  blockDecorationFragments.push(createBlockDecorations({
    editor,
    rowToMessage,
    openedMessageIds,
    setOpenMessageIds,
    startingLine
  }));

  if (endingLine >= lastEditorRow) {
    // We just finished processing the last line of the editor. Call `markDone` and
    // don't enqueue another chunk to end iteration
    return true;
  }

  Object.assign(state, {
    startingLine: endingLine,
    rolloverMessage: nextRolloverMessage,
    messages
  });
  return false;
}

function combineMarkers({
  editor,
  gutter,
  rowToMessage,
  diagnosticUpdater,
  openedMessageIds,
  setOpenMessageIds
}) {
  const markers = []; // Find all of the gutter markers for the same row and combine them into one marker/popup.

  for (const [row, messages] of rowToMessage.entries()) {
    // This marker adds some UI to the gutter.
    const gutterMarker = editor.markBufferPosition([row, 0]);

    if (!(gutter != null)) {
      throw new Error("Invariant violation: \"gutter != null\"");
    }

    const {
      item,
      dispose
    } = createGutterItem({
      editor,
      messages,
      diagnosticUpdater,
      gutter,
      openedMessageIds,
      setOpenMessageIds,
      gutterMarker
    });
    itemToEditor.set(item, editor);
    gutter.decorateMarker(gutterMarker, {
      item
    });
    gutterMarker.onDidDestroy(dispose);
    markers.push(gutterMarker);
  }

  return markers;
}

function addMessageForRow(rowToMessage, message, row) {
  let messages = rowToMessage.get(row);

  if (!messages) {
    messages = [];
    rowToMessage.set(row, messages);
  }

  messages.push(message);
}

function highlightEditorRange(editor, range, highlightCssClass) {
  // There is no API in Atom to say: I want to put an underline on all the
  // lines in this range. The closest is "highlight" which splits your range
  // into three boxes: the part of the first line, all the lines in between
  // and the part of the last line.
  //
  // This means that some lines in the middle are going to be dropped and
  // they are going to extend all the way to the right of the buffer.
  //
  // To fix this, we can manually split it line by line and give to atom
  // those ranges.
  const markers = [];

  for (let line = range.start.row; line <= range.end.row; line++) {
    let start;
    let end;
    const lineText = editor.getTextInBufferRange(new _atom.Range([line, 0], [line + 1, 0]));

    if (line === range.start.row) {
      start = range.start.column;
    } else {
      start = (lineText.match(/^\s*/) || [''])[0].length;
    }

    if (line === range.end.row) {
      end = range.end.column;
    } else {
      // Note: this is technically off by 1 (\n) or 2 (\r\n) but Atom will
      // not extend the range past the actual characters displayed on the
      // line
      end = lineText.length;
    }

    const highlightMarker = editor.markBufferRange(new _atom.Range([line, start], [line, end]));
    editor.decorateMarker(highlightMarker, {
      type: 'highlight',
      class: highlightCssClass
    });
    markers.push(highlightMarker);
  }

  return markers;
}

_applyUpdateToEditor.displayName = 'applyUpdateToEditor';
const applyUpdateToEditor = (0, _analytics().decorateTrackTimingSampled)(_applyUpdateToEditor, APPLY_UPDATE_TO_EDITOR_SAMPLE_RATE);
exports.applyUpdateToEditor = applyUpdateToEditor;

function _applyUpdateToEditor(editor, update, diagnosticUpdater, blockDecorationContainer, openedMessageIds, setOpenMessageIds) {
  let gutter = editor.gutterWithName(GUTTER_ID);

  if (!gutter) {
    // TODO(jessicalin): Determine an appropriate priority so that the gutter:
    // (1) Shows up to the right of the line numbers.
    // (2) Shows the items that are added to it right away.
    // Using a value of 10 fixes (1), but breaks (2). This seems like it is likely a bug in Atom.
    // By default, a gutter will be destroyed when its editor is destroyed,
    // so there is no need to register a callback via onDidDestroy().
    gutter = editor.addGutter({
      name: GUTTER_ID,
      visible: false,
      // Priority is -200 by default and 0 is the line number
      priority: -1000
    });
  }

  const priorAbortController = editorToAbortController.get(editor);

  if (priorAbortController != null) {
    // Cancel any other processing of diagnostics in this editor.
    // This has the effect of "debouncing" the creation of markers, which is
    // useful when diagnostic providers give us new results on keystroke.
    //
    // NB: It's possible that with unending results from providers (such as through
    // constant typing), this process never finishes. Something more ideal would
    // be to start updating with new results where the last iteration stopped.
    //
    // This cancels the prior abortcontroller, triggering cleanup below, **regardless
    // if the last process has completed**. Even in the case where the last
    // process completed, we want to clean up listeners for editor destruction,
    // etc.
    priorAbortController.abort();
  }

  editorToProcessState.set(editor, {
    diagnosticUpdater,
    gutter: (0, _nullthrows().default)(gutter),
    startingLine: 0,
    // $FlowFixMe
    messages: update[Symbol.iterator](),
    blockDecorationFragments: [],
    openedMessageIds,
    setOpenMessageIds
  });
  const abortController = new (_AbortController().default)();
  (0, _processTimed().default)(function* () {
    while (!processChunk(editor)) {
      // Once the gutter is shown for the first time, it is displayed for the lifetime of the
      // TextEditor.
      if (!editorToGutterOpen.get(editor) && editorHasMarkers(editor)) {
        (0, _nullthrows().default)(gutter).show();
        editorToGutterOpen.set(editor, true);
      }

      yield;
    }

    if (editorHasMarkers(editor)) {
      _analytics().default.track('diagnostics-show-editor-diagnostics', {
        source: diagnosticUpdater.getLastUpdateSource(),
        diagnosticsCount: Array.from(update).length
      });
    }

    const {
      blockDecorationFragments
    } = (0, _nullthrows().default)(editorToProcessState.get(editor));

    _reactDom.default.render(React.createElement(React.Fragment, null, blockDecorationFragments), blockDecorationContainer);
  }, {
    signal: abortController.signal,
    limit: PROCESS_CHUNK_TIME_LIMIT,
    delay: PROCESS_CHUNK_DELAY
  });
  editorToAbortController.set(editor, abortController);
  return new (_UniversalDisposable().default)(() => abortController.abort(), (0, _event().observableFromSubscribeFunction)(cb => editor.onDidDestroy(cb)).let((0, _observable().takeUntilAbort)(abortController.signal)).subscribe(() => {
    abortController.abort(); // clean up openned message ids

    removeOpenMessageId(Array.from(update), openedMessageIds, setOpenMessageIds);
  }));
}

function editorHasMarkers(editor) {
  const editorMarkers = editorToMarkers.get(editor);

  if (editorMarkers == null) {
    return false;
  }

  for (const markers of editorMarkers.values()) {
    if (markers.size) {
      return true;
    }
  }

  return false;
}

function createBlockDecorations({
  editor,
  rowToMessage,
  openedMessageIds,
  setOpenMessageIds,
  startingLine
}) {
  const blockRowToMessages = new Map();
  rowToMessage.forEach((messages, row) => {
    if (messages.some(message => message.kind === 'review' && message.id != null && openedMessageIds != null && openedMessageIds.has(message.id))) {
      blockRowToMessages.set(row, messages);
    }
  });
  return React.createElement(React.Fragment, {
    key: startingLine
  }, Array.from(blockRowToMessages).map(([row, messages]) => {
    return React.createElement(_BlockDecoration().default, {
      range: new _atom.Range([row, 0], [row, 0]),
      editor: editor,
      key: messages[0].id
    }, React.createElement(_Button().Button, {
      onClick: () => removeOpenMessageId(messages, openedMessageIds, setOpenMessageIds)
    }, "Close"), messages.map(message => {
      if (!message.getBlockComponent) {
        return null;
      }

      const Component = message.getBlockComponent();
      return React.createElement(Component, {
        key: message.id
      });
    }));
  }));
}

function createGutterItem({
  editor,
  messages,
  diagnosticUpdater,
  gutter,
  openedMessageIds,
  setOpenMessageIds,
  gutterMarker
}) {
  // Determine which group to display.
  const messageGroups = new Set();
  messages.forEach(msg => messageGroups.add(GroupUtils().getGroup(msg)));
  const group = GroupUtils().getHighestPriorityGroup(messageGroups);
  const item = document.createElement('span');
  const groupClassName = GUTTER_CSS_GROUPS[group];
  item.className = (0, _classnames().default)('diagnostics-gutter-ui-item', groupClassName, {
    'diagnostics-gutter-ui-gutter-stale': messages.every(message => message.stale)
  }); // Add the icon

  const icon = document.createElement('span');
  icon.className = `icon icon-${GroupUtils().getIcon(group)}`;
  item.appendChild(icon);
  const editorElement = editor.getElement();
  const disposable = new (_UniversalDisposable().default)(SpawnPopupEvents.subscribe(), _rxjsCompatUmdMin.Observable.fromEvent(item, 'mouseenter').subscribe(() => {
    handleSpawnPopupEvents.next({
      messages,
      diagnosticUpdater,
      gutter,
      item,
      editorElement,
      gutterMarker
    });
  }), _rxjsCompatUmdMin.Observable.fromEvent(item, 'click').subscribe(() => {
    addOpenMessageId(messages, openedMessageIds, setOpenMessageIds);
  }));
  return {
    item,

    dispose() {
      disposable.dispose();
    }

  };
}

function addOpenMessageId(messages, openedMessageIds, setOpenMessageIds) {
  const newOpenedMessageIds = new Set([...openedMessageIds]);
  messages.forEach(message => {
    if (message.id != null) {
      newOpenedMessageIds.add(message.id);
    }
  }); // Closing block decoration is handled by editor destroy or close button
  // Only fire a set if there are new opened messages.

  if (newOpenedMessageIds.size > 0) {
    setOpenMessageIds(newOpenedMessageIds);
  }
}

function removeOpenMessageId(messages, openedMessageIds, setOpenMessageIds) {
  if (openedMessageIds.size === 0) {
    return;
  }

  const newOpenedMessageIds = new Set([...openedMessageIds]);
  messages.forEach(message => {
    if (message.id != null) {
      newOpenedMessageIds.delete(message.id);
    }
  });
  setOpenMessageIds(newOpenedMessageIds);
}

function spawnPopup(messages, diagnosticUpdater, gutter, item) {
  return _rxjsCompatUmdMin.Observable.create(observer => {
    const goToLocation = (path, line) => {
      // Before we jump to the location, we want to close the popup.
      const column = 0;
      (0, _goToLocation().goToLocation)(path, {
        line,
        column
      });
      observer.complete();
    };

    const popupElement = showPopupFor(messages, item, goToLocation, diagnosticUpdater, gutter);
    observer.next(popupElement);
    return () => {
      _reactDom.default.unmountComponentAtNode(popupElement);

      if (!(popupElement.parentNode != null)) {
        throw new Error("Invariant violation: \"popupElement.parentNode != null\"");
      }

      popupElement.parentNode.removeChild(popupElement);
    };
  });
}
/**
 * Shows a popup for the diagnostic just below the specified item.
 */


function showPopupFor(messages, item, goToLocation, diagnosticUpdater, gutter) {
  // The popup will be an absolutely positioned child element of <atom-workspace> so that it appears
  // on top of everything.
  const workspaceElement = atom.views.getView(atom.workspace);
  const hostElement = document.createElement('div');
  hostElement.classList.add('diagnostics-gutter-popup'); // $FlowFixMe check parentNode for null

  workspaceElement.parentNode.appendChild(hostElement);
  const {
    bottom: itemBottom,
    top: itemTop,
    height: itemHeight
  } = item.getBoundingClientRect(); // $FlowFixMe atom$Gutter.getElement is not a documented API, but it beats using a query selector.

  const gutterContainer = gutter.getElement();
  const {
    right: gutterRight
  } = gutterContainer.getBoundingClientRect();

  const trackedFixer = (...args) => {
    diagnosticUpdater.applyFix(...args);

    _analytics().default.track('diagnostics-gutter-autofix');
  };

  const trackedGoToLocation = (filePath, line) => {
    goToLocation(filePath, line);

    _analytics().default.track('diagnostics-gutter-goto-location');
  };

  const editor = itemToEditor.get(item);

  if (!(editor != null)) {
    throw new Error("Invariant violation: \"editor != null\"");
  }

  diagnosticUpdater.fetchCodeActions(editor, messages);
  diagnosticUpdater.fetchDescriptions(messages);
  const popupTop = itemBottom;
  const BoundPopup = (0, _getDiagnosticDatatip().makeDatatipComponent)(messages, diagnosticUpdater, {
    fixer: trackedFixer,
    goToLocation: trackedGoToLocation,
    style: {
      left: gutterRight,
      top: popupTop,
      position: 'absolute'
    }
  });

  _reactDom.default.render(React.createElement(BoundPopup, null), hostElement); // Check to see whether the popup is within the bounds of the TextEditor. If not, display it above
  // the glyph rather than below it.


  const editorElement = atom.views.getView(editor);
  const {
    top: editorTop,
    height: editorHeight
  } = editorElement.getBoundingClientRect();
  const popupElement = hostElement.firstElementChild;

  if (!(popupElement instanceof HTMLElement)) {
    throw new Error("Invariant violation: \"popupElement instanceof HTMLElement\"");
  }

  const popupHeight = popupElement.clientHeight;

  if (itemTop + itemHeight + popupHeight > editorTop + editorHeight) {
    // if the popup top is out of editor's top bound, position popup at top: 0px
    // so it does not get cutoff.
    const popupTopEdge = Math.max(0, popupTop - popupHeight - itemHeight);
    popupElement.style.top = `${popupTopEdge}px`;
  }

  try {
    return hostElement;
  } finally {
    messages.forEach(message => {
      _analytics().default.track('diagnostics-gutter-show-popup', {
        'diagnostics-provider': message.providerName,
        // flowlint-next-line sketchy-null-string:off
        'diagnostics-message': message.text || message.html || ''
      });
    });
  }
}