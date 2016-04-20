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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _HackLanguage = require('./HackLanguage');

var _nuclideHackCommon = require('../../nuclide-hack-common');

var _nuclideCommons = require('../../nuclide-commons');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var HyperclickProvider = (function () {
  function HyperclickProvider() {
    _classCallCheck(this, HyperclickProvider);
  }

  _createDecoratedClass(HyperclickProvider, [{
    key: 'getSuggestionForWord',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hack.get-definition')],
    value: _asyncToGenerator(function* (editor, text, range) {
      if (!_nuclideHackCommon.HACK_GRAMMARS_SET.has(editor.getGrammar().scopeName)) {
        return null;
      }
      var filePath = editor.getPath();
      if (filePath == null) {
        return null;
      }
      var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
      if (hackLanguage == null) {
        return null;
      }

      var line = range.start.row;
      var column = range.start.column;
      var contents = editor.getText();
      if (yield (0, _nuclideCommons.passesGK)('nuclide_hack_ide_get_definition')) {
        var _ret = yield* (function* () {
          var definition = yield hackLanguage.getIdeDefinition(filePath, contents, line + 1, column + 1);
          return {
            v: definition == null ? null : {
              range: definition.queryRange,
              callback: function callback() {
                (0, _nuclideAtomHelpers.goToLocation)(definition.path, definition.line - 1, definition.column - 1);
              }
            }
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } else {
        // TODO: Remove this once the GK is at 100%
        var buffer = editor.getBuffer();
        var lineText = buffer.lineForRow(line);
        var definitions = yield hackLanguage.getDefinition(filePath, contents, line + 1, column + 1, lineText);

        if (definitions.length === 0) {
          return null;
        }

        // Optionally use the range returned from the definition matches, if any.
        // When the word regex isn't good enough for matching ranges (e.g. in case of XHP),
        // the only non-null returned results would be for the xhp range.
        // Hence, considered the most accurate range for the definition result(s).
        var newRange = range;
        var locationResult = definitions.filter(function (definition) {
          return definition.searchStartColumn != null && definition.searchEndColumn != null;
        })[0];
        if (locationResult != null) {
          (0, _assert2['default'])(locationResult.searchStartColumn != null && locationResult.searchEndColumn != null);
          newRange = new _atom.Range([line, locationResult.searchStartColumn], [line, locationResult.searchEndColumn]);
        }

        var callbacks = definitions.map(function (location) {
          return {
            title: location.name + ' : ' + location.scope,
            callback: function callback() {
              (0, _nuclideAtomHelpers.goToLocation)(location.path, location.line, location.column);
            }
          };
        });
        return {
          range: newRange,
          callback: callbacks.length === 1 ? callbacks[0].callback : callbacks
        };
      }
    })
  }]);

  return HyperclickProvider;
})();

exports.HyperclickProvider = HyperclickProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFhb0IsTUFBTTs7a0NBQ0MsNEJBQTRCOztnQ0FDN0IseUJBQXlCOzs0QkFDZixnQkFBZ0I7O2lDQUNwQiwyQkFBMkI7OzhCQUNwQyx1QkFBdUI7O3NCQUN4QixRQUFROzs7O0lBRWpCLGtCQUFrQjtXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7O3dCQUFsQixrQkFBa0I7O2lCQUU1QixtQ0FBWSxxQkFBcUIsQ0FBQzs2QkFDVCxXQUN4QixNQUF1QixFQUN2QixJQUFZLEVBQ1osS0FBaUIsRUFDZTtBQUNoQyxVQUFJLENBQUMscUNBQWtCLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDekQsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQU0sWUFBWSxHQUFHLE1BQU0seUNBQXNCLFFBQVEsQ0FBQyxDQUFDO0FBQzNELFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4QixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQzdCLFVBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ2xDLFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFJLE1BQU0sOEJBQVMsaUNBQWlDLENBQUMsRUFBRTs7QUFDckQsY0FBTSxVQUFVLEdBQUcsTUFBTSxZQUFZLENBQUMsZ0JBQWdCLENBQ3BELFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUM7ZUFBTyxVQUFVLElBQUksSUFBSSxHQUFHLElBQUksR0FBRztBQUNqQyxtQkFBSyxFQUFFLFVBQVUsQ0FBQyxVQUFVO0FBQzVCLHNCQUFRLEVBQUEsb0JBQUc7QUFDVCxzREFBYSxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7ZUFDM0U7YUFDRjtZQUFDOzs7O09BQ0gsTUFBTTs7QUFFTCxZQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbEMsWUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QyxZQUFNLFdBQVcsR0FBRyxNQUFNLFlBQVksQ0FBQyxhQUFhLENBQ2xELFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FDbkQsQ0FBQzs7QUFFRixZQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzVCLGlCQUFPLElBQUksQ0FBQztTQUNiOzs7Ozs7QUFNRCxZQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDckIsWUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFBLFVBQVU7aUJBQ2xELFVBQVUsQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLGVBQWUsSUFBSSxJQUFJO1NBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLFlBQUksY0FBYyxJQUFJLElBQUksRUFBRTtBQUMxQixtQ0FBVSxjQUFjLENBQUMsaUJBQWlCLElBQUksSUFBSSxJQUM3QyxjQUFjLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzdDLGtCQUFRLEdBQUcsZ0JBQ1QsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEVBQ3hDLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1NBQzNDOztBQUVELFlBQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDNUMsaUJBQU87QUFDTCxpQkFBSyxFQUFLLFFBQVEsQ0FBQyxJQUFJLFdBQU0sUUFBUSxDQUFDLEtBQUssQUFBRTtBQUM3QyxvQkFBUSxFQUFBLG9CQUFHO0FBQ1Qsb0RBQWEsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM3RDtXQUNGLENBQUM7U0FDSCxDQUFDLENBQUM7QUFDSCxlQUFPO0FBQ0wsZUFBSyxFQUFFLFFBQVE7QUFDZixrQkFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsU0FBUztTQUNyRSxDQUFDO09BQ0g7S0FDRjs7O1NBeEVVLGtCQUFrQiIsImZpbGUiOiJIeXBlcmNsaWNrUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SHlwZXJjbGlja1N1Z2dlc3Rpb259IGZyb20gJy4uLy4uL2h5cGVyY2xpY2snO1xuXG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Z29Ub0xvY2F0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2dldEhhY2tMYW5ndWFnZUZvclVyaX0gZnJvbSAnLi9IYWNrTGFuZ3VhZ2UnO1xuaW1wb3J0IHtIQUNLX0dSQU1NQVJTX1NFVH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLWNvbW1vbic7XG5pbXBvcnQge3Bhc3Nlc0dLfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5leHBvcnQgY2xhc3MgSHlwZXJjbGlja1Byb3ZpZGVyIHtcblxuICBAdHJhY2tUaW1pbmcoJ2hhY2suZ2V0LWRlZmluaXRpb24nKVxuICBhc3luYyBnZXRTdWdnZXN0aW9uRm9yV29yZChcbiAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgcmFuZ2U6IGF0b20kUmFuZ2UsXG4gICk6IFByb21pc2U8P0h5cGVyY2xpY2tTdWdnZXN0aW9uPiB7XG4gICAgaWYgKCFIQUNLX0dSQU1NQVJTX1NFVC5oYXMoZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmIChmaWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgaGFja0xhbmd1YWdlID0gYXdhaXQgZ2V0SGFja0xhbmd1YWdlRm9yVXJpKGZpbGVQYXRoKTtcbiAgICBpZiAoaGFja0xhbmd1YWdlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGxpbmUgPSByYW5nZS5zdGFydC5yb3c7XG4gICAgY29uc3QgY29sdW1uID0gcmFuZ2Uuc3RhcnQuY29sdW1uO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gZWRpdG9yLmdldFRleHQoKTtcbiAgICBpZiAoYXdhaXQgcGFzc2VzR0soJ251Y2xpZGVfaGFja19pZGVfZ2V0X2RlZmluaXRpb24nKSkge1xuICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGF3YWl0IGhhY2tMYW5ndWFnZS5nZXRJZGVEZWZpbml0aW9uKFxuICAgICAgICBmaWxlUGF0aCwgY29udGVudHMsIGxpbmUgKyAxLCBjb2x1bW4gKyAxKTtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uID09IG51bGwgPyBudWxsIDoge1xuICAgICAgICByYW5nZTogZGVmaW5pdGlvbi5xdWVyeVJhbmdlLFxuICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICBnb1RvTG9jYXRpb24oZGVmaW5pdGlvbi5wYXRoLCBkZWZpbml0aW9uLmxpbmUgLSAxLCBkZWZpbml0aW9uLmNvbHVtbiAtIDEpO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogUmVtb3ZlIHRoaXMgb25jZSB0aGUgR0sgaXMgYXQgMTAwJVxuICAgICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgY29uc3QgbGluZVRleHQgPSBidWZmZXIubGluZUZvclJvdyhsaW5lKTtcbiAgICAgIGNvbnN0IGRlZmluaXRpb25zID0gYXdhaXQgaGFja0xhbmd1YWdlLmdldERlZmluaXRpb24oXG4gICAgICAgIGZpbGVQYXRoLCBjb250ZW50cywgbGluZSArIDEsIGNvbHVtbiArIDEsIGxpbmVUZXh0XG4gICAgICApO1xuXG4gICAgICBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBPcHRpb25hbGx5IHVzZSB0aGUgcmFuZ2UgcmV0dXJuZWQgZnJvbSB0aGUgZGVmaW5pdGlvbiBtYXRjaGVzLCBpZiBhbnkuXG4gICAgICAvLyBXaGVuIHRoZSB3b3JkIHJlZ2V4IGlzbid0IGdvb2QgZW5vdWdoIGZvciBtYXRjaGluZyByYW5nZXMgKGUuZy4gaW4gY2FzZSBvZiBYSFApLFxuICAgICAgLy8gdGhlIG9ubHkgbm9uLW51bGwgcmV0dXJuZWQgcmVzdWx0cyB3b3VsZCBiZSBmb3IgdGhlIHhocCByYW5nZS5cbiAgICAgIC8vIEhlbmNlLCBjb25zaWRlcmVkIHRoZSBtb3N0IGFjY3VyYXRlIHJhbmdlIGZvciB0aGUgZGVmaW5pdGlvbiByZXN1bHQocykuXG4gICAgICBsZXQgbmV3UmFuZ2UgPSByYW5nZTtcbiAgICAgIGNvbnN0IGxvY2F0aW9uUmVzdWx0ID0gZGVmaW5pdGlvbnMuZmlsdGVyKGRlZmluaXRpb24gPT5cbiAgICAgICAgZGVmaW5pdGlvbi5zZWFyY2hTdGFydENvbHVtbiAhPSBudWxsICYmIGRlZmluaXRpb24uc2VhcmNoRW5kQ29sdW1uICE9IG51bGwpWzBdO1xuICAgICAgaWYgKGxvY2F0aW9uUmVzdWx0ICE9IG51bGwpIHtcbiAgICAgICAgaW52YXJpYW50KGxvY2F0aW9uUmVzdWx0LnNlYXJjaFN0YXJ0Q29sdW1uICE9IG51bGxcbiAgICAgICAgICAmJiBsb2NhdGlvblJlc3VsdC5zZWFyY2hFbmRDb2x1bW4gIT0gbnVsbCk7XG4gICAgICAgIG5ld1JhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgICAgIFtsaW5lLCBsb2NhdGlvblJlc3VsdC5zZWFyY2hTdGFydENvbHVtbl0sXG4gICAgICAgICAgW2xpbmUsIGxvY2F0aW9uUmVzdWx0LnNlYXJjaEVuZENvbHVtbl0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjYWxsYmFja3MgPSBkZWZpbml0aW9ucy5tYXAobG9jYXRpb24gPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRpdGxlOiBgJHtsb2NhdGlvbi5uYW1lfSA6ICR7bG9jYXRpb24uc2NvcGV9YCxcbiAgICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICAgIGdvVG9Mb2NhdGlvbihsb2NhdGlvbi5wYXRoLCBsb2NhdGlvbi5saW5lLCBsb2NhdGlvbi5jb2x1bW4pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlOiBuZXdSYW5nZSxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrcy5sZW5ndGggPT09IDEgPyBjYWxsYmFja3NbMF0uY2FsbGJhY2sgOiBjYWxsYmFja3MsXG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuIl19