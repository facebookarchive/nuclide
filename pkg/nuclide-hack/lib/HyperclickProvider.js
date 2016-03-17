var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _hack = require('./hack');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideHackCommon = require('../../nuclide-hack-common');

var HyperclickProvider = (function () {
  function HyperclickProvider() {
    _classCallCheck(this, HyperclickProvider);
  }

  _createDecoratedClass(HyperclickProvider, [{
    key: 'getSuggestionForWord',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hack.get-definition')],
    value: _asyncToGenerator(function* (textEditor, text, range) {
      if (!_nuclideHackCommon.HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
        return null;
      }
      var position = range.start;

      // Create the actual-call promise synchronously for next calls to consume.
      var locations = yield (0, _hack.findDefinition)(textEditor, position.row, position.column);
      if (locations == null) {
        return null;
      }
      // Optionally use the range returned from the definition matches, if any.
      // When the word regex isn't good enough for matching ranges (e.g. in case of XHP),
      // the only non-null returned results would be for the xhp range.
      // Hence, considered the most accurate range for the definition result(s).
      var newRange = locations.map(function (location) {
        return location.range;
      }).filter(function (locationRange) {
        return locationRange != null;
      })[0];
      var callbacks = locations.map(function (location) {
        return {
          title: location.name + ' : ' + location.scope,
          callback: function callback() {
            (0, _nuclideAtomHelpers.goToLocation)(location.path, location.line, location.column);
          }
        };
      });
      return {
        range: newRange || range,
        callback: callbacks.length === 1 ? callbacks[0].callback : callbacks
      };
    })
  }]);

  return HyperclickProvider;
})();

module.exports = HyperclickProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFhNkIsUUFBUTs7a0NBQ1YsNEJBQTRCOztnQ0FDN0IseUJBQXlCOztpQ0FFbkIsMkJBQTJCOztJQUVyRCxrQkFBa0I7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7Ozt3QkFBbEIsa0JBQWtCOztpQkFFckIsbUNBQVkscUJBQXFCLENBQUM7NkJBQ1QsV0FDeEIsVUFBMkIsRUFDM0IsSUFBWSxFQUNaLEtBQWlCLEVBQ2U7QUFDaEMsVUFBSSxDQUFDLHFDQUFrQixHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzdELGVBQU8sSUFBSSxDQUFDO09BQ2I7VUFDYSxRQUFRLEdBQUksS0FBSyxDQUF4QixLQUFLOzs7QUFFWixVQUFNLFNBQVMsR0FBRyxNQUFNLDBCQUFlLFVBQVUsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRixVQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFDckIsZUFBTyxJQUFJLENBQUM7T0FDYjs7Ozs7QUFLRCxVQUFNLFFBQVEsR0FBRyxTQUFTLENBQ3ZCLEdBQUcsQ0FBQyxVQUFBLFFBQVE7ZUFBSSxRQUFRLENBQUMsS0FBSztPQUFBLENBQUMsQ0FDL0IsTUFBTSxDQUFDLFVBQUEsYUFBYTtlQUFJLGFBQWEsSUFBSSxJQUFJO09BQUEsQ0FBQyxDQUM5QyxDQUFDLENBQUMsQ0FBQztBQUNOLFVBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDMUMsZUFBTztBQUNMLGVBQUssRUFBSyxRQUFRLENBQUMsSUFBSSxXQUFNLFFBQVEsQ0FBQyxLQUFLLEFBQUU7QUFDN0Msa0JBQVEsRUFBQSxvQkFBRztBQUNULGtEQUFhLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDN0Q7U0FDRixDQUFDO09BQ0gsQ0FBQyxDQUFDO0FBQ0gsYUFBTztBQUNMLGFBQUssRUFBRSxRQUFRLElBQUksS0FBSztBQUN4QixnQkFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsU0FBUztPQUNyRSxDQUFDO0tBQ0g7OztTQXJDRyxrQkFBa0I7OztBQXdDeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJIeXBlcmNsaWNrUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SHlwZXJjbGlja1N1Z2dlc3Rpb259IGZyb20gJy4uLy4uL2h5cGVyY2xpY2staW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7ZmluZERlZmluaXRpb259IGZyb20gJy4vaGFjayc7XG5pbXBvcnQge2dvVG9Mb2NhdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5pbXBvcnQge0hBQ0tfR1JBTU1BUlNfU0VUfSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stY29tbW9uJztcblxuY2xhc3MgSHlwZXJjbGlja1Byb3ZpZGVyIHtcblxuICBAdHJhY2tUaW1pbmcoJ2hhY2suZ2V0LWRlZmluaXRpb24nKVxuICBhc3luYyBnZXRTdWdnZXN0aW9uRm9yV29yZChcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIHJhbmdlOiBhdG9tJFJhbmdlLFxuICApOiBQcm9taXNlPD9IeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xuICAgIGlmICghSEFDS19HUkFNTUFSU19TRVQuaGFzKHRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7c3RhcnQ6IHBvc2l0aW9ufSA9IHJhbmdlO1xuICAgIC8vIENyZWF0ZSB0aGUgYWN0dWFsLWNhbGwgcHJvbWlzZSBzeW5jaHJvbm91c2x5IGZvciBuZXh0IGNhbGxzIHRvIGNvbnN1bWUuXG4gICAgY29uc3QgbG9jYXRpb25zID0gYXdhaXQgZmluZERlZmluaXRpb24odGV4dEVkaXRvciwgcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW4pO1xuICAgIGlmIChsb2NhdGlvbnMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIE9wdGlvbmFsbHkgdXNlIHRoZSByYW5nZSByZXR1cm5lZCBmcm9tIHRoZSBkZWZpbml0aW9uIG1hdGNoZXMsIGlmIGFueS5cbiAgICAvLyBXaGVuIHRoZSB3b3JkIHJlZ2V4IGlzbid0IGdvb2QgZW5vdWdoIGZvciBtYXRjaGluZyByYW5nZXMgKGUuZy4gaW4gY2FzZSBvZiBYSFApLFxuICAgIC8vIHRoZSBvbmx5IG5vbi1udWxsIHJldHVybmVkIHJlc3VsdHMgd291bGQgYmUgZm9yIHRoZSB4aHAgcmFuZ2UuXG4gICAgLy8gSGVuY2UsIGNvbnNpZGVyZWQgdGhlIG1vc3QgYWNjdXJhdGUgcmFuZ2UgZm9yIHRoZSBkZWZpbml0aW9uIHJlc3VsdChzKS5cbiAgICBjb25zdCBuZXdSYW5nZSA9IGxvY2F0aW9uc1xuICAgICAgLm1hcChsb2NhdGlvbiA9PiBsb2NhdGlvbi5yYW5nZSlcbiAgICAgIC5maWx0ZXIobG9jYXRpb25SYW5nZSA9PiBsb2NhdGlvblJhbmdlICE9IG51bGwpXG4gICAgICBbMF07XG4gICAgY29uc3QgY2FsbGJhY2tzID0gbG9jYXRpb25zLm1hcChsb2NhdGlvbiA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogYCR7bG9jYXRpb24ubmFtZX0gOiAke2xvY2F0aW9uLnNjb3BlfWAsXG4gICAgICAgIGNhbGxiYWNrKCkge1xuICAgICAgICAgIGdvVG9Mb2NhdGlvbihsb2NhdGlvbi5wYXRoLCBsb2NhdGlvbi5saW5lLCBsb2NhdGlvbi5jb2x1bW4pO1xuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2U6IG5ld1JhbmdlIHx8IHJhbmdlLFxuICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrcy5sZW5ndGggPT09IDEgPyBjYWxsYmFja3NbMF0uY2FsbGJhY2sgOiBjYWxsYmFja3MsXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEh5cGVyY2xpY2tQcm92aWRlcjtcbiJdfQ==