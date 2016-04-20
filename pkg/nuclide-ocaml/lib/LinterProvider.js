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

var _atom = require('atom');

var _nuclideClient = require('../../nuclide-client');

module.exports = {
  name: 'nuclide-ocaml',
  grammarScopes: Array.from(_constants.GRAMMARS),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxpbnRlclByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7eUJBY3VCLGFBQWE7O2dDQUNELHlCQUF5Qjs7b0JBQ3hDLE1BQU07OzZCQUNXLHNCQUFzQjs7QUFFM0QsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLE1BQUksRUFBRSxlQUFlO0FBQ3JCLGVBQWEsRUFBRSxLQUFLLENBQUMsSUFBSSxxQkFBVTtBQUNuQyxPQUFLLEVBQUUsTUFBTTtBQUNiLFdBQVMsRUFBRSxLQUFLOztBQUVoQixNQUFJLEVBQUEsY0FBQyxVQUEyQixFQUFpQztBQUMvRCxXQUFPLDRDQUFxQixvQkFBb0Isb0JBQUUsYUFBWTtBQUM1RCxVQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdEMsVUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLGVBQU8sRUFBRSxDQUFDO09BQ1g7O0FBRUQsVUFBTSxRQUFRLEdBQUcsMkNBQXVCLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuRSxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxFQUFFLENBQUM7T0FDWDtBQUNELFlBQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDN0QsVUFBTSxXQUFXLEdBQUcsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BELFVBQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0QsYUFBTyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUMsVUFBVSxFQUFpQztBQUNqRSxlQUFPO0FBQ0wsY0FBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHLFNBQVMsR0FBRyxPQUFPO0FBQ3pELGtCQUFRLEVBQVIsUUFBUTtBQUNSLGNBQUksRUFBRSxVQUFVLENBQUMsT0FBTztBQUN4QixlQUFLLEVBQUUsZ0JBQ0wsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDakQsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FDOUM7U0FDRixDQUFDO09BQ0gsQ0FBQyxDQUFDO0tBQ0osRUFBQyxDQUFDO0dBQ0o7Q0FDRixDQUFDIiwiZmlsZSI6IkxpbnRlclByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge01lcmxpbkVycm9yfSBmcm9tICcuLi8uLi9udWNsaWRlLW9jYW1sLWJhc2UnO1xuaW1wb3J0IHR5cGUge0xpbnRlck1lc3NhZ2V9IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtYmFzZSc7XG5cbmltcG9ydCB7R1JBTU1BUlN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7dHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuYW1lOiAnbnVjbGlkZS1vY2FtbCcsXG4gIGdyYW1tYXJTY29wZXM6IEFycmF5LmZyb20oR1JBTU1BUlMpLFxuICBzY29wZTogJ2ZpbGUnLFxuICBsaW50T25GbHk6IGZhbHNlLFxuXG4gIGxpbnQodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTxBcnJheTxMaW50ZXJNZXNzYWdlPj4ge1xuICAgIHJldHVybiB0cmFja09wZXJhdGlvblRpbWluZygnbnVjbGlkZS1vY2FtbC5saW50JywgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmIChmaWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW5zdGFuY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdNZXJsaW5TZXJ2aWNlJywgZmlsZVBhdGgpO1xuICAgICAgaWYgKGluc3RhbmNlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgYXdhaXQgaW5zdGFuY2UucHVzaE5ld0J1ZmZlcihmaWxlUGF0aCwgdGV4dEVkaXRvci5nZXRUZXh0KCkpO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3MgPSBhd2FpdCBpbnN0YW5jZS5lcnJvcnMoZmlsZVBhdGgpO1xuICAgICAgaWYgKGRpYWdub3N0aWNzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRpYWdub3N0aWNzLm1hcCgoZGlhZ25vc3RpYzogTWVybGluRXJyb3IpOiBMaW50ZXJNZXNzYWdlID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBkaWFnbm9zdGljLnR5cGUgPT09ICd3YXJuaW5nJyA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgdGV4dDogZGlhZ25vc3RpYy5tZXNzYWdlLFxuICAgICAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoXG4gICAgICAgICAgICBbZGlhZ25vc3RpYy5zdGFydC5saW5lIC0gMSwgZGlhZ25vc3RpYy5zdGFydC5jb2xdLFxuICAgICAgICAgICAgW2RpYWdub3N0aWMuZW5kLmxpbmUgLSAxLCBkaWFnbm9zdGljLmVuZC5jb2xdLFxuICAgICAgICAgICksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbn07XG4iXX0=