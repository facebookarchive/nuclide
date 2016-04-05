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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideClient = require('../../nuclide-client');

// Ignore typehints that span too many lines. These tend to be super spammy.
var MAX_LINES = 10;

// Complex types can end up being super long. Truncate them.
// TODO(hansonw): we could parse these into hint trees
var MAX_LENGTH = 100;

var TypeHintProvider = (function () {
  function TypeHintProvider() {
    _classCallCheck(this, TypeHintProvider);
  }

  _createDecoratedClass(TypeHintProvider, [{
    key: 'typeHint',
    decorators: [(0, _nuclideAnalytics.trackTiming)('nuclide-ocaml.typeHint')],
    value: _asyncToGenerator(function* (editor, position) {
      var path = editor.getPath();
      if (path == null) {
        return null;
      }
      var instance = (0, _nuclideClient.getServiceByNuclideUri)('MerlinService', path);
      if (instance == null) {
        return null;
      }
      yield instance.pushNewBuffer(path, editor.getText());
      var types = yield instance.enclosingType(path, position.row, position.column);
      if (types == null || types.length === 0) {
        return null;
      }
      var type = types[0];
      if (type.end.line - type.start.line > MAX_LINES) {
        return null;
      }
      var hint = type.type;
      if (hint.length > MAX_LENGTH) {
        hint = hint.substr(0, MAX_LENGTH) + '...';
      }
      return {
        hint: hint,
        range: new _atom.Range(new _atom.Point(type.start.line - 1, type.start.col), new _atom.Point(type.end.line - 1, type.end.col))
      };
    })
  }]);

  return TypeHintProvider;
})();

exports.TypeHintProvider = TypeHintProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVIaW50UHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWMyQixNQUFNOztnQ0FDUCx5QkFBeUI7OzZCQUNkLHNCQUFzQjs7O0FBRzNELElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQzs7OztBQUlyQixJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7O0lBRVYsZ0JBQWdCO1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzs7d0JBQWhCLGdCQUFnQjs7aUJBRTFCLG1DQUFZLHdCQUF3QixDQUFDOzZCQUN4QixXQUFDLE1BQXVCLEVBQUUsUUFBb0IsRUFBc0I7QUFDaEYsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFVBQUksSUFBSSxJQUFJLElBQUksRUFBRTtBQUNoQixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBTSxRQUFRLEdBQUcsMkNBQXVCLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvRCxVQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDcEIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFlBQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDckQsVUFBTSxLQUFLLEdBQUcsTUFBTSxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRixVQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdkMsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQU0sSUFBZ0IsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsVUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxTQUFTLEVBQUU7QUFDL0MsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDckIsVUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsRUFBRTtBQUM1QixZQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLEdBQUcsS0FBSyxDQUFDO09BQzNDO0FBQ0QsYUFBTztBQUNMLFlBQUksRUFBSixJQUFJO0FBQ0osYUFBSyxFQUFFLGdCQUNMLGdCQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUM5QyxnQkFBVSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FDM0M7T0FDRixDQUFDO0tBQ0g7OztTQWhDVSxnQkFBZ0IiLCJmaWxlIjoiVHlwZUhpbnRQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUeXBlSGludH0gZnJvbSAnLi4vLi4vbnVjbGlkZS10eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7TWVybGluVHlwZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1vY2FtbC1iYXNlJztcblxuaW1wb3J0IHtQb2ludCwgUmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5cbi8vIElnbm9yZSB0eXBlaGludHMgdGhhdCBzcGFuIHRvbyBtYW55IGxpbmVzLiBUaGVzZSB0ZW5kIHRvIGJlIHN1cGVyIHNwYW1teS5cbmNvbnN0IE1BWF9MSU5FUyA9IDEwO1xuXG4vLyBDb21wbGV4IHR5cGVzIGNhbiBlbmQgdXAgYmVpbmcgc3VwZXIgbG9uZy4gVHJ1bmNhdGUgdGhlbS5cbi8vIFRPRE8oaGFuc29udyk6IHdlIGNvdWxkIHBhcnNlIHRoZXNlIGludG8gaGludCB0cmVlc1xuY29uc3QgTUFYX0xFTkdUSCA9IDEwMDtcblxuZXhwb3J0IGNsYXNzIFR5cGVIaW50UHJvdmlkZXIge1xuXG4gIEB0cmFja1RpbWluZygnbnVjbGlkZS1vY2FtbC50eXBlSGludCcpXG4gIGFzeW5jIHR5cGVIaW50KGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2U8P1R5cGVIaW50PiB7XG4gICAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGluc3RhbmNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTWVybGluU2VydmljZScsIHBhdGgpO1xuICAgIGlmIChpbnN0YW5jZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgYXdhaXQgaW5zdGFuY2UucHVzaE5ld0J1ZmZlcihwYXRoLCBlZGl0b3IuZ2V0VGV4dCgpKTtcbiAgICBjb25zdCB0eXBlcyA9IGF3YWl0IGluc3RhbmNlLmVuY2xvc2luZ1R5cGUocGF0aCwgcG9zaXRpb24ucm93LCBwb3NpdGlvbi5jb2x1bW4pO1xuICAgIGlmICh0eXBlcyA9PSBudWxsIHx8IHR5cGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHR5cGU6IE1lcmxpblR5cGUgPSB0eXBlc1swXTtcbiAgICBpZiAodHlwZS5lbmQubGluZSAtIHR5cGUuc3RhcnQubGluZSA+IE1BWF9MSU5FUykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBoaW50ID0gdHlwZS50eXBlO1xuICAgIGlmIChoaW50Lmxlbmd0aCA+IE1BWF9MRU5HVEgpIHtcbiAgICAgIGhpbnQgPSBoaW50LnN1YnN0cigwLCBNQVhfTEVOR1RIKSArICcuLi4nO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgaGludCxcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoXG4gICAgICAgIG5ldyBQb2ludCh0eXBlLnN0YXJ0LmxpbmUgLSAxLCB0eXBlLnN0YXJ0LmNvbCksXG4gICAgICAgIG5ldyBQb2ludCh0eXBlLmVuZC5saW5lIC0gMSwgdHlwZS5lbmQuY29sKSxcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=