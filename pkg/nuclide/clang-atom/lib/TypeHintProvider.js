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

var _libclang = require('./libclang');

// Types longer than this will be truncated.
var MAX_LENGTH = 256;

var TypeHintProvider = (function () {
  function TypeHintProvider() {
    _classCallCheck(this, TypeHintProvider);
  }

  _createDecoratedClass(TypeHintProvider, [{
    key: 'typeHint',
    decorators: [(0, _analytics.trackTiming)('nuclide-clang-atom.typeHint')],
    value: _asyncToGenerator(function* (editor, position) {
      var decl = yield (0, _libclang.getDeclaration)(editor, position.row, position.column);
      if (decl == null) {
        return null;
      }
      var type = decl.type;
      var extent = decl.extent;

      if (type == null || type.trim() === '') {
        return null;
      }
      var hint = type;
      if (type.length > MAX_LENGTH) {
        hint = type.substr(0, MAX_LENGTH) + '...';
      }
      return {
        hint: hint,
        range: new _atom.Range(new _atom.Point(extent.start.line, extent.start.column), new _atom.Point(extent.end.line, extent.end.column))
      };
    })
  }]);

  return TypeHintProvider;
})();

exports.TypeHintProvider = TypeHintProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVIaW50UHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWEyQixNQUFNOzt5QkFDUCxpQkFBaUI7O3dCQUNkLFlBQVk7OztBQUd6QyxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7O0lBRVYsZ0JBQWdCO1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzs7d0JBQWhCLGdCQUFnQjs7aUJBRTFCLDRCQUFZLDZCQUE2QixDQUFDOzZCQUM3QixXQUFDLE1BQXVCLEVBQUUsUUFBb0IsRUFBc0I7QUFDaEYsVUFBTSxJQUFJLEdBQUcsTUFBTSw4QkFBZSxNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekUsVUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLGVBQU8sSUFBSSxDQUFDO09BQ2I7VUFDTSxJQUFJLEdBQVksSUFBSSxDQUFwQixJQUFJO1VBQUUsTUFBTSxHQUFJLElBQUksQ0FBZCxNQUFNOztBQUNuQixVQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0QyxlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFVBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLEVBQUU7QUFDNUIsWUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQztPQUMzQztBQUNELGFBQU87QUFDTCxZQUFJLEVBQUosSUFBSTtBQUNKLGFBQUssRUFBRSxnQkFDTCxnQkFBVSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUNqRCxnQkFBVSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUM5QztPQUNGLENBQUM7S0FDSDs7O1NBdkJVLGdCQUFnQiIsImZpbGUiOiJUeXBlSGludFByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1R5cGVIaW50fSBmcm9tICcuLi8uLi90eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7UG9pbnQsIFJhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2dldERlY2xhcmF0aW9ufSBmcm9tICcuL2xpYmNsYW5nJztcblxuLy8gVHlwZXMgbG9uZ2VyIHRoYW4gdGhpcyB3aWxsIGJlIHRydW5jYXRlZC5cbmNvbnN0IE1BWF9MRU5HVEggPSAyNTY7XG5cbmV4cG9ydCBjbGFzcyBUeXBlSGludFByb3ZpZGVyIHtcblxuICBAdHJhY2tUaW1pbmcoJ251Y2xpZGUtY2xhbmctYXRvbS50eXBlSGludCcpXG4gIGFzeW5jIHR5cGVIaW50KGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2U8P1R5cGVIaW50PiB7XG4gICAgY29uc3QgZGVjbCA9IGF3YWl0IGdldERlY2xhcmF0aW9uKGVkaXRvciwgcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW4pO1xuICAgIGlmIChkZWNsID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7dHlwZSwgZXh0ZW50fSA9IGRlY2w7XG4gICAgaWYgKHR5cGUgPT0gbnVsbCB8fCB0eXBlLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgaGludCA9IHR5cGU7XG4gICAgaWYgKHR5cGUubGVuZ3RoID4gTUFYX0xFTkdUSCkge1xuICAgICAgaGludCA9IHR5cGUuc3Vic3RyKDAsIE1BWF9MRU5HVEgpICsgJy4uLic7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBoaW50LFxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZShcbiAgICAgICAgbmV3IFBvaW50KGV4dGVudC5zdGFydC5saW5lLCBleHRlbnQuc3RhcnQuY29sdW1uKSxcbiAgICAgICAgbmV3IFBvaW50KGV4dGVudC5lbmQubGluZSwgZXh0ZW50LmVuZC5jb2x1bW4pLFxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==