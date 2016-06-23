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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _NavigationStack2;

function _NavigationStack() {
  return _NavigationStack2 = require('./NavigationStack');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _Location2;

function _Location() {
  return _Location2 = require('./Location');
}

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

var NavigationStackController = (function () {
  function NavigationStackController() {
    _classCallCheck(this, NavigationStackController);

    this._navigationStack = new (_NavigationStack2 || _NavigationStack()).NavigationStack();
    this._isNavigating = false;
    this._inActivate = false;
    this._lastLocation = null;
  }

  _createClass(NavigationStackController, [{
    key: '_updateStackLocation',
    value: function _updateStackLocation(editor) {
      if (this._isNavigating) {
        return;
      }

      // See discussion below on event order ...
      var previousEditor = this._navigationStack.getCurrentEditor();
      if (previousEditor === editor) {
        var previousLocation = this._navigationStack.getCurrent();
        (0, (_assert2 || _assert()).default)(previousLocation != null && previousLocation.type === 'editor');
        this._lastLocation = _extends({}, previousLocation);
      }
      this._navigationStack.attemptUpdate((0, (_Location2 || _Location()).getLocationOfEditor)(editor));
    }
  }, {
    key: 'updatePosition',
    value: function updatePosition(editor, newBufferPosition) {
      log('updatePosition ' + newBufferPosition.row + ', ' + newBufferPosition.column + ' ' + editor.getPath());

      this._updateStackLocation(editor);
    }

    // scrollTop is in Pixels
  }, {
    key: 'updateScroll',
    value: function updateScroll(editor, scrollTop) {
      log('updateScroll ' + scrollTop + ' ' + editor.getPath());

      this._updateStackLocation(editor);
    }
  }, {
    key: 'onCreate',
    value: function onCreate(editor) {
      log('onCreate ' + editor.getPath());

      this._navigationStack.editorOpened(editor);
      this._updateStackLocation(editor);
    }
  }, {
    key: 'onDestroy',
    value: function onDestroy(editor) {
      log('onDestroy ' + editor.getPath());

      this._navigationStack.editorClosed(editor);
    }

    // Open is always preceded by activate, unless opening the current file
  }, {
    key: 'onOpen',
    value: function onOpen(editor) {
      log('onOpen ' + editor.getPath());

      // Hack alert, an atom.workspace.open of a location in the current editor,
      // we get the location update before the onDidOpen event, and we don't get
      // an activate/onDidStopChangingActivePaneItem pair. So here,
      // we restore top of the stack to the previous location before pushing a new
      // nav stack entry.
      if (!this._inActivate && this._lastLocation != null && this._lastLocation.editor === editor && this._navigationStack.getCurrentEditor() === editor) {
        this._navigationStack.attemptUpdate(this._lastLocation);
        this._navigationStack.push((0, (_Location2 || _Location()).getLocationOfEditor)(editor));
      } else {
        this._updateStackLocation(editor);
      }
      this._lastLocation = null;
    }
  }, {
    key: 'onActivate',
    value: function onActivate(editor) {
      log('onActivate ' + editor.getPath());
      this._inActivate = true;
      this._updateStackLocation(editor);
    }
  }, {
    key: 'onActiveStopChanging',
    value: function onActiveStopChanging(editor) {
      log('onActivePaneStopChanging ' + editor.getPath());
      this._inActivate = false;
    }
  }, {
    key: 'onOptInNavigation',
    value: function onOptInNavigation(editor) {
      log('onOptInNavigation ' + editor.getPath());
      // Opt-in navigation is handled in the same way as a file open with no preceeding activation
      this.onOpen(editor);
    }

    // When closing a project path, we remove all stack entries contained in that
    // path which are not also contained in a project path which is remaining open.
  }, {
    key: 'removePath',
    value: function removePath(removedPath, remainingDirectories) {
      log('Removing path ' + removedPath + ' remaining: ' + JSON.stringify(remainingDirectories));
      this._navigationStack.filter(function (location) {
        var uri = (0, (_Location2 || _Location()).getPathOfLocation)(location);
        return uri == null || !(_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(removedPath, uri) || remainingDirectories.find(function (directory) {
          return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(directory, uri);
        }) != null;
      });
    }
  }, {
    key: '_navigateTo',
    value: _asyncToGenerator(function* (location) {
      (0, (_assert2 || _assert()).default)(!this._isNavigating);
      if (location == null) {
        return;
      }

      this._isNavigating = true;
      try {
        var editor = yield (0, (_Location2 || _Location()).editorOfLocation)(location);
        // Note that this will not actually update the scroll position
        // The scroll position update will happen on the next tick.
        log('navigating to: ' + location.scrollTop + ' ' + JSON.stringify(location.bufferPosition));
        (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).setPositionAndScroll)(editor, location.bufferPosition, location.scrollTop);
      } finally {
        this._isNavigating = false;
      }
    })
  }, {
    key: 'navigateForwards',
    value: _asyncToGenerator(function* () {
      log('navigateForwards');
      if (!this._isNavigating) {
        yield this._navigateTo(this._navigationStack.next());
      }
    })
  }, {
    key: 'navigateBackwards',
    value: _asyncToGenerator(function* () {
      log('navigateBackwards');
      if (!this._isNavigating) {
        yield this._navigateTo(this._navigationStack.previous());
      }
    })

    // For Testing.
  }, {
    key: 'getLocations',
    value: function getLocations() {
      return this._navigationStack.getLocations();
    }

    // For Testing.
  }, {
    key: 'getIndex',
    value: function getIndex() {
      return this._navigationStack.getIndex();
    }
  }]);

  return NavigationStackController;
})();

exports.NavigationStackController = NavigationStackController;

// Indicates that we're processing a forward/backwards navigation in the stack.
// While processing a navigation stack move we don't update the nav stack.

// Indicates that we are in the middle of a activate/onDidStopChangingActivePaneItem
// pair of events.

// The last location update we've seen. See discussion below on event order.