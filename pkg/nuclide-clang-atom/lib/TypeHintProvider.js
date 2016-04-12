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

var _nuclideAnalytics = require('../../nuclide-analytics');

var _libclang = require('./libclang');

// Types longer than this will be truncated.
var MAX_LENGTH = 256;

var TypeHintProvider = (function () {
  function TypeHintProvider() {
    _classCallCheck(this, TypeHintProvider);
  }

  _createDecoratedClass(TypeHintProvider, [{
    key: 'typeHint',
    decorators: [(0, _nuclideAnalytics.trackTiming)('nuclide-clang-atom.typeHint')],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVIaW50UHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWEyQixNQUFNOztnQ0FDUCx5QkFBeUI7O3dCQUN0QixZQUFZOzs7QUFHekMsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDOztJQUVWLGdCQUFnQjtXQUFoQixnQkFBZ0I7MEJBQWhCLGdCQUFnQjs7O3dCQUFoQixnQkFBZ0I7O2lCQUUxQixtQ0FBWSw2QkFBNkIsQ0FBQzs2QkFDN0IsV0FBQyxNQUF1QixFQUFFLFFBQW9CLEVBQXNCO0FBQ2hGLFVBQU0sSUFBSSxHQUFHLE1BQU0sOEJBQWUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pFLFVBQUksSUFBSSxJQUFJLElBQUksRUFBRTtBQUNoQixlQUFPLElBQUksQ0FBQztPQUNiO1VBQ00sSUFBSSxHQUFZLElBQUksQ0FBcEIsSUFBSTtVQUFFLE1BQU0sR0FBSSxJQUFJLENBQWQsTUFBTTs7QUFDbkIsVUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7QUFDdEMsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixVQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxFQUFFO0FBQzVCLFlBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUM7T0FDM0M7QUFDRCxhQUFPO0FBQ0wsWUFBSSxFQUFKLElBQUk7QUFDSixhQUFLLEVBQUUsZ0JBQ0wsZ0JBQVUsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFDakQsZ0JBQVUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FDOUM7T0FDRixDQUFDO0tBQ0g7OztTQXZCVSxnQkFBZ0IiLCJmaWxlIjoiVHlwZUhpbnRQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUeXBlSGludH0gZnJvbSAnLi4vLi4vbnVjbGlkZS10eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7UG9pbnQsIFJhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0RGVjbGFyYXRpb259IGZyb20gJy4vbGliY2xhbmcnO1xuXG4vLyBUeXBlcyBsb25nZXIgdGhhbiB0aGlzIHdpbGwgYmUgdHJ1bmNhdGVkLlxuY29uc3QgTUFYX0xFTkdUSCA9IDI1NjtcblxuZXhwb3J0IGNsYXNzIFR5cGVIaW50UHJvdmlkZXIge1xuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1jbGFuZy1hdG9tLnR5cGVIaW50JylcbiAgYXN5bmMgdHlwZUhpbnQoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTw/VHlwZUhpbnQ+IHtcbiAgICBjb25zdCBkZWNsID0gYXdhaXQgZ2V0RGVjbGFyYXRpb24oZWRpdG9yLCBwb3NpdGlvbi5yb3csIHBvc2l0aW9uLmNvbHVtbik7XG4gICAgaWYgKGRlY2wgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHt0eXBlLCBleHRlbnR9ID0gZGVjbDtcbiAgICBpZiAodHlwZSA9PSBudWxsIHx8IHR5cGUudHJpbSgpID09PSAnJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBoaW50ID0gdHlwZTtcbiAgICBpZiAodHlwZS5sZW5ndGggPiBNQVhfTEVOR1RIKSB7XG4gICAgICBoaW50ID0gdHlwZS5zdWJzdHIoMCwgTUFYX0xFTkdUSCkgKyAnLi4uJztcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGhpbnQsXG4gICAgICByYW5nZTogbmV3IFJhbmdlKFxuICAgICAgICBuZXcgUG9pbnQoZXh0ZW50LnN0YXJ0LmxpbmUsIGV4dGVudC5zdGFydC5jb2x1bW4pLFxuICAgICAgICBuZXcgUG9pbnQoZXh0ZW50LmVuZC5saW5lLCBleHRlbnQuZW5kLmNvbHVtbiksXG4gICAgICApLFxuICAgIH07XG4gIH1cblxufVxuIl19