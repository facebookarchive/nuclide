function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constants = require('./constants');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideCommons = require('../../nuclide-commons');

var _atom = require('atom');

var _nuclideClient = require('../../nuclide-client');

module.exports = {
  name: 'nuclide-ocaml',
  grammarScopes: _nuclideCommons.array.from(_constants.GRAMMARS),
  scope: 'file',
  lintOnFly: false,

  lint: function lint(textEditor) {
    return (0, _nuclideAnalytics.trackOperationTiming)('nuclide-ocaml.lint', _asyncToGenerator(function* () {
      var filePath = textEditor.getPath();
      if (filePath == null) {
        return [];
      }

      var instance = (0, _nuclideClient.getServiceByNuclideUri)('MerlinService', filePath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxpbnRlclByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7eUJBY3VCLGFBQWE7O2dDQUNELHlCQUF5Qjs7OEJBQ3hDLHVCQUF1Qjs7b0JBQ3ZCLE1BQU07OzZCQUNXLHNCQUFzQjs7QUFFM0QsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLE1BQUksRUFBRSxlQUFlO0FBQ3JCLGVBQWEsRUFBRSxzQkFBTSxJQUFJLHFCQUFVO0FBQ25DLE9BQUssRUFBRSxNQUFNO0FBQ2IsV0FBUyxFQUFFLEtBQUs7O0FBRWhCLE1BQUksRUFBQSxjQUFDLFVBQTJCLEVBQWlDO0FBQy9ELFdBQU8sNENBQXFCLG9CQUFvQixvQkFBRSxhQUFZO0FBQzVELFVBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxFQUFFLENBQUM7T0FDWDs7QUFFRCxVQUFNLFFBQVEsR0FBRywyQ0FBdUIsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ25FLFVBQUksUUFBUSxJQUFJLElBQUksRUFBRTtBQUNwQixlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0QsWUFBTSxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUM3RCxVQUFNLFdBQVcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEQsVUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO0FBQ3ZCLGVBQU8sRUFBRSxDQUFDO09BQ1g7QUFDRCxhQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxVQUFVLEVBQWlDO0FBQ2pFLGVBQU87QUFDTCxjQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksS0FBSyxTQUFTLEdBQUcsU0FBUyxHQUFHLE9BQU87QUFDekQsa0JBQVEsRUFBUixRQUFRO0FBQ1IsY0FBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPO0FBQ3hCLGVBQUssRUFBRSxnQkFDTCxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNqRCxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUM5QztTQUNGLENBQUM7T0FDSCxDQUFDLENBQUM7S0FDSixFQUFDLENBQUM7R0FDSjtDQUNGLENBQUMiLCJmaWxlIjoiTGludGVyUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TWVybGluRXJyb3J9IGZyb20gJy4uLy4uL251Y2xpZGUtb2NhbWwtYmFzZSc7XG5pbXBvcnQgdHlwZSB7TGludGVyTWVzc2FnZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1iYXNlJztcblxuaW1wb3J0IHtHUkFNTUFSU30gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHt0cmFja09wZXJhdGlvblRpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuYW1lOiAnbnVjbGlkZS1vY2FtbCcsXG4gIGdyYW1tYXJTY29wZXM6IGFycmF5LmZyb20oR1JBTU1BUlMpLFxuICBzY29wZTogJ2ZpbGUnLFxuICBsaW50T25GbHk6IGZhbHNlLFxuXG4gIGxpbnQodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTxBcnJheTxMaW50ZXJNZXNzYWdlPj4ge1xuICAgIHJldHVybiB0cmFja09wZXJhdGlvblRpbWluZygnbnVjbGlkZS1vY2FtbC5saW50JywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmIChmaWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW5zdGFuY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdNZXJsaW5TZXJ2aWNlJywgZmlsZVBhdGgpO1xuICAgICAgaWYgKGluc3RhbmNlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgYXdhaXQgaW5zdGFuY2UucHVzaE5ld0J1ZmZlcihmaWxlUGF0aCwgdGV4dEVkaXRvci5nZXRUZXh0KCkpO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSBhd2FpdCBpbnN0YW5jZS5lcnJvcnMoZmlsZVBhdGgpO1xuICAgICAgaWYgKGRpYWdub3N0aWNzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRpYWdub3N0aWNzLm1hcCgoZGlhZ25vc3RpYzogTWVybGluRXJyb3IpOiBMaW50ZXJNZXNzYWdlID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBkaWFnbm9zdGljLnR5cGUgPT09ICd3YXJuaW5nJyA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgdGV4dDogZGlhZ25vc3RpYy5tZXNzYWdlLFxuICAgICAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoXG4gICAgICAgICAgICBbZGlhZ25vc3RpYy5zdGFydC5saW5lIC0gMSwgZGlhZ25vc3RpYy5zdGFydC5jb2xdLFxuICAgICAgICAgICAgW2RpYWdub3N0aWMuZW5kLmxpbmUgLSAxLCBkaWFnbm9zdGljLmVuZC5jb2xdLFxuICAgICAgICAgICksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbn07XG4iXX0=