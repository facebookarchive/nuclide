function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var GRAMMARS = new Set(['source.ocaml']);
var EXTENSIONS = new Set(['ml', 'mli']);

module.exports = {
  priority: 20,
  providerName: 'nuclide-ocaml',
  getSuggestionForWord: _asyncToGenerator(function* (textEditor, text, range) {
    var _require = require('../../client');

    var getServiceByNuclideUri = _require.getServiceByNuclideUri;

    if (!GRAMMARS.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var file = textEditor.getPath();

    if (file == null) {
      return null;
    }

    var kind = 'ml';
    var extension = require('path').extname(file);
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

        var _require2 = require('../../atom-helpers');

        var goToLocation = _require2.goToLocation;

        goToLocation(location.file, location.pos.line - 1, location.pos.col);
      })
    };
  })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkh5cGVyY2xpY2tQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7c0JBYXNCLFFBQVE7Ozs7QUFFOUIsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FDdkIsY0FBYyxDQUNmLENBQUMsQ0FBQztBQUNILElBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLENBQ3pCLElBQUksRUFDSixLQUFLLENBQ04sQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUUsRUFBRTtBQUNaLGNBQVksRUFBRSxlQUFlO0FBQzdCLEFBQU0sc0JBQW9CLG9CQUFBLFdBQ3hCLFVBQTJCLEVBQzNCLElBQVksRUFDWixLQUFpQixFQUNlO21CQUNDLE9BQU8sQ0FBQyxjQUFjLENBQUM7O1FBQWpELHNCQUFzQixZQUF0QixzQkFBc0I7O0FBRTdCLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUNwRCxhQUFPLElBQUksQ0FBQztLQUNiOztBQUVELFFBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFbEMsUUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7O0FBRUQsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsUUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzdCLFVBQUksR0FBRyxTQUFTLENBQUM7S0FDbEI7O0FBRUQsUUFBTSxRQUFRLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckUsNkJBQVUsUUFBUSxDQUFDLENBQUM7QUFDcEIsUUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFMUIsV0FBTztBQUNMLFdBQUssRUFBTCxLQUFLO0FBQ0wsY0FBUSxvQkFBRSxhQUFpQjtBQUN6QixjQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELFlBQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FDcEMsSUFBSSxFQUNKLEtBQUssQ0FBQyxHQUFHLEVBQ1QsS0FBSyxDQUFDLE1BQU0sRUFDWixJQUFJLENBQUMsQ0FBQztBQUNSLFlBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixpQkFBTztTQUNSOzt3QkFFc0IsT0FBTyxDQUFDLG9CQUFvQixDQUFDOztZQUE3QyxZQUFZLGFBQVosWUFBWTs7QUFDbkIsb0JBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3RFLENBQUE7S0FDRixDQUFDO0dBQ0gsQ0FBQTtDQUNGLENBQUMiLCJmaWxlIjoiSHlwZXJjbGlja1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tTdWdnZXN0aW9ufSBmcm9tICcuLi8uLi9oeXBlcmNsaWNrLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IEdSQU1NQVJTID0gbmV3IFNldChbXG4gICdzb3VyY2Uub2NhbWwnLFxuXSk7XG5jb25zdCBFWFRFTlNJT05TID0gbmV3IFNldChbXG4gICdtbCcsXG4gICdtbGknLFxuXSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwcmlvcml0eTogMjAsXG4gIHByb3ZpZGVyTmFtZTogJ251Y2xpZGUtb2NhbWwnLFxuICBhc3luYyBnZXRTdWdnZXN0aW9uRm9yV29yZChcbiAgICB0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIHJhbmdlOiBhdG9tJFJhbmdlXG4gICk6IFByb21pc2U8P0h5cGVyY2xpY2tTdWdnZXN0aW9uPiB7XG4gICAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vY2xpZW50Jyk7XG5cbiAgICBpZiAoIUdSQU1NQVJTLmhhcyh0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG5cbiAgICBpZiAoZmlsZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQga2luZCA9ICdtbCc7XG4gICAgY29uc3QgZXh0ZW5zaW9uID0gcmVxdWlyZSgncGF0aCcpLmV4dG5hbWUoZmlsZSk7XG4gICAgaWYgKEVYVEVOU0lPTlMuaGFzKGV4dGVuc2lvbikpIHtcbiAgICAgIGtpbmQgPSBleHRlbnNpb247XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFuY2UgPSBhd2FpdCBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdNZXJsaW5TZXJ2aWNlJywgZmlsZSk7XG4gICAgaW52YXJpYW50KGluc3RhbmNlKTtcbiAgICBjb25zdCBzdGFydCA9IHJhbmdlLnN0YXJ0O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJhbmdlLFxuICAgICAgY2FsbGJhY2s6IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBhd2FpdCBpbnN0YW5jZS5wdXNoTmV3QnVmZmVyKGZpbGUsIHRleHRFZGl0b3IuZ2V0VGV4dCgpKTtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBpbnN0YW5jZS5sb2NhdGUoXG4gICAgICAgICAgZmlsZSxcbiAgICAgICAgICBzdGFydC5yb3csXG4gICAgICAgICAgc3RhcnQuY29sdW1uLFxuICAgICAgICAgIGtpbmQpO1xuICAgICAgICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge2dvVG9Mb2NhdGlvbn0gPSByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKTtcbiAgICAgICAgZ29Ub0xvY2F0aW9uKGxvY2F0aW9uLmZpbGUsIGxvY2F0aW9uLnBvcy5saW5lIC0gMSwgbG9jYXRpb24ucG9zLmNvbCk7XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19