'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationStackController = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _NavigationStack;

function _load_NavigationStack() {
  return _NavigationStack = require('./NavigationStack');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Location;

function _load_Location() {
  return _Location = require('./Location');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function log(message) {}
// Uncomment this to debug
// console.log(message);


// Handles the state machine that responds to various atom events.
//
// After a Nav move, any non-nav moves or scroll changes update the current
// nav location. So that a nav-stack move(forward/backwards) will return
// position and scroll after the non-nav move/scrolls.
//
// When doing a forwards/backwards nav-stack move, ignore all events
// until the move is complete.
//
// There are several user scenarios, each which spawn different event orders:
// - startup - open file
//     - onActivate, activePaneStopChanging
// - changing tabs
//     - onActivate, activePaneStopChanging
// - atom.workspace.open of closed file
//     - create, scroll, activate, open, scroll, activePaneStopChanging
// - atom.workspace.open of open file, no scroll or move
//     - activate, open, activePaneStopChanging
// - atom.workspace.open of open file, with move
//     - activate, position, open, scroll, activePaneStopChanging
// - atom.workspace.open of current file
//     - position, open, scroll
//
// - nuclide-atom-helpers.goToLocationInEditor
//     - position, onOptInNavigation, [scroll]
//
// In general, when we get a new event, if the editor is not the current,
// then we push a new element on the nav stack; if the editor of the new event
// does match the top of the nav stack, then we update the top of the nav stack
// with the new location.
//
// This works except for the last case of open into the current file.
//
// To deal with the above - we do the following hack:
// If an open occurs and it is not within an activate/activePaneStopChanging pair,
// and the top matches the newly opened editor, then we have the last case
// of 'open within the current file'. So, we restore the current top to its
// previous location before pushing a new top.
class NavigationStackController {
  // Indicates that we are in the middle of a activate/onDidStopChangingActivePaneItem
  // pair of events.
  constructor() {
    this._navigationStack = new (_NavigationStack || _load_NavigationStack()).NavigationStack();
    this._isNavigating = false;
    this._inActivate = false;
    this._lastLocation = null;
  }
  // The last location update we've seen. See discussion below on event order.

  // Indicates that we're processing a forward/backwards navigation in the stack.
  // While processing a navigation stack move we don't update the nav stack.


  _updateStackLocation(editor) {
    if (this._isNavigating) {
      return;
    }

    // See discussion below on event order ...
    const previousEditor = this._navigationStack.getCurrentEditor();
    if (previousEditor === editor) {
      const previousLocation = this._navigationStack.getCurrent();

      if (!(previousLocation != null && previousLocation.type === 'editor')) {
        throw new Error('Invariant violation: "previousLocation != null && previousLocation.type === \'editor\'"');
      }

      this._lastLocation = Object.assign({}, previousLocation);
    }
    this._navigationStack.attemptUpdate((0, (_Location || _load_Location()).getLocationOfEditor)(editor));
  }

  updatePosition(editor, newBufferPosition) {
    log(`updatePosition ${newBufferPosition.row}, ` + `${newBufferPosition.column} ${(0, (_string || _load_string()).maybeToString)(editor.getPath())}`);

    this._updateStackLocation(editor);
  }

  // scrollTop is in Pixels
  updateScroll(editor, scrollTop) {
    log(`updateScroll ${scrollTop} ${(0, (_string || _load_string()).maybeToString)(editor.getPath())}`);

    this._updateStackLocation(editor);
  }

  onCreate(editor) {
    log(`onCreate ${(0, (_string || _load_string()).maybeToString)(editor.getPath())}`);

    this._navigationStack.editorOpened(editor);
    this._updateStackLocation(editor);
  }

  onDestroy(editor) {
    log(`onDestroy ${(0, (_string || _load_string()).maybeToString)(editor.getPath())}`);

    this._navigationStack.editorClosed(editor);
  }

  // Open is always preceded by activate, unless opening the current file
  onOpen(editor) {
    log(`onOpen ${(0, (_string || _load_string()).maybeToString)(editor.getPath())}`);

    // Hack alert, an atom.workspace.open of a location in the current editor,
    // we get the location update before the onDidOpen event, and we don't get
    // an activate/onDidStopChangingActivePaneItem pair. So here,
    // we restore top of the stack to the previous location before pushing a new
    // nav stack entry.
    if (!this._inActivate && this._lastLocation != null && this._lastLocation.editor === editor && this._navigationStack.getCurrentEditor() === editor) {
      this._navigationStack.attemptUpdate(this._lastLocation);
      this._navigationStack.push((0, (_Location || _load_Location()).getLocationOfEditor)(editor));
    } else {
      this._updateStackLocation(editor);
    }
    this._lastLocation = null;
  }

  onActivate(editor) {
    log(`onActivate ${(0, (_string || _load_string()).maybeToString)(editor.getPath())}`);
    this._inActivate = true;
    this._updateStackLocation(editor);
  }

  onActiveStopChanging(editor) {
    log(`onActivePaneStopChanging ${(0, (_string || _load_string()).maybeToString)(editor.getPath())}`);
    this._inActivate = false;
  }

  onOptInNavigation(editor) {
    log(`onOptInNavigation ${(0, (_string || _load_string()).maybeToString)(editor.getPath())}`);
    // Opt-in navigation is handled in the same way as a file open with no preceeding activation
    this.onOpen(editor);
  }

  // When closing a project path, we remove all stack entries contained in that
  // path which are not also contained in a project path which is remaining open.
  removePath(removedPath, remainingDirectories) {
    log(`Removing path ${removedPath} remaining: ${JSON.stringify(remainingDirectories)}`);
    this._navigationStack.filter(location => {
      const uri = (0, (_Location || _load_Location()).getPathOfLocation)(location);
      return uri == null || !(_nuclideUri || _load_nuclideUri()).default.contains(removedPath, uri) || remainingDirectories.find(directory => (_nuclideUri || _load_nuclideUri()).default.contains(directory, uri)) != null;
    });
  }

  _navigateTo(location) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!!_this._isNavigating) {
        throw new Error('Invariant violation: "!this._isNavigating"');
      }

      if (location == null) {
        return;
      }

      _this._isNavigating = true;
      try {
        const editor = yield (0, (_Location || _load_Location()).editorOfLocation)(location);
        // Note that this will not actually update the scroll position
        // The scroll position update will happen on the next tick.
        log(`navigating to: ${location.scrollTop} ${JSON.stringify(location.bufferPosition)}`);
        (0, (_textEditor || _load_textEditor()).setPositionAndScroll)(editor, location.bufferPosition, location.scrollTop);
      } finally {
        _this._isNavigating = false;
      }
    })();
  }

  navigateForwards() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      log('navigateForwards');
      if (!_this2._isNavigating) {
        yield _this2._navigateTo(_this2._navigationStack.next());
      }
    })();
  }

  navigateBackwards() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      log('navigateBackwards');
      if (!_this3._isNavigating) {
        yield _this3._navigateTo(_this3._navigationStack.previous());
      }
    })();
  }

  observeStackChanges() {
    return _rxjsBundlesRxMinJs.Observable.of(this._navigationStack).concat(this._navigationStack.observeChanges());
  }

  // For Testing.
  getLocations() {
    return this._navigationStack.getLocations();
  }

  // For Testing.
  getIndex() {
    return this._navigationStack.getIndex();
  }
}
exports.NavigationStackController = NavigationStackController;