function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _constants = require('./constants');

var EXTENSIONS = new Set(['ml', 'mli']);

module.exports = {
  priority: 20,
  providerName: 'nuclide-ocaml',
  getSuggestionForWord: _asyncToGenerator(function* (textEditor, text, range) {
    var _require = require('../../nuclide-client');

    var getServiceByNuclideUri = _require.getServiceByNuclideUri;

    if (!_constants.GRAMMARS.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var file = textEditor.getPath();

    if (file == null) {
      return null;
    }

    var kind = 'ml';
    var extension = _path2['default'].extname(file);
    if (EXTENSIONS.has(extension)) {
      kind = extension;
    }

    var instance = yield getServiceByNuclideUri('MerlinService', file);
    (0, _assert2['default'])(instance);
    var start = range.start;

    return {
      range: range,
      callback: _asyncToGenerator(function* () {
        yield instance.pushNewBuffer(file, textEditor.getText());
        var location = yield instance.locate(file, start.row, start.column, kind);
        if (!location) {
          return;
        }

        var _require2 = require('../../nuclide-atom-helpers');

        var goToLocation = _require2.goToLocation;

        goToLocation(location.file, location.pos.line - 1, location.pos.col);
      })
    };
  })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBYWlCLE1BQU07Ozs7c0JBQ0QsUUFBUTs7Ozt5QkFDUCxhQUFhOztBQUVwQyxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUN6QixJQUFJLEVBQ0osS0FBSyxDQUNOLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFFLEVBQUU7QUFDWixjQUFZLEVBQUUsZUFBZTtBQUM3QixBQUFNLHNCQUFvQixvQkFBQSxXQUN4QixVQUEyQixFQUMzQixJQUFZLEVBQ1osS0FBaUIsRUFDZTttQkFDQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7O1FBQXpELHNCQUFzQixZQUF0QixzQkFBc0I7O0FBRTdCLFFBQUksQ0FBQyxvQkFBUyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3BELGFBQU8sSUFBSSxDQUFDO0tBQ2I7O0FBRUQsUUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVsQyxRQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsYUFBTyxJQUFJLENBQUM7S0FDYjs7QUFFRCxRQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsUUFBTSxTQUFTLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLFFBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUM3QixVQUFJLEdBQUcsU0FBUyxDQUFDO0tBQ2xCOztBQUVELFFBQU0sUUFBUSxHQUFHLE1BQU0sc0JBQXNCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JFLDZCQUFVLFFBQVEsQ0FBQyxDQUFDO0FBQ3BCLFFBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTFCLFdBQU87QUFDTCxXQUFLLEVBQUwsS0FBSztBQUNMLGNBQVEsb0JBQUUsYUFBaUI7QUFDekIsY0FBTSxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUN6RCxZQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQ3BDLElBQUksRUFDSixLQUFLLENBQUMsR0FBRyxFQUNULEtBQUssQ0FBQyxNQUFNLEVBQ1osSUFBSSxDQUFDLENBQUM7QUFDUixZQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsaUJBQU87U0FDUjs7d0JBRXNCLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQzs7WUFBckQsWUFBWSxhQUFaLFlBQVk7O0FBQ25CLG9CQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUN0RSxDQUFBO0tBQ0YsQ0FBQztHQUNILENBQUE7Q0FDRixDQUFDIiwiZmlsZSI6Ikh5cGVyY2xpY2tQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIeXBlcmNsaWNrU3VnZ2VzdGlvbn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljayc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtHUkFNTUFSU30gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5jb25zdCBFWFRFTlNJT05TID0gbmV3IFNldChbXG4gICdtbCcsXG4gICdtbGknLFxuXSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwcmlvcml0eTogMjAsXG4gIHByb3ZpZGVyTmFtZTogJ251Y2xpZGUtb2NhbWwnLFxuICBhc3luYyBnZXRTdWdnZXN0aW9uRm9yV29yZChcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIHJhbmdlOiBhdG9tJFJhbmdlXG4gICk6IFByb21pc2U8P0h5cGVyY2xpY2tTdWdnZXN0aW9uPiB7XG4gICAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jbGllbnQnKTtcblxuICAgIGlmICghR1JBTU1BUlMuaGFzKHRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGUgPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcblxuICAgIGlmIChmaWxlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBraW5kID0gJ21sJztcbiAgICBjb25zdCBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoZmlsZSk7XG4gICAgaWYgKEVYVEVOU0lPTlMuaGFzKGV4dGVuc2lvbikpIHtcbiAgICAgIGtpbmQgPSBleHRlbnNpb247XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFuY2UgPSBhd2FpdCBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdNZXJsaW5TZXJ2aWNlJywgZmlsZSk7XG4gICAgaW52YXJpYW50KGluc3RhbmNlKTtcbiAgICBjb25zdCBzdGFydCA9IHJhbmdlLnN0YXJ0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJhbmdlLFxuICAgICAgY2FsbGJhY2s6IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBhd2FpdCBpbnN0YW5jZS5wdXNoTmV3QnVmZmVyKGZpbGUsIHRleHRFZGl0b3IuZ2V0VGV4dCgpKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBpbnN0YW5jZS5sb2NhdGUoXG4gICAgICAgICAgZmlsZSxcbiAgICAgICAgICBzdGFydC5yb3csXG4gICAgICAgICAgc3RhcnQuY29sdW1uLFxuICAgICAgICAgIGtpbmQpO1xuICAgICAgICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge2dvVG9Mb2NhdGlvbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpO1xuICAgICAgICBnb1RvTG9jYXRpb24obG9jYXRpb24uZmlsZSwgbG9jYXRpb24ucG9zLmxpbmUgLSAxLCBsb2NhdGlvbi5wb3MuY29sKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=