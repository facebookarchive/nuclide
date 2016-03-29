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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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
      (0, _assert2['default'])(this._index >= 0 && this._index < this._elements.length);
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
      (0, _assert2['default'])(this._elements.length <= MAX_STACK_DEPTH);

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
//# sourceMappingURL=data:application/json;base64,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QixrQkFBSSxFQUFFLEtBQUs7QUFDWCxpQkFBRyxFQUFILEdBQUc7QUFDSCx1QkFBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO0FBQzdCLDRCQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWM7YUFDeEMsQ0FBQztXQUNIO1NBQ0YsQ0FBQyxDQUFDO09BQ0o7S0FDRjs7Ozs7V0FHSyxnQkFBQyxTQUEwQyxFQUFROzs7QUFDdkQsVUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUMzQixVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUMsUUFBUSxFQUFFLEtBQUssRUFBSztBQUMxRCxZQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLElBQUksT0FBSyxNQUFNLEVBQUU7QUFDbkMsa0JBQVEsSUFBSSxDQUFDLENBQUM7U0FDZjtBQUNELGVBQU8sTUFBTSxDQUFDO09BQ2YsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzFFOzs7OztXQUdXLHdCQUFvQjtBQUM5QixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7S0FDdkI7OztXQUVPLG9CQUFXO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUNwQjs7O1NBeElVLGVBQWUiLCJmaWxlIjoiTmF2aWdhdGlvblN0YWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0VkaXRvckxvY2F0aW9uLCBMb2NhdGlvbn0gZnJvbSAnLi9Mb2NhdGlvbic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgTUFYX1NUQUNLX0RFUFRIID0gMTAwO1xuXG4vLyBQcm92aWRlcyBhIG5hdmlnYXRpb24gc3RhY2sgYWJzdHJhY3Rpb24sIHVzZWZ1bCBmb3IgZ29pbmcgZm9yd2FyZC9iYWNrd2FyZHNcbi8vIHdoaWxlIGJyb3dzaW5nIGNvZGUuXG4vL1xuLy8gU3RhY2sgZW50cmllcyBpbmNsdWRlIHRoZSBmaWxlIChhcyB1cmkgZm9yIGNsb3NlZCBmaWxlcyBhbmQgYXNcbi8vIGF0b20kVGV4dEVkaXRvciBmb3Igb3BlbiBmaWxlcykgYXMgd2VsbCBhcyB0aGUgY3Vyc29yIHBvc2l0aW9uIGFuZCBzY3JvbGwuXG4vLyBvcGVuRWRpdG9yL2Nsb3NlRWRpdG9yIGNvbnZlcnRzIGVudHJpZXMgdG8vZnJvbSBlZGl0b3IvdXJpIGxvY2F0aW9ucy5cbi8vIE5vdGUgdGhhdCBjbG9zZUVkaXRvciBtYXkgcmVtb3ZlIGVudHJpZXMgaWYgdGhlIGVkaXRvciBiZWluZyBjbG9zZWQgZG9lcyBub3Rcbi8vIGhhdmUgYSBwYXRoIChha2EgaGFzIG5vdCBiZWVuIHNhdmVkKS5cbi8vXG4vLyBOZXcgZW50cmllcyBjYW4gYmUgcHVzaGVkIG9uIHRoZSBzdGFjay4gVGhlIHN0YWNrIG1haW50YWlucyBhIGN1cnJlbnQgbG9jYXRpb24gd2hpY2hcbi8vIG1heSBiZSBhbnkgZWxlbWVudCBpbiB0aGUgc3RhY2ssIG5vdCBqdXN0IHRoZSB0b3AuIFB1c2hpbmcgbmV3IGVsZW1lbnRzIGlzIGRvbmUgcmVsYXRpdmUgdG8gdGhlXG4vLyBjdXJyZW50IGxvY2F0aW9uIG5vdCByZWxhdGl2ZSB0byB0aGUgdG9wIG9mIHRoZSBzdGFjay4gUHVzaGluZyByZW1vdmVzIGFueVxuLy8gZWxlbWVudHMgYWJvdmUgdGhlIGN1cnJlbnQgbG9jYXRpb24gYmVmb3JlIHB1c2hpbmcgdGhlIG5ldyBlbGVtZW50LlxuLy9cbi8vIFRoZSBjdXJyZW50IGxvY2F0aW9uIGNhbiBiZSB1cGRhdGVkIHdpdGggbmV4dC9wcmV2aW91cyB3aGljaCByZXR1cm4gbm9uLW51bGxcbi8vIGlmIHRoZSBjdXJyZW50IGxvY2F0aW9uIGhhcyBiZWVuIHVwZGF0ZWQsIG9yIG51bGwgb2YgY3VycmVudCBpcyBhbHJlYWR5IGF0IHRoZVxuLy8gdG9wL2JvdHRvbSBvZiB0aGUgc3RhY2suXG4vL1xuLy8gVGhlIGJ1ZmZlciBwb3NpdGlvbiBhbmQgc2Nyb2xsIHRvcCBvZiB0aGUgY3VycmVudCBsb2NhdGlvbiBjYW4gYWxzbyBiZVxuLy8gdXBkYXRlZCBpbiBwbGFjZSB3aXRoIGF0dGVtcHRVcGRhdGUuIElmIHRoZSBlZGl0b3Igb2YgdGhlIG5ldyBsb2NhdGlvbiBtYXRjaGVzXG4vLyB0aGUgY3VycmVudCBsb2NhdGlvbiwgdGhlbiB0aGUgY3VycmVudCBsb2NhdGlvbiBpcyB1cGRhdGVkLCBvdGhlcndpc2UgYSBuZXdcbi8vIGVudHJ5IGlzIHB1c2hlZC5cbi8vXG4vLyBmaWx0ZXIgY2FuIGJlIHVzZWQgdG8gcmVtb3ZlIGVudHJpZXMgZnJvbSB0aGUgc3RhY2suIFRoaXMgaXMgZG9uZSB3aGVuXG4vLyBjbG9zaW5nIHVubmFtZWQgZWRpdG9ycyBhbmQgd2hlbiBjbG9zaW5nIHJlbW90ZSBkaXJlY3Rvcmllcy5cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uU3RhY2sge1xuICBfZWxlbWVudHM6IEFycmF5PExvY2F0aW9uPjtcbiAgX2luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLl9pbmRleCA9IC0xO1xuICB9XG5cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgaGFzQ3VycmVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuaXNFbXB0eSgpO1xuICB9XG5cbiAgZ2V0Q3VycmVudCgpOiBMb2NhdGlvbiB7XG4gICAgaW52YXJpYW50KHRoaXMuX2luZGV4ID49IDAgJiYgdGhpcy5faW5kZXggPCB0aGlzLl9lbGVtZW50cy5sZW5ndGgpO1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50c1t0aGlzLl9pbmRleF07XG4gIH1cblxuICBnZXRDdXJyZW50RWRpdG9yKCk6ID9hdG9tJFRleHRFZGl0b3Ige1xuICAgIGlmICghdGhpcy5oYXNDdXJyZW50KCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZ2V0Q3VycmVudCgpO1xuICAgIHJldHVybiBsb2NhdGlvbi50eXBlID09PSAnZWRpdG9yJyA/IGxvY2F0aW9uLmVkaXRvciA6IG51bGw7XG4gIH1cblxuICAvLyBSZW1vdmVzIGFueSBlbGVtZW50cyBiZWxvdyBjdXJyZW50LCB0aGVuIHB1c2hlcyBuZXdUb3Agb250byB0aGUgc3RhY2suXG4gIHB1c2gobmV3VG9wOiBFZGl0b3JMb2NhdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2VsZW1lbnRzLnNwbGljZSh0aGlzLl9pbmRleCArIDEpO1xuICAgIHRoaXMuX2VsZW1lbnRzLnB1c2gobmV3VG9wKTtcblxuICAgIGlmICh0aGlzLl9lbGVtZW50cy5sZW5ndGggPiBNQVhfU1RBQ0tfREVQVEgpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRzLnNwbGljZSgwLCAxKTtcbiAgICB9XG4gICAgaW52YXJpYW50KHRoaXMuX2VsZW1lbnRzLmxlbmd0aCA8PSBNQVhfU1RBQ0tfREVQVEgpO1xuXG4gICAgdGhpcy5faW5kZXggPSB0aGlzLl9lbGVtZW50cy5sZW5ndGggLSAxO1xuICB9XG5cbiAgLy8gVXBkYXRlcyB0aGUgY3VycmVudCBsb2NhdGlvbiBpZiB0aGUgZWRpdG9ycyBtYXRjaC5cbiAgLy8gSWYgdGhlIGVkaXRvcnMgZG9uJ3QgbWF0Y2ggdGhlbiBwdXNoIGEgbmV3IHRvcC5cbiAgYXR0ZW1wdFVwZGF0ZShuZXdUb3A6IEVkaXRvckxvY2F0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZ2V0Q3VycmVudEVkaXRvcigpID09PSBuZXdUb3AuZWRpdG9yKSB7XG4gICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50KCk7XG4gICAgICBjdXJyZW50LmJ1ZmZlclBvc2l0aW9uID0gbmV3VG9wLmJ1ZmZlclBvc2l0aW9uO1xuICAgICAgY3VycmVudC5zY3JvbGxUb3AgPSBuZXdUb3Auc2Nyb2xsVG9wO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnB1c2gobmV3VG9wKTtcbiAgICB9XG4gIH1cblxuICAvLyBNb3ZlcyBjdXJyZW50IHRvIHRoZSBwcmV2aW91cyBlbnRyeS5cbiAgLy8gUmV0dXJucyBudWxsIGlmIHRoZXJlIGlzIG5vIHByZXZpb3VzIGVudHJ5LlxuICBwcmV2aW91cygpOiA/TG9jYXRpb24ge1xuICAgIGlmICh0aGlzLl9pbmRleCA+IDApIHtcbiAgICAgIHRoaXMuX2luZGV4IC09IDE7XG4gICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIE1vdmVzIHRvIHRoZSBuZXh0IGVudHJ5LlxuICAvLyBSZXR1cm5zIG51bGwgaWYgYWxyZWFkeSBhdCB0aGUgbGFzdCBlbnRyeS5cbiAgbmV4dCgpOiA/TG9jYXRpb24ge1xuICAgIGlmICgodGhpcy5faW5kZXggKyAxKSA+PSB0aGlzLl9lbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2luZGV4ICs9IDE7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudCgpO1xuICB9XG5cbiAgLy8gV2hlbiBvcGVuaW5nIGEgbmV3IGVkaXRvciwgY29udmVydCBhbGwgVXJpIGxvY2F0aW9ucyBvbiB0aGUgc3RhY2sgdG8gZWRpdG9yXG4gIC8vIGxvY2F0aW9ucy5cbiAgZWRpdG9yT3BlbmVkKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3QgdXJpID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAodXJpID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9lbGVtZW50cy5mb3JFYWNoKChsb2NhdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChsb2NhdGlvbi50eXBlID09PSAndXJpJyAmJiBsb2NhdGlvbi51cmkgPT09IHVyaSkge1xuICAgICAgICB0aGlzLl9lbGVtZW50c1tpbmRleF0gPSB7XG4gICAgICAgICAgdHlwZTogJ2VkaXRvcicsXG4gICAgICAgICAgZWRpdG9yLFxuICAgICAgICAgIHNjcm9sbFRvcDogbG9jYXRpb24uc2Nyb2xsVG9wLFxuICAgICAgICAgIGJ1ZmZlclBvc2l0aW9uOiBsb2NhdGlvbi5idWZmZXJQb3NpdGlvbixcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIFdoZW4gY2xvc2luZyBlZGl0b3JzLCBjb252ZXJ0IGFsbCBsb2NhdGlvbnMgZm9yIHRoYXQgZWRpdG9yIHRvIFVSSSBsb2NhdGlvbnMuXG4gIGVkaXRvckNsb3NlZChlZGl0b3I6YXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3QgdXJpID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAodXJpID09PSAnJyB8fCB1cmkgPT0gbnVsbCkge1xuICAgICAgdGhpcy5maWx0ZXIobG9jYXRpb24gPT4gbG9jYXRpb24udHlwZSAhPT0gJ2VkaXRvcicgfHwgZWRpdG9yICE9PSBsb2NhdGlvbi5lZGl0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9lbGVtZW50cy5mb3JFYWNoKChsb2NhdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKGxvY2F0aW9uLnR5cGUgPT09ICdlZGl0b3InICYmIGVkaXRvciA9PT0gbG9jYXRpb24uZWRpdG9yKSB7XG4gICAgICAgICAgdGhpcy5fZWxlbWVudHNbaW5kZXhdID0ge1xuICAgICAgICAgICAgdHlwZTogJ3VyaScsXG4gICAgICAgICAgICB1cmksXG4gICAgICAgICAgICBzY3JvbGxUb3A6IGxvY2F0aW9uLnNjcm9sbFRvcCxcbiAgICAgICAgICAgIGJ1ZmZlclBvc2l0aW9uOiBsb2NhdGlvbi5idWZmZXJQb3NpdGlvbixcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBSZW1vdmVzIGFsbCBlbnRyaWVzIHdoaWNoIGRvIG5vdCBtYXRjaCB0aGUgcHJlZGljYXRlLlxuICBmaWx0ZXIocHJlZGljYXRlOiAobG9jYXRpb246IExvY2F0aW9uKSA9PiBib29sZWFuKTogdm9pZCB7XG4gICAgbGV0IG5ld0luZGV4ID0gdGhpcy5faW5kZXg7XG4gICAgdGhpcy5fZWxlbWVudHMgPSB0aGlzLl9lbGVtZW50cy5maWx0ZXIoKGxvY2F0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gcHJlZGljYXRlKGxvY2F0aW9uKTtcbiAgICAgIGlmICghcmVzdWx0ICYmIGluZGV4IDw9IHRoaXMuX2luZGV4KSB7XG4gICAgICAgIG5ld0luZGV4IC09IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICAgIHRoaXMuX2luZGV4ID0gTWF0aC5taW4oTWF0aC5tYXgobmV3SW5kZXgsIDApLCB0aGlzLl9lbGVtZW50cy5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIC8vIEZvciB0ZXN0aW5nIC4uLlxuICBnZXRMb2NhdGlvbnMoKTogQXJyYXk8TG9jYXRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHM7XG4gIH1cblxuICBnZXRJbmRleCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbmRleDtcbiAgfVxufVxuIl19