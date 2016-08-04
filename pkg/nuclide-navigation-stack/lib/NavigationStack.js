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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var MAX_STACK_DEPTH = 100;

// Provides a navigation stack abstraction, useful for going forward/backwards
// while browsing code.
//
// Stack entries include the file (as uri for closed files and as
// atom$TextEditor for open files) as well as the cursor position and scroll.
// openEditor/closeEditor converts entries to/from editor/uri locations.
// Note that closeEditor may remove entries if the editor being closed does not
// have a path (aka has not been saved).
//
// New entries can be pushed on the stack. The stack maintains a current location which
// may be any element in the stack, not just the top. Pushing new elements is done relative to the
// current location not relative to the top of the stack. Pushing removes any
// elements above the current location before pushing the new element.
//
// The current location can be updated with next/previous which return non-null
// if the current location has been updated, or null of current is already at the
// top/bottom of the stack.
//
// The buffer position and scroll top of the current location can also be
// updated in place with attemptUpdate. If the editor of the new location matches
// the current location, then the current location is updated, otherwise a new
// entry is pushed.
//
// filter can be used to remove entries from the stack. This is done when
// closing unnamed editors and when closing remote directories.

var NavigationStack = (function () {
  function NavigationStack() {
    _classCallCheck(this, NavigationStack);

    this._elements = [];
    this._index = -1;
  }

  _createClass(NavigationStack, [{
    key: 'isEmpty',
    value: function isEmpty() {
      return this._elements.length === 0;
    }
  }, {
    key: 'hasCurrent',
    value: function hasCurrent() {
      return !this.isEmpty();
    }
  }, {
    key: 'getCurrent',
    value: function getCurrent() {
      (0, (_assert2 || _assert()).default)(this._index >= 0 && this._index < this._elements.length);
      return this._elements[this._index];
    }
  }, {
    key: 'getCurrentEditor',
    value: function getCurrentEditor() {
      if (!this.hasCurrent()) {
        return null;
      }
      var location = this.getCurrent();
      return location.type === 'editor' ? location.editor : null;
    }

    // Removes any elements below current, then pushes newTop onto the stack.
  }, {
    key: 'push',
    value: function push(newTop) {
      this._elements.splice(this._index + 1);
      this._elements.push(newTop);

      if (this._elements.length > MAX_STACK_DEPTH) {
        this._elements.splice(0, 1);
      }
      (0, (_assert2 || _assert()).default)(this._elements.length <= MAX_STACK_DEPTH);

      this._index = this._elements.length - 1;
    }

    // Updates the current location if the editors match.
    // If the editors don't match then push a new top.
  }, {
    key: 'attemptUpdate',
    value: function attemptUpdate(newTop) {
      if (this.getCurrentEditor() === newTop.editor) {
        var current = this.getCurrent();
        current.bufferPosition = newTop.bufferPosition;
        current.scrollTop = newTop.scrollTop;
      } else {
        this.push(newTop);
      }
    }

    // Moves current to the previous entry.
    // Returns null if there is no previous entry.
  }, {
    key: 'previous',
    value: function previous() {
      if (this._index > 0) {
        this._index -= 1;
        return this.getCurrent();
      } else {
        return null;
      }
    }

    // Moves to the next entry.
    // Returns null if already at the last entry.
  }, {
    key: 'next',
    value: function next() {
      if (this._index + 1 >= this._elements.length) {
        return null;
      }

      this._index += 1;
      return this.getCurrent();
    }

    // When opening a new editor, convert all Uri locations on the stack to editor
    // locations.
  }, {
    key: 'editorOpened',
    value: function editorOpened(editor) {
      var _this = this;

      var uri = editor.getPath();
      if (uri == null) {
        return;
      }

      this._elements.forEach(function (location, index) {
        if (location.type === 'uri' && location.uri === uri) {
          _this._elements[index] = {
            type: 'editor',
            editor: editor,
            scrollTop: location.scrollTop,
            bufferPosition: location.bufferPosition
          };
        }
      });
    }

    // When closing editors, convert all locations for that editor to URI locations.
  }, {
    key: 'editorClosed',
    value: function editorClosed(editor) {
      var _this2 = this;

      var uri = editor.getPath();
      if (uri === '' || uri == null) {
        this.filter(function (location) {
          return location.type !== 'editor' || editor !== location.editor;
        });
      } else {
        this._elements.forEach(function (location, index) {
          if (location.type === 'editor' && editor === location.editor) {
            _this2._elements[index] = {
              type: 'uri',
              uri: uri,
              scrollTop: location.scrollTop,
              bufferPosition: location.bufferPosition
            };
          }
        });
      }
    }

    // Removes all entries which do not match the predicate.
  }, {
    key: 'filter',
    value: function filter(predicate) {
      var _this3 = this;

      var newIndex = this._index;
      this._elements = this._elements.filter(function (location, index) {
        var result = predicate(location);
        if (!result && index <= _this3._index) {
          newIndex -= 1;
        }
        return result;
      });
      this._index = Math.min(Math.max(newIndex, 0), this._elements.length - 1);
    }

    // For testing ...
  }, {
    key: 'getLocations',
    value: function getLocations() {
      return this._elements;
    }
  }, {
    key: 'getIndex',
    value: function getIndex() {
      return this._index;
    }
  }]);

  return NavigationStack;
})();

exports.NavigationStack = NavigationStack;