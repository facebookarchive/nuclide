var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var formatSourceFromEditor = _asyncToGenerator(function* (editor, range) {
  var buffer = editor.getBuffer();
  var filePath = editor.getPath();
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
  if (!hackLanguage || !filePath) {
    return buffer.getTextInRange(range);
  }

  var startPosition = buffer.characterIndexForPosition(range.start);
  var endPosition = buffer.characterIndexForPosition(range.end);
  return yield hackLanguage.formatSource(buffer.getText(), startPosition + 1, endPosition + 1);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAnalytics = require('../../nuclide-analytics');

var _HackLanguage = require('./HackLanguage');

var CodeFormatProvider = (function () {
  function CodeFormatProvider() {
    _classCallCheck(this, CodeFormatProvider);
  }

  _createDecoratedClass(CodeFormatProvider, [{
    key: 'formatCode',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hack.formatCode')],
    value: function formatCode(editor, range) {
      return formatSourceFromEditor(editor, range);
    }
  }]);

  return CodeFormatProvider;
})();

module.exports = CodeFormatProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVGb3JtYXRQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQXVCZSxzQkFBc0IscUJBQXJDLFdBQXNDLE1BQXVCLEVBQUUsS0FBaUIsRUFBbUI7QUFDakcsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2xDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxNQUFNLFlBQVksR0FBRyxNQUFNLHlDQUFzQixRQUFRLENBQUMsQ0FBQztBQUMzRCxNQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzlCLFdBQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNyQzs7QUFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BFLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEUsU0FBTyxNQUFNLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLGFBQWEsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQzlGOzs7Ozs7Ozs7Ozs7OztnQ0F2QnlCLHlCQUF5Qjs7NEJBQ2YsZ0JBQWdCOztJQUU5QyxrQkFBa0I7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7Ozt3QkFBbEIsa0JBQWtCOztpQkFFckIsbUNBQVksaUJBQWlCLENBQUM7V0FDckIsb0JBQUMsTUFBdUIsRUFBRSxLQUFpQixFQUFtQjtBQUN0RSxhQUFPLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM5Qzs7O1NBTEcsa0JBQWtCOzs7QUFzQnhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiQ29kZUZvcm1hdFByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtnZXRIYWNrTGFuZ3VhZ2VGb3JVcml9IGZyb20gJy4vSGFja0xhbmd1YWdlJztcblxuY2xhc3MgQ29kZUZvcm1hdFByb3ZpZGVyIHtcblxuICBAdHJhY2tUaW1pbmcoJ2hhY2suZm9ybWF0Q29kZScpXG4gIGZvcm1hdENvZGUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHJhbmdlOiBhdG9tJFJhbmdlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gZm9ybWF0U291cmNlRnJvbUVkaXRvcihlZGl0b3IsIHJhbmdlKTtcbiAgfVxuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZvcm1hdFNvdXJjZUZyb21FZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHJhbmdlOiBhdG9tJFJhbmdlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gIGNvbnN0IGhhY2tMYW5ndWFnZSA9IGF3YWl0IGdldEhhY2tMYW5ndWFnZUZvclVyaShmaWxlUGF0aCk7XG4gIGlmICghaGFja0xhbmd1YWdlIHx8ICFmaWxlUGF0aCkge1xuICAgIHJldHVybiBidWZmZXIuZ2V0VGV4dEluUmFuZ2UocmFuZ2UpO1xuICB9XG5cbiAgY29uc3Qgc3RhcnRQb3NpdGlvbiA9IGJ1ZmZlci5jaGFyYWN0ZXJJbmRleEZvclBvc2l0aW9uKHJhbmdlLnN0YXJ0KTtcbiAgY29uc3QgZW5kUG9zaXRpb24gPSBidWZmZXIuY2hhcmFjdGVySW5kZXhGb3JQb3NpdGlvbihyYW5nZS5lbmQpO1xuICByZXR1cm4gYXdhaXQgaGFja0xhbmd1YWdlLmZvcm1hdFNvdXJjZShidWZmZXIuZ2V0VGV4dCgpLCBzdGFydFBvc2l0aW9uICsgMSwgZW5kUG9zaXRpb24gKyAxKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2RlRm9ybWF0UHJvdmlkZXI7XG4iXX0=