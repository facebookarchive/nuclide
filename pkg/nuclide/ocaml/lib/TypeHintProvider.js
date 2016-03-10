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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _analytics = require('../../analytics');

var _client = require('../../client');

// Ignore typehints that span too many lines. These tend to be super spammy.
var MAX_LINES = 10;

// Complex types can end up being super long. Truncate them.
// TODO(hansonw): we could parse these into hint trees
var MAX_LENGTH = 100;

var TypeHintProvider = (function () {
  function TypeHintProvider() {
    _classCallCheck(this, TypeHintProvider);
  }

  _createDecoratedClass(TypeHintProvider, [{
    key: 'typeHint',
    decorators: [(0, _analytics.trackTiming)('nuclide-ocaml.typeHint')],
    value: _asyncToGenerator(function* (editor, position) {
      var path = editor.getPath();
      if (path == null) {
        return null;
      }
      var instance = (0, _client.getServiceByNuclideUri)('MerlinService', path);
      if (instance == null) {
        return null;
      }
      yield instance.pushNewBuffer(path, editor.getText());
      var types = yield instance.enclosingType(path, position.row, position.column);
      if (types == null || types.length === 0) {
        return null;
      }
      var type = types[0];
      if (type.end.line - type.start.line > MAX_LINES) {
        return null;
      }
      var hint = type.type;
      if (hint.length > MAX_LENGTH) {
        hint = hint.substr(0, MAX_LENGTH) + '...';
      }
      return {
        hint: hint,
        range: new _atom.Range(new _atom.Point(type.start.line - 1, type.start.col), new _atom.Point(type.end.line - 1, type.end.col))
      };
    })
  }]);

  return TypeHintProvider;
})();

exports.TypeHintProvider = TypeHintProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVIaW50UHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWMyQixNQUFNOzt5QkFDUCxpQkFBaUI7O3NCQUNOLGNBQWM7OztBQUduRCxJQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7Ozs7QUFJckIsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDOztJQUVWLGdCQUFnQjtXQUFoQixnQkFBZ0I7MEJBQWhCLGdCQUFnQjs7O3dCQUFoQixnQkFBZ0I7O2lCQUUxQiw0QkFBWSx3QkFBd0IsQ0FBQzs2QkFDeEIsV0FBQyxNQUF1QixFQUFFLFFBQW9CLEVBQXNCO0FBQ2hGLFVBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixVQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQU0sUUFBUSxHQUFHLG9DQUF1QixlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0QsVUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxZQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELFVBQU0sS0FBSyxHQUFHLE1BQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEYsVUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3ZDLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxVQUFNLElBQWdCLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLFVBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxFQUFFO0FBQy9DLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3JCLFVBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLEVBQUU7QUFDNUIsWUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQztPQUMzQztBQUNELGFBQU87QUFDTCxZQUFJLEVBQUosSUFBSTtBQUNKLGFBQUssRUFBRSxnQkFDTCxnQkFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDOUMsZ0JBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQzNDO09BQ0YsQ0FBQztLQUNIOzs7U0FoQ1UsZ0JBQWdCIiwiZmlsZSI6IlR5cGVIaW50UHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnR9IGZyb20gJy4uLy4uL3R5cGUtaGludC1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtNZXJsaW5UeXBlfSBmcm9tICcuLi8uLi9vY2FtbC1iYXNlJztcblxuaW1wb3J0IHtQb2ludCwgUmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vY2xpZW50JztcblxuLy8gSWdub3JlIHR5cGVoaW50cyB0aGF0IHNwYW4gdG9vIG1hbnkgbGluZXMuIFRoZXNlIHRlbmQgdG8gYmUgc3VwZXIgc3BhbW15LlxuY29uc3QgTUFYX0xJTkVTID0gMTA7XG5cbi8vIENvbXBsZXggdHlwZXMgY2FuIGVuZCB1cCBiZWluZyBzdXBlciBsb25nLiBUcnVuY2F0ZSB0aGVtLlxuLy8gVE9ETyhoYW5zb253KTogd2UgY291bGQgcGFyc2UgdGhlc2UgaW50byBoaW50IHRyZWVzXG5jb25zdCBNQVhfTEVOR1RIID0gMTAwO1xuXG5leHBvcnQgY2xhc3MgVHlwZUhpbnRQcm92aWRlciB7XG5cbiAgQHRyYWNrVGltaW5nKCdudWNsaWRlLW9jYW1sLnR5cGVIaW50JylcbiAgYXN5bmMgdHlwZUhpbnQoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/VHlwZUhpbnQ+IHtcbiAgICBjb25zdCBwYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAocGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgaW5zdGFuY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdNZXJsaW5TZXJ2aWNlJywgcGF0aCk7XG4gICAgaWYgKGluc3RhbmNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhd2FpdCBpbnN0YW5jZS5wdXNoTmV3QnVmZmVyKHBhdGgsIGVkaXRvci5nZXRUZXh0KCkpO1xuICAgIGNvbnN0IHR5cGVzID0gYXdhaXQgaW5zdGFuY2UuZW5jbG9zaW5nVHlwZShwYXRoLCBwb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbik7XG4gICAgaWYgKHR5cGVzID09IG51bGwgfHwgdHlwZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdHlwZTogTWVybGluVHlwZSA9IHR5cGVzWzBdO1xuICAgIGlmICh0eXBlLmVuZC5saW5lIC0gdHlwZS5zdGFydC5saW5lID4gTUFYX0xJTkVTKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IGhpbnQgPSB0eXBlLnR5cGU7XG4gICAgaWYgKGhpbnQubGVuZ3RoID4gTUFYX0xFTkdUSCkge1xuICAgICAgaGludCA9IGhpbnQuc3Vic3RyKDAsIE1BWF9MRU5HVEgpICsgJy4uLic7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBoaW50LFxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZShcbiAgICAgICAgbmV3IFBvaW50KHR5cGUuc3RhcnQubGluZSAtIDEsIHR5cGUuc3RhcnQuY29sKSxcbiAgICAgICAgbmV3IFBvaW50KHR5cGUuZW5kLmxpbmUgLSAxLCB0eXBlLmVuZC5jb2wpLFxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==