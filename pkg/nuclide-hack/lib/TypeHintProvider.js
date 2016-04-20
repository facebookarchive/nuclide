var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var typeHintFromEditor = _asyncToGenerator(function* (editor, position) {
  var filePath = editor.getPath();
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
  if (!hackLanguage || !filePath) {
    return null;
  }

  var match = (0, _utils.getIdentifierAndRange)(editor, position);
  if (match == null) {
    return null;
  }

  var contents = editor.getText();

  var type = yield hackLanguage.getType(filePath, contents, match.id, position.row + 1, position.column + 1);
  if (!type || type === '_') {
    return null;
  } else {
    return {
      hint: type,
      range: match.range
    };
  }
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _HackLanguage = require('./HackLanguage');

var _utils = require('./utils');

var _nuclideAnalytics = require('../../nuclide-analytics');

module.exports = (function () {
  function TypeHintProvider() {
    _classCallCheck(this, TypeHintProvider);
  }

  _createDecoratedClass(TypeHintProvider, [{
    key: 'typeHint',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hack.typeHint')],
    value: function typeHint(editor, position) {
      return typeHintFromEditor(editor, position);
    }
  }]);

  return TypeHintProvider;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVIaW50UHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQTBCZSxrQkFBa0IscUJBQWpDLFdBQ0UsTUFBdUIsRUFDdkIsUUFBb0IsRUFDQTtBQUNwQixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsTUFBTSxZQUFZLEdBQUcsTUFBTSx5Q0FBc0IsUUFBUSxDQUFDLENBQUM7QUFDM0QsTUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUM5QixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELE1BQU0sS0FBSyxHQUFHLGtDQUFzQixNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEQsTUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVsQyxNQUFNLElBQUksR0FBRyxNQUFNLFlBQVksQ0FBQyxPQUFPLENBQ3JDLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLE1BQUksQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRTtBQUN6QixXQUFPLElBQUksQ0FBQztHQUNiLE1BQU07QUFDTCxXQUFPO0FBQ0wsVUFBSSxFQUFFLElBQUk7QUFDVixXQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7S0FDbkIsQ0FBQztHQUNIO0NBQ0Y7Ozs7Ozs0QkF4Q21DLGdCQUFnQjs7cUJBQ2hCLFNBQVM7O2dDQUNuQix5QkFBeUI7O0FBRW5ELE1BQU0sQ0FBQyxPQUFPO1dBQVMsZ0JBQWdCOzBCQUFoQixnQkFBZ0I7Ozt3QkFBaEIsZ0JBQWdCOztpQkFFcEMsbUNBQVksZUFBZSxDQUFDO1dBQ3JCLGtCQUFDLE1BQXVCLEVBQUUsUUFBb0IsRUFBc0I7QUFDMUUsYUFBTyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDN0M7OztTQUxvQixnQkFBZ0I7SUFPdEMsQ0FBQyIsImZpbGUiOiJUeXBlSGludFByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1R5cGVIaW50fSBmcm9tICcuLi8uLi9udWNsaWRlLXR5cGUtaGludC1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtnZXRIYWNrTGFuZ3VhZ2VGb3JVcml9IGZyb20gJy4vSGFja0xhbmd1YWdlJztcbmltcG9ydCB7Z2V0SWRlbnRpZmllckFuZFJhbmdlfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUeXBlSGludFByb3ZpZGVyIHtcblxuICBAdHJhY2tUaW1pbmcoJ2hhY2sudHlwZUhpbnQnKVxuICB0eXBlSGludChlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpOiBQcm9taXNlPD9UeXBlSGludD4ge1xuICAgIHJldHVybiB0eXBlSGludEZyb21FZGl0b3IoZWRpdG9yLCBwb3NpdGlvbik7XG4gIH1cblxufTtcblxuYXN5bmMgZnVuY3Rpb24gdHlwZUhpbnRGcm9tRWRpdG9yKFxuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgcG9zaXRpb246IGF0b20kUG9pbnRcbik6IFByb21pc2U8P1R5cGVIaW50PiB7XG4gIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgY29uc3QgaGFja0xhbmd1YWdlID0gYXdhaXQgZ2V0SGFja0xhbmd1YWdlRm9yVXJpKGZpbGVQYXRoKTtcbiAgaWYgKCFoYWNrTGFuZ3VhZ2UgfHwgIWZpbGVQYXRoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBtYXRjaCA9IGdldElkZW50aWZpZXJBbmRSYW5nZShlZGl0b3IsIHBvc2l0aW9uKTtcbiAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRzID0gZWRpdG9yLmdldFRleHQoKTtcblxuICBjb25zdCB0eXBlID0gYXdhaXQgaGFja0xhbmd1YWdlLmdldFR5cGUoXG4gICAgZmlsZVBhdGgsIGNvbnRlbnRzLCBtYXRjaC5pZCwgcG9zaXRpb24ucm93ICsgMSwgcG9zaXRpb24uY29sdW1uICsgMSk7XG4gIGlmICghdHlwZSB8fCB0eXBlID09PSAnXycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGludDogdHlwZSxcbiAgICAgIHJhbmdlOiBtYXRjaC5yYW5nZSxcbiAgICB9O1xuICB9XG59XG4iXX0=