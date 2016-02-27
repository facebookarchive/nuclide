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

var _atomHelpers = require('../../atom-helpers');

var _analytics = require('../../analytics');

var _hackCommonLibConstants = require('../../hack-common/lib/constants');

var HyperclickProvider = (function () {
  function HyperclickProvider() {
    _classCallCheck(this, HyperclickProvider);
  }

  _createDecoratedClass(HyperclickProvider, [{
    key: 'getSuggestionForWord',
    decorators: [(0, _analytics.trackTiming)('hack.get-definition')],
    value: _asyncToGenerator(function* (textEditor, text, range) {
      if (!_hackCommonLibConstants.HACK_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
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
            (0, _atomHelpers.goToLocation)(location.path, location.line, location.column);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFhNkIsUUFBUTs7MkJBQ1Ysb0JBQW9COzt5QkFDckIsaUJBQWlCOztzQ0FFWCxpQ0FBaUM7O0lBRTNELGtCQUFrQjtXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7O3dCQUFsQixrQkFBa0I7O2lCQUVyQiw0QkFBWSxxQkFBcUIsQ0FBQzs2QkFDVCxXQUN4QixVQUEyQixFQUMzQixJQUFZLEVBQ1osS0FBaUIsRUFDZTtBQUNoQyxVQUFJLENBQUMsMENBQWtCLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDN0QsZUFBTyxJQUFJLENBQUM7T0FDYjtVQUNhLFFBQVEsR0FBSSxLQUFLLENBQXhCLEtBQUs7OztBQUVaLFVBQU0sU0FBUyxHQUFHLE1BQU0sMEJBQWUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xGLFVBQUksU0FBUyxJQUFJLElBQUksRUFBRTtBQUNyQixlQUFPLElBQUksQ0FBQztPQUNiOzs7OztBQUtELFVBQU0sUUFBUSxHQUFHLFNBQVMsQ0FDdkIsR0FBRyxDQUFDLFVBQUEsUUFBUTtlQUFJLFFBQVEsQ0FBQyxLQUFLO09BQUEsQ0FBQyxDQUMvQixNQUFNLENBQUMsVUFBQSxhQUFhO2VBQUksYUFBYSxJQUFJLElBQUk7T0FBQSxDQUFDLENBQzlDLENBQUMsQ0FBQyxDQUFDO0FBQ04sVUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUMxQyxlQUFPO0FBQ0wsZUFBSyxFQUFLLFFBQVEsQ0FBQyxJQUFJLFdBQU0sUUFBUSxDQUFDLEtBQUssQUFBRTtBQUM3QyxrQkFBUSxFQUFBLG9CQUFHO0FBQ1QsMkNBQWEsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztXQUM3RDtTQUNGLENBQUM7T0FDSCxDQUFDLENBQUM7QUFDSCxhQUFPO0FBQ0wsYUFBSyxFQUFFLFFBQVEsSUFBSSxLQUFLO0FBQ3hCLGdCQUFRLEVBQUUsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxTQUFTO09BQ3JFLENBQUM7S0FDSDs7O1NBckNHLGtCQUFrQjs7O0FBd0N4QixNQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFrQixDQUFDIiwiZmlsZSI6Ikh5cGVyY2xpY2tQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIeXBlcmNsaWNrU3VnZ2VzdGlvbn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljay1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtmaW5kRGVmaW5pdGlvbn0gZnJvbSAnLi9oYWNrJztcbmltcG9ydCB7Z29Ub0xvY2F0aW9ufSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHtIQUNLX0dSQU1NQVJTX1NFVH0gZnJvbSAnLi4vLi4vaGFjay1jb21tb24vbGliL2NvbnN0YW50cyc7XG5cbmNsYXNzIEh5cGVyY2xpY2tQcm92aWRlciB7XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrLmdldC1kZWZpbml0aW9uJylcbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbkZvcldvcmQoXG4gICAgdGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICByYW5nZTogYXRvbSRSYW5nZSxcbiAgKTogUHJvbWlzZTw/SHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcbiAgICBpZiAoIUhBQ0tfR1JBTU1BUlNfU0VULmhhcyh0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qge3N0YXJ0OiBwb3NpdGlvbn0gPSByYW5nZTtcbiAgICAvLyBDcmVhdGUgdGhlIGFjdHVhbC1jYWxsIHByb21pc2Ugc3luY2hyb25vdXNseSBmb3IgbmV4dCBjYWxscyB0byBjb25zdW1lLlxuICAgIGNvbnN0IGxvY2F0aW9ucyA9IGF3YWl0IGZpbmREZWZpbml0aW9uKHRleHRFZGl0b3IsIHBvc2l0aW9uLnJvdywgcG9zaXRpb24uY29sdW1uKTtcbiAgICBpZiAobG9jYXRpb25zID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBPcHRpb25hbGx5IHVzZSB0aGUgcmFuZ2UgcmV0dXJuZWQgZnJvbSB0aGUgZGVmaW5pdGlvbiBtYXRjaGVzLCBpZiBhbnkuXG4gICAgLy8gV2hlbiB0aGUgd29yZCByZWdleCBpc24ndCBnb29kIGVub3VnaCBmb3IgbWF0Y2hpbmcgcmFuZ2VzIChlLmcuIGluIGNhc2Ugb2YgWEhQKSxcbiAgICAvLyB0aGUgb25seSBub24tbnVsbCByZXR1cm5lZCByZXN1bHRzIHdvdWxkIGJlIGZvciB0aGUgeGhwIHJhbmdlLlxuICAgIC8vIEhlbmNlLCBjb25zaWRlcmVkIHRoZSBtb3N0IGFjY3VyYXRlIHJhbmdlIGZvciB0aGUgZGVmaW5pdGlvbiByZXN1bHQocykuXG4gICAgY29uc3QgbmV3UmFuZ2UgPSBsb2NhdGlvbnNcbiAgICAgIC5tYXAobG9jYXRpb24gPT4gbG9jYXRpb24ucmFuZ2UpXG4gICAgICAuZmlsdGVyKGxvY2F0aW9uUmFuZ2UgPT4gbG9jYXRpb25SYW5nZSAhPSBudWxsKVxuICAgICAgWzBdO1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IGxvY2F0aW9ucy5tYXAobG9jYXRpb24gPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IGAke2xvY2F0aW9uLm5hbWV9IDogJHtsb2NhdGlvbi5zY29wZX1gLFxuICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICBnb1RvTG9jYXRpb24obG9jYXRpb24ucGF0aCwgbG9jYXRpb24ubGluZSwgbG9jYXRpb24uY29sdW1uKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJhbmdlOiBuZXdSYW5nZSB8fCByYW5nZSxcbiAgICAgIGNhbGxiYWNrOiBjYWxsYmFja3MubGVuZ3RoID09PSAxID8gY2FsbGJhY2tzWzBdLmNhbGxiYWNrIDogY2FsbGJhY2tzLFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIeXBlcmNsaWNrUHJvdmlkZXI7XG4iXX0=