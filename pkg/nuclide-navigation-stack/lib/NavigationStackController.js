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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _NavigationStack = require('./NavigationStack');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _Location = require('./Location');

var _nuclideCommons = require('../../nuclide-commons');

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

    this._navigationStack = new _NavigationStack.NavigationStack();
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
        (0, _assert2['default'])(previousLocation != null && previousLocation.type === 'editor');
        this._lastLocation = _extends({}, previousLocation);
      }
      this._navigationStack.attemptUpdate((0, _Location.getLocationOfEditor)(editor));
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
        this._navigationStack.push((0, _Location.getLocationOfEditor)(editor));
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

      // Usually the setPosition would come before the onOptInNavigation
      if (this._lastLocation == null) {}
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
        var uri = (0, _Location.getPathOfLocation)(location);
        return uri == null || !(0, _nuclideRemoteUri.contains)(removedPath, uri) || _nuclideCommons.array.find(remainingDirectories, function (directory) {
          return (0, _nuclideRemoteUri.contains)(directory, uri);
        }) != null;
      });
    }
  }, {
    key: '_navigateTo',
    value: _asyncToGenerator(function* (location) {
      (0, _assert2['default'])(!this._isNavigating);
      if (location == null) {
        return;
      }

      this._isNavigating = true;
      try {
        var editor = yield (0, _Location.editorOfLocation)(location);
        // Note that this will not actually update the scroll position
        // The scroll position update will happen on the next tick.
        log('navigating to: ' + location.scrollTop + ' ' + JSON.stringify(location.bufferPosition));
        (0, _nuclideAtomHelpers.setPositionAndScroll)(editor, location.bufferPosition, location.scrollTop);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5hdmlnYXRpb25TdGFja0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQ0FnQk8sNEJBQTRCOzsrQkFDTCxtQkFBbUI7O3NCQUMzQixRQUFROzs7O2dDQUNQLDBCQUEwQjs7d0JBQ3NCLFlBQVk7OzhCQUMvRCx1QkFBdUI7O0FBRTNDLFNBQVMsR0FBRyxDQUFDLE9BQWUsRUFBUSxFQUduQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7SUF3Q1kseUJBQXlCO0FBV3pCLFdBWEEseUJBQXlCLEdBV3RCOzBCQVhILHlCQUF5Qjs7QUFZbEMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLHNDQUFxQixDQUFDO0FBQzlDLFFBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0dBQzNCOztlQWhCVSx5QkFBeUI7O1dBa0JoQiw4QkFBQyxNQUF1QixFQUFRO0FBQ2xELFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixlQUFPO09BQ1I7OztBQUdELFVBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ2hFLFVBQUksY0FBYyxLQUFLLE1BQU0sRUFBRTtBQUM3QixZQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUM1RCxpQ0FBVSxnQkFBZ0IsSUFBSSxJQUFJLElBQUksZ0JBQWdCLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDO0FBQzFFLFlBQUksQ0FBQyxhQUFhLGdCQUFPLGdCQUFnQixDQUFDLENBQUM7T0FDNUM7QUFDRCxVQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG1DQUFvQixNQUFNLENBQUMsQ0FBQyxDQUFDO0tB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QUFDOUIsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDN0M7Ozs7O1dBR08sb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDekM7OztTQXpKVSx5QkFBeUIiLCJmaWxlIjoiTmF2aWdhdGlvblN0YWNrQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0VkaXRvckxvY2F0aW9uLCBMb2NhdGlvbn0gZnJvbSAnLi9Mb2NhdGlvbic7XG5cbmltcG9ydCB7XG4gIHNldFBvc2l0aW9uQW5kU2Nyb2xsLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge05hdmlnYXRpb25TdGFja30gZnJvbSAnLi9OYXZpZ2F0aW9uU3RhY2snO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtjb250YWluc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7Z2V0UGF0aE9mTG9jYXRpb24sIGdldExvY2F0aW9uT2ZFZGl0b3IsIGVkaXRvck9mTG9jYXRpb259IGZyb20gJy4vTG9jYXRpb24nO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuZnVuY3Rpb24gbG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAvLyBVbmNvbW1lbnQgdGhpcyB0byBkZWJ1Z1xuICAvLyBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbn1cblxuLy8gSGFuZGxlcyB0aGUgc3RhdGUgbWFjaGluZSB0aGF0IHJlc3BvbmRzIHRvIHZhcmlvdXMgYXRvbSBldmVudHMuXG4vL1xuLy8gQWZ0ZXIgYSBOYXYgbW92ZSwgYW55IG5vbi1uYXYgbW92ZXMgb3Igc2Nyb2xsIGNoYW5nZXMgdXBkYXRlIHRoZSBjdXJyZW50XG4vLyBuYXYgbG9jYXRpb24uIFNvIHRoYXQgYSBuYXYtc3RhY2sgbW92ZShmb3J3YXJkL2JhY2t3YXJkcykgd2lsbCByZXR1cm5cbi8vIHBvc2l0aW9uIGFuZCBzY3JvbGwgYWZ0ZXIgdGhlIG5vbi1uYXYgbW92ZS9zY3JvbGxzLlxuLy9cbi8vIFdoZW4gZG9pbmcgYSBmb3J3YXJkcy9iYWNrd2FyZHMgbmF2LXN0YWNrIG1vdmUsIGlnbm9yZSBhbGwgZXZlbnRzXG4vLyB1bnRpbCB0aGUgbW92ZSBpcyBjb21wbGV0ZS5cbi8vXG4vLyBUaGVyZSBhcmUgc2V2ZXJhbCB1c2VyIHNjZW5hcmlvcywgZWFjaCB3aGljaCBzcGF3biBkaWZmZXJlbnQgZXZlbnQgb3JkZXJzOlxuLy8gLSBzdGFydHVwIC0gb3BlbiBmaWxlXG4vLyAgICAgLSBvbkFjdGl2YXRlLCBhY3RpdmVQYW5lU3RvcENoYW5naW5nXG4vLyAtIGNoYW5naW5nIHRhYnNcbi8vICAgICAtIG9uQWN0aXZhdGUsIGFjdGl2ZVBhbmVTdG9wQ2hhbmdpbmdcbi8vIC0gYXRvbS53b3Jrc3BhY2Uub3BlbiBvZiBjbG9zZWQgZmlsZVxuLy8gICAgIC0gY3JlYXRlLCBzY3JvbGwsIGFjdGl2YXRlLCBvcGVuLCBzY3JvbGwsIGFjdGl2ZVBhbmVTdG9wQ2hhbmdpbmdcbi8vIC0gYXRvbS53b3Jrc3BhY2Uub3BlbiBvZiBvcGVuIGZpbGUsIG5vIHNjcm9sbCBvciBtb3ZlXG4vLyAgICAgLSBhY3RpdmF0ZSwgb3BlbiwgYWN0aXZlUGFuZVN0b3BDaGFuZ2luZ1xuLy8gLSBhdG9tLndvcmtzcGFjZS5vcGVuIG9mIG9wZW4gZmlsZSwgd2l0aCBtb3ZlXG4vLyAgICAgLSBhY3RpdmF0ZSwgcG9zaXRpb24sIG9wZW4sIHNjcm9sbCwgYWN0aXZlUGFuZVN0b3BDaGFuZ2luZ1xuLy8gLSBhdG9tLndvcmtzcGFjZS5vcGVuIG9mIGN1cnJlbnQgZmlsZVxuLy8gICAgIC0gcG9zaXRpb24sIG9wZW4sIHNjcm9sbFxuLy9cbi8vIC0gbnVjbGlkZS1hdG9tLWhlbHBlcnMuZ29Ub0xvY2F0aW9uSW5FZGl0b3Jcbi8vICAgICAtIHBvc2l0aW9uLCBvbk9wdEluTmF2aWdhdGlvbiwgW3Njcm9sbF1cbi8vXG4vLyBJbiBnZW5lcmFsLCB3aGVuIHdlIGdldCBhIG5ldyBldmVudCwgaWYgdGhlIGVkaXRvciBpcyBub3QgdGhlIGN1cnJlbnQsXG4vLyB0aGVuIHdlIHB1c2ggYSBuZXcgZWxlbWVudCBvbiB0aGUgbmF2IHN0YWNrOyBpZiB0aGUgZWRpdG9yIG9mIHRoZSBuZXcgZXZlbnRcbi8vIGRvZXMgbWF0Y2ggdGhlIHRvcCBvZiB0aGUgbmF2IHN0YWNrLCB0aGVuIHdlIHVwZGF0ZSB0aGUgdG9wIG9mIHRoZSBuYXYgc3RhY2tcbi8vIHdpdGggdGhlIG5ldyBsb2NhdGlvbi5cbi8vXG4vLyBUaGlzIHdvcmtzIGV4Y2VwdCBmb3IgdGhlIGxhc3QgY2FzZSBvZiBvcGVuIGludG8gdGhlIGN1cnJlbnQgZmlsZS5cbi8vXG4vLyBUbyBkZWFsIHdpdGggdGhlIGFib3ZlIC0gd2UgZG8gdGhlIGZvbGxvd2luZyBoYWNrOlxuLy8gSWYgYW4gb3BlbiBvY2N1cnMgYW5kIGl0IGlzIG5vdCB3aXRoaW4gYW4gYWN0aXZhdGUvYWN0aXZlUGFuZVN0b3BDaGFuZ2luZyBwYWlyLFxuLy8gYW5kIHRoZSB0b3AgbWF0Y2hlcyB0aGUgbmV3bHkgb3BlbmVkIGVkaXRvciwgdGhlbiB3ZSBoYXZlIHRoZSBsYXN0IGNhc2Vcbi8vIG9mICdvcGVuIHdpdGhpbiB0aGUgY3VycmVudCBmaWxlJy4gU28sIHdlIHJlc3RvcmUgdGhlIGN1cnJlbnQgdG9wIHRvIGl0c1xuLy8gcHJldmlvdXMgbG9jYXRpb24gYmVmb3JlIHB1c2hpbmcgYSBuZXcgdG9wLlxuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25TdGFja0NvbnRyb2xsZXIge1xuICBfbmF2aWdhdGlvblN0YWNrOiBOYXZpZ2F0aW9uU3RhY2s7XG4gIC8vIEluZGljYXRlcyB0aGF0IHdlJ3JlIHByb2Nlc3NpbmcgYSBmb3J3YXJkL2JhY2t3YXJkcyBuYXZpZ2F0aW9uIGluIHRoZSBzdGFjay5cbiAgLy8gV2hpbGUgcHJvY2Vzc2luZyBhIG5hdmlnYXRpb24gc3RhY2sgbW92ZSB3ZSBkb24ndCB1cGRhdGUgdGhlIG5hdiBzdGFjay5cbiAgX2lzTmF2aWdhdGluZzogYm9vbGVhbjtcbiAgLy8gSW5kaWNhdGVzIHRoYXQgd2UgYXJlIGluIHRoZSBtaWRkbGUgb2YgYSBhY3RpdmF0ZS9vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtXG4gIC8vIHBhaXIgb2YgZXZlbnRzLlxuICBfaW5BY3RpdmF0ZTogYm9vbGVhbjtcbiAgLy8gVGhlIGxhc3QgbG9jYXRpb24gdXBkYXRlIHdlJ3ZlIHNlZW4uIFNlZSBkaXNjdXNzaW9uIGJlbG93IG9uIGV2ZW50IG9yZGVyLlxuICBfbGFzdExvY2F0aW9uOiA/RWRpdG9yTG9jYXRpb247XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbmF2aWdhdGlvblN0YWNrID0gbmV3IE5hdmlnYXRpb25TdGFjaygpO1xuICAgIHRoaXMuX2lzTmF2aWdhdGluZyA9IGZhbHNlO1xuICAgIHRoaXMuX2luQWN0aXZhdGUgPSBmYWxzZTtcbiAgICB0aGlzLl9sYXN0TG9jYXRpb24gPSBudWxsO1xuICB9XG5cbiAgX3VwZGF0ZVN0YWNrTG9jYXRpb24oZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNOYXZpZ2F0aW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2VlIGRpc2N1c3Npb24gYmVsb3cgb24gZXZlbnQgb3JkZXIgLi4uXG4gICAgY29uc3QgcHJldmlvdXNFZGl0b3IgPSB0aGlzLl9uYXZpZ2F0aW9uU3RhY2suZ2V0Q3VycmVudEVkaXRvcigpO1xuICAgIGlmIChwcmV2aW91c0VkaXRvciA9PT0gZWRpdG9yKSB7XG4gICAgICBjb25zdCBwcmV2aW91c0xvY2F0aW9uID0gdGhpcy5fbmF2aWdhdGlvblN0YWNrLmdldEN1cnJlbnQoKTtcbiAgICAgIGludmFyaWFudChwcmV2aW91c0xvY2F0aW9uICE9IG51bGwgJiYgcHJldmlvdXNMb2NhdGlvbi50eXBlID09PSAnZWRpdG9yJyk7XG4gICAgICB0aGlzLl9sYXN0TG9jYXRpb24gPSB7Li4ucHJldmlvdXNMb2NhdGlvbn07XG4gICAgfVxuICAgIHRoaXMuX25hdmlnYXRpb25TdGFjay5hdHRlbXB0VXBkYXRlKGdldExvY2F0aW9uT2ZFZGl0b3IoZWRpdG9yKSk7XG4gIH1cblxuICB1cGRhdGVQb3NpdGlvbihlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgbmV3QnVmZmVyUG9zaXRpb246IGF0b20kUG9pbnQpOiB2b2lkIHtcbiAgICBsb2coXG4gICAgICBgdXBkYXRlUG9zaXRpb24gJHtuZXdCdWZmZXJQb3NpdGlvbi5yb3d9LCAke25ld0J1ZmZlclBvc2l0aW9uLmNvbHVtbn0gJHtlZGl0b3IuZ2V0UGF0aCgpfWApO1xuXG4gICAgdGhpcy5fdXBkYXRlU3RhY2tMb2NhdGlvbihlZGl0b3IpO1xuICB9XG5cbiAgLy8gc2Nyb2xsVG9wIGlzIGluIFBpeGVsc1xuICB1cGRhdGVTY3JvbGwoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHNjcm9sbFRvcDogbnVtYmVyKTogdm9pZCB7XG4gICAgbG9nKGB1cGRhdGVTY3JvbGwgJHtzY3JvbGxUb3B9ICR7ZWRpdG9yLmdldFBhdGgoKX1gKTtcblxuICAgIHRoaXMuX3VwZGF0ZVN0YWNrTG9jYXRpb24oZWRpdG9yKTtcbiAgfVxuXG4gIG9uQ3JlYXRlKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgbG9nKGBvbkNyZWF0ZSAke2VkaXRvci5nZXRQYXRoKCl9YCk7XG5cbiAgICB0aGlzLl9uYXZpZ2F0aW9uU3RhY2suZWRpdG9yT3BlbmVkKGVkaXRvcik7XG4gICAgdGhpcy5fdXBkYXRlU3RhY2tMb2NhdGlvbihlZGl0b3IpO1xuICB9XG5cbiAgb25EZXN0cm95KGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgbG9nKGBvbkRlc3Ryb3kgJHtlZGl0b3IuZ2V0UGF0aCgpfWApO1xuXG4gICAgdGhpcy5fbmF2aWdhdGlvblN0YWNrLmVkaXRvckNsb3NlZChlZGl0b3IpO1xuICB9XG5cbiAgLy8gT3BlbiBpcyBhbHdheXMgcHJlY2VkZWQgYnkgYWN0aXZhdGUsIHVubGVzcyBvcGVuaW5nIHRoZSBjdXJyZW50IGZpbGVcbiAgb25PcGVuKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgbG9nKGBvbk9wZW4gJHtlZGl0b3IuZ2V0UGF0aCgpfWApO1xuXG4gICAgLy8gSGFjayBhbGVydCwgYW4gYXRvbS53b3Jrc3BhY2Uub3BlbiBvZiBhIGxvY2F0aW9uIGluIHRoZSBjdXJyZW50IGVkaXRvcixcbiAgICAvLyB3ZSBnZXQgdGhlIGxvY2F0aW9uIHVwZGF0ZSBiZWZvcmUgdGhlIG9uRGlkT3BlbiBldmVudCwgYW5kIHdlIGRvbid0IGdldFxuICAgIC8vIGFuIGFjdGl2YXRlL29uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gcGFpci4gU28gaGVyZSxcbiAgICAvLyB3ZSByZXN0b3JlIHRvcCBvZiB0aGUgc3RhY2sgdG8gdGhlIHByZXZpb3VzIGxvY2F0aW9uIGJlZm9yZSBwdXNoaW5nIGEgbmV3XG4gICAgLy8gbmF2IHN0YWNrIGVudHJ5LlxuICAgIGlmICghdGhpcy5faW5BY3RpdmF0ZSAmJiB0aGlzLl9sYXN0TG9jYXRpb24gIT0gbnVsbFxuICAgICAgJiYgdGhpcy5fbGFzdExvY2F0aW9uLmVkaXRvciA9PT0gZWRpdG9yXG4gICAgICAmJiB0aGlzLl9uYXZpZ2F0aW9uU3RhY2suZ2V0Q3VycmVudEVkaXRvcigpID09PSBlZGl0b3IpIHtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25TdGFjay5hdHRlbXB0VXBkYXRlKHRoaXMuX2xhc3RMb2NhdGlvbik7XG4gICAgICB0aGlzLl9uYXZpZ2F0aW9uU3RhY2sucHVzaChnZXRMb2NhdGlvbk9mRWRpdG9yKGVkaXRvcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGFja0xvY2F0aW9uKGVkaXRvcik7XG4gICAgfVxuICAgIHRoaXMuX2xhc3RMb2NhdGlvbiA9IG51bGw7XG4gIH1cblxuICBvbkFjdGl2YXRlKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgbG9nKGBvbkFjdGl2YXRlICR7ZWRpdG9yLmdldFBhdGgoKX1gKTtcbiAgICB0aGlzLl9pbkFjdGl2YXRlID0gdHJ1ZTtcbiAgICB0aGlzLl91cGRhdGVTdGFja0xvY2F0aW9uKGVkaXRvcik7XG4gIH1cblxuICBvbkFjdGl2ZVN0b3BDaGFuZ2luZyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGxvZyhgb25BY3RpdmVQYW5lU3RvcENoYW5naW5nICR7ZWRpdG9yLmdldFBhdGgoKX1gKTtcbiAgICB0aGlzLl9pbkFjdGl2YXRlID0gZmFsc2U7XG4gIH1cblxuICBvbk9wdEluTmF2aWdhdGlvbihlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGxvZyhgb25PcHRJbk5hdmlnYXRpb24gJHtlZGl0b3IuZ2V0UGF0aCgpfWApO1xuXG4gICAgLy8gVXN1YWxseSB0aGUgc2V0UG9zaXRpb24gd291bGQgY29tZSBiZWZvcmUgdGhlIG9uT3B0SW5OYXZpZ2F0aW9uXG4gICAgaWYgKHRoaXMuX2xhc3RMb2NhdGlvbiA9PSBudWxsKSB7XG5cbiAgICB9XG4gICAgLy8gT3B0LWluIG5hdmlnYXRpb24gaXMgaGFuZGxlZCBpbiB0aGUgc2FtZSB3YXkgYXMgYSBmaWxlIG9wZW4gd2l0aCBubyBwcmVjZWVkaW5nIGFjdGl2YXRpb25cbiAgICB0aGlzLm9uT3BlbihlZGl0b3IpO1xuICB9XG5cbiAgLy8gV2hlbiBjbG9zaW5nIGEgcHJvamVjdCBwYXRoLCB3ZSByZW1vdmUgYWxsIHN0YWNrIGVudHJpZXMgY29udGFpbmVkIGluIHRoYXRcbiAgLy8gcGF0aCB3aGljaCBhcmUgbm90IGFsc28gY29udGFpbmVkIGluIGEgcHJvamVjdCBwYXRoIHdoaWNoIGlzIHJlbWFpbmluZyBvcGVuLlxuICByZW1vdmVQYXRoKHJlbW92ZWRQYXRoOiBOdWNsaWRlVXJpLCByZW1haW5pbmdEaXJlY3RvcmllczogQXJyYXk8TnVjbGlkZVVyaT4pOiB2b2lkIHtcbiAgICBsb2coYFJlbW92aW5nIHBhdGggJHtyZW1vdmVkUGF0aH0gcmVtYWluaW5nOiAke0pTT04uc3RyaW5naWZ5KHJlbWFpbmluZ0RpcmVjdG9yaWVzKX1gKTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uU3RhY2suZmlsdGVyKGxvY2F0aW9uID0+IHtcbiAgICAgIGNvbnN0IHVyaSA9IGdldFBhdGhPZkxvY2F0aW9uKGxvY2F0aW9uKTtcbiAgICAgIHJldHVybiB1cmkgPT0gbnVsbCB8fCAhY29udGFpbnMocmVtb3ZlZFBhdGgsIHVyaSlcbiAgICAgICAgfHwgYXJyYXkuZmluZChyZW1haW5pbmdEaXJlY3RvcmllcywgZGlyZWN0b3J5ID0+IGNvbnRhaW5zKGRpcmVjdG9yeSwgdXJpKSkgIT0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9uYXZpZ2F0ZVRvKGxvY2F0aW9uOiA/TG9jYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpbnZhcmlhbnQoIXRoaXMuX2lzTmF2aWdhdGluZyk7XG4gICAgaWYgKGxvY2F0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc05hdmlnYXRpbmcgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBlZGl0b3JPZkxvY2F0aW9uKGxvY2F0aW9uKTtcbiAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIHdpbGwgbm90IGFjdHVhbGx5IHVwZGF0ZSB0aGUgc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAvLyBUaGUgc2Nyb2xsIHBvc2l0aW9uIHVwZGF0ZSB3aWxsIGhhcHBlbiBvbiB0aGUgbmV4dCB0aWNrLlxuICAgICAgbG9nKGBuYXZpZ2F0aW5nIHRvOiAke2xvY2F0aW9uLnNjcm9sbFRvcH0gJHtKU09OLnN0cmluZ2lmeShsb2NhdGlvbi5idWZmZXJQb3NpdGlvbil9YCk7XG4gICAgICBzZXRQb3NpdGlvbkFuZFNjcm9sbChlZGl0b3IsIGxvY2F0aW9uLmJ1ZmZlclBvc2l0aW9uLCBsb2NhdGlvbi5zY3JvbGxUb3ApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9pc05hdmlnYXRpbmcgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBuYXZpZ2F0ZUZvcndhcmRzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZygnbmF2aWdhdGVGb3J3YXJkcycpO1xuICAgIGlmICghdGhpcy5faXNOYXZpZ2F0aW5nKSB7XG4gICAgICBhd2FpdCB0aGlzLl9uYXZpZ2F0ZVRvKHRoaXMuX25hdmlnYXRpb25TdGFjay5uZXh0KCkpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIG5hdmlnYXRlQmFja3dhcmRzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZygnbmF2aWdhdGVCYWNrd2FyZHMnKTtcbiAgICBpZiAoIXRoaXMuX2lzTmF2aWdhdGluZykge1xuICAgICAgYXdhaXQgdGhpcy5fbmF2aWdhdGVUbyh0aGlzLl9uYXZpZ2F0aW9uU3RhY2sucHJldmlvdXMoKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gRm9yIFRlc3RpbmcuXG4gIGdldExvY2F0aW9ucygpOiBBcnJheTxMb2NhdGlvbj4ge1xuICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0aW9uU3RhY2suZ2V0TG9jYXRpb25zKCk7XG4gIH1cblxuICAvLyBGb3IgVGVzdGluZy5cbiAgZ2V0SW5kZXgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGlvblN0YWNrLmdldEluZGV4KCk7XG4gIH1cbn1cbiJdfQ==