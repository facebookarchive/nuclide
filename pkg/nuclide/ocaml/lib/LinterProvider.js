function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constants = require('./constants');

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _atom = require('atom');

var _client = require('../../client');

module.exports = {
  name: 'nuclide-ocaml',
  grammarScopes: _commons.array.from(_constants.GRAMMARS),
  scope: 'file',
  lintOnFly: false,

  lint: function lint(textEditor) {
    return (0, _analytics.trackOperationTiming)('nuclide-ocaml.lint', _asyncToGenerator(function* () {
      var filePath = textEditor.getPath();
      if (filePath == null) {
        return [];
      }

      var instance = (0, _client.getServiceByNuclideUri)('MerlinService', filePath);
      if (instance == null) {
        return [];
      }
      yield instance.pushNewBuffer(filePath, textEditor.getText());
      var diagnostics = yield instance.errors(filePath);
      if (diagnostics == null) {
        return [];
      }
      return diagnostics.map(function (diagnostic) {
        return {
          type: diagnostic.type === 'warning' ? 'Warning' : 'Error',
          filePath: filePath,
          text: diagnostic.message,
          range: new _atom.Range([diagnostic.start.line - 1, diagnostic.start.col], [diagnostic.end.line - 1, diagnostic.end.col])
        };
      });
    }));
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxpbnRlclByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7eUJBY3VCLGFBQWE7O3lCQUNELGlCQUFpQjs7dUJBQ2hDLGVBQWU7O29CQUNmLE1BQU07O3NCQUNXLGNBQWM7O0FBRW5ELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixNQUFJLEVBQUUsZUFBZTtBQUNyQixlQUFhLEVBQUUsZUFBTSxJQUFJLHFCQUFVO0FBQ25DLE9BQUssRUFBRSxNQUFNO0FBQ2IsV0FBUyxFQUFFLEtBQUs7O0FBRWhCLE1BQUksRUFBQSxjQUFDLFVBQTJCLEVBQWlDO0FBQy9ELFdBQU8scUNBQXFCLG9CQUFvQixvQkFBRSxhQUFZO0FBQzVELFVBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxFQUFFLENBQUM7T0FDWDs7QUFFRCxVQUFNLFFBQVEsR0FBRyxvQ0FBdUIsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25FLFVBQUksUUFBUSxJQUFJLElBQUksRUFBRTtBQUNwQixlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0QsWUFBTSxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUM3RCxVQUFNLFdBQVcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEQsVUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO0FBQ3ZCLGVBQU8sRUFBRSxDQUFDO09BQ1g7QUFDRCxhQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxVQUFVLEVBQWlDO0FBQ2pFLGVBQU87QUFDTCxjQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksS0FBSyxTQUFTLEdBQUcsU0FBUyxHQUFHLE9BQU87QUFDekQsa0JBQVEsRUFBUixRQUFRO0FBQ1IsY0FBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPO0FBQ3hCLGVBQUssRUFBRSxnQkFDTCxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNqRCxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUM5QztTQUNGLENBQUM7T0FDSCxDQUFDLENBQUM7S0FDSixFQUFDLENBQUM7R0FDSjtDQUNGLENBQUMiLCJmaWxlIjoiTGludGVyUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TWVybGluRXJyb3J9IGZyb20gJy4uLy4uL29jYW1sLWJhc2UnO1xuaW1wb3J0IHR5cGUge0xpbnRlck1lc3NhZ2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL2Jhc2UnO1xuXG5pbXBvcnQge0dSQU1NQVJTfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge3RyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vY2xpZW50JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWU6ICdudWNsaWRlLW9jYW1sJyxcbiAgZ3JhbW1hclNjb3BlczogYXJyYXkuZnJvbShHUkFNTUFSUyksXG4gIHNjb3BlOiAnZmlsZScsXG4gIGxpbnRPbkZseTogZmFsc2UsXG5cbiAgbGludCh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPEFycmF5PExpbnRlck1lc3NhZ2U+PiB7XG4gICAgcmV0dXJuIHRyYWNrT3BlcmF0aW9uVGltaW5nKCdudWNsaWRlLW9jYW1sLmxpbnQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgaWYgKGZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbnN0YW5jZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ01lcmxpblNlcnZpY2UnLCBmaWxlUGF0aCk7XG4gICAgICBpZiAoaW5zdGFuY2UgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICBhd2FpdCBpbnN0YW5jZS5wdXNoTmV3QnVmZmVyKGZpbGVQYXRoLCB0ZXh0RWRpdG9yLmdldFRleHQoKSk7XG4gICAgICBjb25zdCBkaWFnbm9zdGljcyA9IGF3YWl0IGluc3RhbmNlLmVycm9ycyhmaWxlUGF0aCk7XG4gICAgICBpZiAoZGlhZ25vc3RpY3MgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICByZXR1cm4gZGlhZ25vc3RpY3MubWFwKChkaWFnbm9zdGljOiBNZXJsaW5FcnJvcik6IExpbnRlck1lc3NhZ2UgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IGRpYWdub3N0aWMudHlwZSA9PT0gJ3dhcm5pbmcnID8gJ1dhcm5pbmcnIDogJ0Vycm9yJyxcbiAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICB0ZXh0OiBkaWFnbm9zdGljLm1lc3NhZ2UsXG4gICAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZShcbiAgICAgICAgICAgIFtkaWFnbm9zdGljLnN0YXJ0LmxpbmUgLSAxLCBkaWFnbm9zdGljLnN0YXJ0LmNvbF0sXG4gICAgICAgICAgICBbZGlhZ25vc3RpYy5lbmQubGluZSAtIDEsIGRpYWdub3N0aWMuZW5kLmNvbF0sXG4gICAgICAgICAgKSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxufTtcbiJdfQ==