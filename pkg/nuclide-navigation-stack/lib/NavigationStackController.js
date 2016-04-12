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
        return uri == null || !(0, _nuclideRemoteUri.contains)(removedPath, uri) || remainingDirectories.find(function (directory) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5hdmlnYXRpb25TdGFja0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQ0FnQk8sNEJBQTRCOzsrQkFDTCxtQkFBbUI7O3NCQUMzQixRQUFROzs7O2dDQUNQLDBCQUEwQjs7d0JBQ3NCLFlBQVk7O0FBRW5GLFNBQVMsR0FBRyxDQUFDLE9BQWUsRUFBUSxFQUduQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7SUF3Q1kseUJBQXlCO0FBV3pCLFdBWEEseUJBQXlCLEdBV3RCOzBCQVhILHlCQUF5Qjs7QUFZbEMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLHNDQUFxQixDQUFDO0FBQzlDLFFBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0dBQzNCOztlQWhCVSx5QkFBeUI7O1dBa0JoQiw4QkFBQyxNQUF1QixFQUFRO0FBQ2xELFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixlQUFPO09BQ1I7OztBQUdELFVBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ2hFLFVBQUksY0FBYyxLQUFLLE1BQU0sRUFBRTtBQUM3QixZQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUM1RCxpQ0FBVSxnQkFBZ0IsSUFBSSxJQUFJLElBQUksZ0JBQWdCLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDO0FBQzFFLFlBQUksQ0FBQyxhQUFhLGdCQUFPLGdCQUFnQixDQUFDLENBQUM7T0FDNUM7QUFDRCxVQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG1DQUFvQixNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ2xFOzs7V0FFYSx3QkFB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Z0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDN0M7Ozs7O1dBR08sb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDekM7OztTQXpKVSx5QkFBeUIiLCJmaWxlIjoiTmF2aWdhdGlvblN0YWNrQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0VkaXRvckxvY2F0aW9uLCBMb2NhdGlvbn0gZnJvbSAnLi9Mb2NhdGlvbic7XG5cbmltcG9ydCB7XG4gIHNldFBvc2l0aW9uQW5kU2Nyb2xsLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge05hdmlnYXRpb25TdGFja30gZnJvbSAnLi9OYXZpZ2F0aW9uU3RhY2snO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtjb250YWluc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7Z2V0UGF0aE9mTG9jYXRpb24sIGdldExvY2F0aW9uT2ZFZGl0b3IsIGVkaXRvck9mTG9jYXRpb259IGZyb20gJy4vTG9jYXRpb24nO1xuXG5mdW5jdGlvbiBsb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gIC8vIFVuY29tbWVudCB0aGlzIHRvIGRlYnVnXG4gIC8vIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xufVxuXG4vLyBIYW5kbGVzIHRoZSBzdGF0ZSBtYWNoaW5lIHRoYXQgcmVzcG9uZHMgdG8gdmFyaW91cyBhdG9tIGV2ZW50cy5cbi8vXG4vLyBBZnRlciBhIE5hdiBtb3ZlLCBhbnkgbm9uLW5hdiBtb3ZlcyBvciBzY3JvbGwgY2hhbmdlcyB1cGRhdGUgdGhlIGN1cnJlbnRcbi8vIG5hdiBsb2NhdGlvbi4gU28gdGhhdCBhIG5hdi1zdGFjayBtb3ZlKGZvcndhcmQvYmFja3dhcmRzKSB3aWxsIHJldHVyblxuLy8gcG9zaXRpb24gYW5kIHNjcm9sbCBhZnRlciB0aGUgbm9uLW5hdiBtb3ZlL3Njcm9sbHMuXG4vL1xuLy8gV2hlbiBkb2luZyBhIGZvcndhcmRzL2JhY2t3YXJkcyBuYXYtc3RhY2sgbW92ZSwgaWdub3JlIGFsbCBldmVudHNcbi8vIHVudGlsIHRoZSBtb3ZlIGlzIGNvbXBsZXRlLlxuLy9cbi8vIFRoZXJlIGFyZSBzZXZlcmFsIHVzZXIgc2NlbmFyaW9zLCBlYWNoIHdoaWNoIHNwYXduIGRpZmZlcmVudCBldmVudCBvcmRlcnM6XG4vLyAtIHN0YXJ0dXAgLSBvcGVuIGZpbGVcbi8vICAgICAtIG9uQWN0aXZhdGUsIGFjdGl2ZVBhbmVTdG9wQ2hhbmdpbmdcbi8vIC0gY2hhbmdpbmcgdGFic1xuLy8gICAgIC0gb25BY3RpdmF0ZSwgYWN0aXZlUGFuZVN0b3BDaGFuZ2luZ1xuLy8gLSBhdG9tLndvcmtzcGFjZS5vcGVuIG9mIGNsb3NlZCBmaWxlXG4vLyAgICAgLSBjcmVhdGUsIHNjcm9sbCwgYWN0aXZhdGUsIG9wZW4sIHNjcm9sbCwgYWN0aXZlUGFuZVN0b3BDaGFuZ2luZ1xuLy8gLSBhdG9tLndvcmtzcGFjZS5vcGVuIG9mIG9wZW4gZmlsZSwgbm8gc2Nyb2xsIG9yIG1vdmVcbi8vICAgICAtIGFjdGl2YXRlLCBvcGVuLCBhY3RpdmVQYW5lU3RvcENoYW5naW5nXG4vLyAtIGF0b20ud29ya3NwYWNlLm9wZW4gb2Ygb3BlbiBmaWxlLCB3aXRoIG1vdmVcbi8vICAgICAtIGFjdGl2YXRlLCBwb3NpdGlvbiwgb3Blbiwgc2Nyb2xsLCBhY3RpdmVQYW5lU3RvcENoYW5naW5nXG4vLyAtIGF0b20ud29ya3NwYWNlLm9wZW4gb2YgY3VycmVudCBmaWxlXG4vLyAgICAgLSBwb3NpdGlvbiwgb3Blbiwgc2Nyb2xsXG4vL1xuLy8gLSBudWNsaWRlLWF0b20taGVscGVycy5nb1RvTG9jYXRpb25JbkVkaXRvclxuLy8gICAgIC0gcG9zaXRpb24sIG9uT3B0SW5OYXZpZ2F0aW9uLCBbc2Nyb2xsXVxuLy9cbi8vIEluIGdlbmVyYWwsIHdoZW4gd2UgZ2V0IGEgbmV3IGV2ZW50LCBpZiB0aGUgZWRpdG9yIGlzIG5vdCB0aGUgY3VycmVudCxcbi8vIHRoZW4gd2UgcHVzaCBhIG5ldyBlbGVtZW50IG9uIHRoZSBuYXYgc3RhY2s7IGlmIHRoZSBlZGl0b3Igb2YgdGhlIG5ldyBldmVudFxuLy8gZG9lcyBtYXRjaCB0aGUgdG9wIG9mIHRoZSBuYXYgc3RhY2ssIHRoZW4gd2UgdXBkYXRlIHRoZSB0b3Agb2YgdGhlIG5hdiBzdGFja1xuLy8gd2l0aCB0aGUgbmV3IGxvY2F0aW9uLlxuLy9cbi8vIFRoaXMgd29ya3MgZXhjZXB0IGZvciB0aGUgbGFzdCBjYXNlIG9mIG9wZW4gaW50byB0aGUgY3VycmVudCBmaWxlLlxuLy9cbi8vIFRvIGRlYWwgd2l0aCB0aGUgYWJvdmUgLSB3ZSBkbyB0aGUgZm9sbG93aW5nIGhhY2s6XG4vLyBJZiBhbiBvcGVuIG9jY3VycyBhbmQgaXQgaXMgbm90IHdpdGhpbiBhbiBhY3RpdmF0ZS9hY3RpdmVQYW5lU3RvcENoYW5naW5nIHBhaXIsXG4vLyBhbmQgdGhlIHRvcCBtYXRjaGVzIHRoZSBuZXdseSBvcGVuZWQgZWRpdG9yLCB0aGVuIHdlIGhhdmUgdGhlIGxhc3QgY2FzZVxuLy8gb2YgJ29wZW4gd2l0aGluIHRoZSBjdXJyZW50IGZpbGUnLiBTbywgd2UgcmVzdG9yZSB0aGUgY3VycmVudCB0b3AgdG8gaXRzXG4vLyBwcmV2aW91cyBsb2NhdGlvbiBiZWZvcmUgcHVzaGluZyBhIG5ldyB0b3AuXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvblN0YWNrQ29udHJvbGxlciB7XG4gIF9uYXZpZ2F0aW9uU3RhY2s6IE5hdmlnYXRpb25TdGFjaztcbiAgLy8gSW5kaWNhdGVzIHRoYXQgd2UncmUgcHJvY2Vzc2luZyBhIGZvcndhcmQvYmFja3dhcmRzIG5hdmlnYXRpb24gaW4gdGhlIHN0YWNrLlxuICAvLyBXaGlsZSBwcm9jZXNzaW5nIGEgbmF2aWdhdGlvbiBzdGFjayBtb3ZlIHdlIGRvbid0IHVwZGF0ZSB0aGUgbmF2IHN0YWNrLlxuICBfaXNOYXZpZ2F0aW5nOiBib29sZWFuO1xuICAvLyBJbmRpY2F0ZXMgdGhhdCB3ZSBhcmUgaW4gdGhlIG1pZGRsZSBvZiBhIGFjdGl2YXRlL29uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW1cbiAgLy8gcGFpciBvZiBldmVudHMuXG4gIF9pbkFjdGl2YXRlOiBib29sZWFuO1xuICAvLyBUaGUgbGFzdCBsb2NhdGlvbiB1cGRhdGUgd2UndmUgc2Vlbi4gU2VlIGRpc2N1c3Npb24gYmVsb3cgb24gZXZlbnQgb3JkZXIuXG4gIF9sYXN0TG9jYXRpb246ID9FZGl0b3JMb2NhdGlvbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uU3RhY2sgPSBuZXcgTmF2aWdhdGlvblN0YWNrKCk7XG4gICAgdGhpcy5faXNOYXZpZ2F0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5faW5BY3RpdmF0ZSA9IGZhbHNlO1xuICAgIHRoaXMuX2xhc3RMb2NhdGlvbiA9IG51bGw7XG4gIH1cblxuICBfdXBkYXRlU3RhY2tMb2NhdGlvbihlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc05hdmlnYXRpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTZWUgZGlzY3Vzc2lvbiBiZWxvdyBvbiBldmVudCBvcmRlciAuLi5cbiAgICBjb25zdCBwcmV2aW91c0VkaXRvciA9IHRoaXMuX25hdmlnYXRpb25TdGFjay5nZXRDdXJyZW50RWRpdG9yKCk7XG4gICAgaWYgKHByZXZpb3VzRWRpdG9yID09PSBlZGl0b3IpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzTG9jYXRpb24gPSB0aGlzLl9uYXZpZ2F0aW9uU3RhY2suZ2V0Q3VycmVudCgpO1xuICAgICAgaW52YXJpYW50KHByZXZpb3VzTG9jYXRpb24gIT0gbnVsbCAmJiBwcmV2aW91c0xvY2F0aW9uLnR5cGUgPT09ICdlZGl0b3InKTtcbiAgICAgIHRoaXMuX2xhc3RMb2NhdGlvbiA9IHsuLi5wcmV2aW91c0xvY2F0aW9ufTtcbiAgICB9XG4gICAgdGhpcy5fbmF2aWdhdGlvblN0YWNrLmF0dGVtcHRVcGRhdGUoZ2V0TG9jYXRpb25PZkVkaXRvcihlZGl0b3IpKTtcbiAgfVxuXG4gIHVwZGF0ZVBvc2l0aW9uKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBuZXdCdWZmZXJQb3NpdGlvbjogYXRvbSRQb2ludCk6IHZvaWQge1xuICAgIGxvZyhcbiAgICAgIGB1cGRhdGVQb3NpdGlvbiAke25ld0J1ZmZlclBvc2l0aW9uLnJvd30sICR7bmV3QnVmZmVyUG9zaXRpb24uY29sdW1ufSAke2VkaXRvci5nZXRQYXRoKCl9YCk7XG5cbiAgICB0aGlzLl91cGRhdGVTdGFja0xvY2F0aW9uKGVkaXRvcik7XG4gIH1cblxuICAvLyBzY3JvbGxUb3AgaXMgaW4gUGl4ZWxzXG4gIHVwZGF0ZVNjcm9sbChlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgc2Nyb2xsVG9wOiBudW1iZXIpOiB2b2lkIHtcbiAgICBsb2coYHVwZGF0ZVNjcm9sbCAke3Njcm9sbFRvcH0gJHtlZGl0b3IuZ2V0UGF0aCgpfWApO1xuXG4gICAgdGhpcy5fdXBkYXRlU3RhY2tMb2NhdGlvbihlZGl0b3IpO1xuICB9XG5cbiAgb25DcmVhdGUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBsb2coYG9uQ3JlYXRlICR7ZWRpdG9yLmdldFBhdGgoKX1gKTtcblxuICAgIHRoaXMuX25hdmlnYXRpb25TdGFjay5lZGl0b3JPcGVuZWQoZWRpdG9yKTtcbiAgICB0aGlzLl91cGRhdGVTdGFja0xvY2F0aW9uKGVkaXRvcik7XG4gIH1cblxuICBvbkRlc3Ryb3koZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBsb2coYG9uRGVzdHJveSAke2VkaXRvci5nZXRQYXRoKCl9YCk7XG5cbiAgICB0aGlzLl9uYXZpZ2F0aW9uU3RhY2suZWRpdG9yQ2xvc2VkKGVkaXRvcik7XG4gIH1cblxuICAvLyBPcGVuIGlzIGFsd2F5cyBwcmVjZWRlZCBieSBhY3RpdmF0ZSwgdW5sZXNzIG9wZW5pbmcgdGhlIGN1cnJlbnQgZmlsZVxuICBvbk9wZW4oZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBsb2coYG9uT3BlbiAke2VkaXRvci5nZXRQYXRoKCl9YCk7XG5cbiAgICAvLyBIYWNrIGFsZXJ0LCBhbiBhdG9tLndvcmtzcGFjZS5vcGVuIG9mIGEgbG9jYXRpb24gaW4gdGhlIGN1cnJlbnQgZWRpdG9yLFxuICAgIC8vIHdlIGdldCB0aGUgbG9jYXRpb24gdXBkYXRlIGJlZm9yZSB0aGUgb25EaWRPcGVuIGV2ZW50LCBhbmQgd2UgZG9uJ3QgZ2V0XG4gICAgLy8gYW4gYWN0aXZhdGUvb25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSBwYWlyLiBTbyBoZXJlLFxuICAgIC8vIHdlIHJlc3RvcmUgdG9wIG9mIHRoZSBzdGFjayB0byB0aGUgcHJldmlvdXMgbG9jYXRpb24gYmVmb3JlIHB1c2hpbmcgYSBuZXdcbiAgICAvLyBuYXYgc3RhY2sgZW50cnkuXG4gICAgaWYgKCF0aGlzLl9pbkFjdGl2YXRlICYmIHRoaXMuX2xhc3RMb2NhdGlvbiAhPSBudWxsXG4gICAgICAmJiB0aGlzLl9sYXN0TG9jYXRpb24uZWRpdG9yID09PSBlZGl0b3JcbiAgICAgICYmIHRoaXMuX25hdmlnYXRpb25TdGFjay5nZXRDdXJyZW50RWRpdG9yKCkgPT09IGVkaXRvcikge1xuICAgICAgdGhpcy5fbmF2aWdhdGlvblN0YWNrLmF0dGVtcHRVcGRhdGUodGhpcy5fbGFzdExvY2F0aW9uKTtcbiAgICAgIHRoaXMuX25hdmlnYXRpb25TdGFjay5wdXNoKGdldExvY2F0aW9uT2ZFZGl0b3IoZWRpdG9yKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0YWNrTG9jYXRpb24oZWRpdG9yKTtcbiAgICB9XG4gICAgdGhpcy5fbGFzdExvY2F0aW9uID0gbnVsbDtcbiAgfVxuXG4gIG9uQWN0aXZhdGUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBsb2coYG9uQWN0aXZhdGUgJHtlZGl0b3IuZ2V0UGF0aCgpfWApO1xuICAgIHRoaXMuX2luQWN0aXZhdGUgPSB0cnVlO1xuICAgIHRoaXMuX3VwZGF0ZVN0YWNrTG9jYXRpb24oZWRpdG9yKTtcbiAgfVxuXG4gIG9uQWN0aXZlU3RvcENoYW5naW5nKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgbG9nKGBvbkFjdGl2ZVBhbmVTdG9wQ2hhbmdpbmcgJHtlZGl0b3IuZ2V0UGF0aCgpfWApO1xuICAgIHRoaXMuX2luQWN0aXZhdGUgPSBmYWxzZTtcbiAgfVxuXG4gIG9uT3B0SW5OYXZpZ2F0aW9uKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgbG9nKGBvbk9wdEluTmF2aWdhdGlvbiAke2VkaXRvci5nZXRQYXRoKCl9YCk7XG5cbiAgICAvLyBVc3VhbGx5IHRoZSBzZXRQb3NpdGlvbiB3b3VsZCBjb21lIGJlZm9yZSB0aGUgb25PcHRJbk5hdmlnYXRpb25cbiAgICBpZiAodGhpcy5fbGFzdExvY2F0aW9uID09IG51bGwpIHtcblxuICAgIH1cbiAgICAvLyBPcHQtaW4gbmF2aWdhdGlvbiBpcyBoYW5kbGVkIGluIHRoZSBzYW1lIHdheSBhcyBhIGZpbGUgb3BlbiB3aXRoIG5vIHByZWNlZWRpbmcgYWN0aXZhdGlvblxuICAgIHRoaXMub25PcGVuKGVkaXRvcik7XG4gIH1cblxuICAvLyBXaGVuIGNsb3NpbmcgYSBwcm9qZWN0IHBhdGgsIHdlIHJlbW92ZSBhbGwgc3RhY2sgZW50cmllcyBjb250YWluZWQgaW4gdGhhdFxuICAvLyBwYXRoIHdoaWNoIGFyZSBub3QgYWxzbyBjb250YWluZWQgaW4gYSBwcm9qZWN0IHBhdGggd2hpY2ggaXMgcmVtYWluaW5nIG9wZW4uXG4gIHJlbW92ZVBhdGgocmVtb3ZlZFBhdGg6IE51Y2xpZGVVcmksIHJlbWFpbmluZ0RpcmVjdG9yaWVzOiBBcnJheTxOdWNsaWRlVXJpPik6IHZvaWQge1xuICAgIGxvZyhgUmVtb3ZpbmcgcGF0aCAke3JlbW92ZWRQYXRofSByZW1haW5pbmc6ICR7SlNPTi5zdHJpbmdpZnkocmVtYWluaW5nRGlyZWN0b3JpZXMpfWApO1xuICAgIHRoaXMuX25hdmlnYXRpb25TdGFjay5maWx0ZXIobG9jYXRpb24gPT4ge1xuICAgICAgY29uc3QgdXJpID0gZ2V0UGF0aE9mTG9jYXRpb24obG9jYXRpb24pO1xuICAgICAgcmV0dXJuIHVyaSA9PSBudWxsIHx8ICFjb250YWlucyhyZW1vdmVkUGF0aCwgdXJpKVxuICAgICAgICB8fCByZW1haW5pbmdEaXJlY3Rvcmllcy5maW5kKGRpcmVjdG9yeSA9PiBjb250YWlucyhkaXJlY3RvcnksIHVyaSkpICE9IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfbmF2aWdhdGVUbyhsb2NhdGlvbjogP0xvY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaW52YXJpYW50KCF0aGlzLl9pc05hdmlnYXRpbmcpO1xuICAgIGlmIChsb2NhdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNOYXZpZ2F0aW5nID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgZWRpdG9yT2ZMb2NhdGlvbihsb2NhdGlvbik7XG4gICAgICAvLyBOb3RlIHRoYXQgdGhpcyB3aWxsIG5vdCBhY3R1YWxseSB1cGRhdGUgdGhlIHNjcm9sbCBwb3NpdGlvblxuICAgICAgLy8gVGhlIHNjcm9sbCBwb3NpdGlvbiB1cGRhdGUgd2lsbCBoYXBwZW4gb24gdGhlIG5leHQgdGljay5cbiAgICAgIGxvZyhgbmF2aWdhdGluZyB0bzogJHtsb2NhdGlvbi5zY3JvbGxUb3B9ICR7SlNPTi5zdHJpbmdpZnkobG9jYXRpb24uYnVmZmVyUG9zaXRpb24pfWApO1xuICAgICAgc2V0UG9zaXRpb25BbmRTY3JvbGwoZWRpdG9yLCBsb2NhdGlvbi5idWZmZXJQb3NpdGlvbiwgbG9jYXRpb24uc2Nyb2xsVG9wKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5faXNOYXZpZ2F0aW5nID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbmF2aWdhdGVGb3J3YXJkcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2coJ25hdmlnYXRlRm9yd2FyZHMnKTtcbiAgICBpZiAoIXRoaXMuX2lzTmF2aWdhdGluZykge1xuICAgICAgYXdhaXQgdGhpcy5fbmF2aWdhdGVUbyh0aGlzLl9uYXZpZ2F0aW9uU3RhY2submV4dCgpKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBuYXZpZ2F0ZUJhY2t3YXJkcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2coJ25hdmlnYXRlQmFja3dhcmRzJyk7XG4gICAgaWYgKCF0aGlzLl9pc05hdmlnYXRpbmcpIHtcbiAgICAgIGF3YWl0IHRoaXMuX25hdmlnYXRlVG8odGhpcy5fbmF2aWdhdGlvblN0YWNrLnByZXZpb3VzKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZvciBUZXN0aW5nLlxuICBnZXRMb2NhdGlvbnMoKTogQXJyYXk8TG9jYXRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGlvblN0YWNrLmdldExvY2F0aW9ucygpO1xuICB9XG5cbiAgLy8gRm9yIFRlc3RpbmcuXG4gIGdldEluZGV4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX25hdmlnYXRpb25TdGFjay5nZXRJbmRleCgpO1xuICB9XG59XG4iXX0=