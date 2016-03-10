var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _helpers = require('./helpers');

var _ClientCallback = require('./ClientCallback');

var _File = require('./File');

var _File2 = _interopRequireDefault(_File);

/**
 * Handles registering files encountered during debugging with the Chrome debugger
 */

var FileCache = (function () {
  function FileCache(callback) {
    _classCallCheck(this, FileCache);

    this._callback = callback;
    this._files = new Map();
  }

  _createClass(FileCache, [{
    key: 'registerFile',
    value: function registerFile(fileUrl) {
      var filepath = (0, _helpers.uriToPath)(fileUrl);
      if (!this._files.has(filepath)) {
        this._files.set(filepath, new _File2['default'](filepath));
        this._callback.sendMethod(this._callback.getServerMessageObservable(), 'Debugger.scriptParsed', {
          'scriptId': filepath,
          'url': fileUrl,
          'startLine': 0,
          'startColumn': 0,
          'endLine': 0,
          'endColumn': 0
        });
      }
      var result = this._files.get(filepath);
      (0, _assert2['default'])(result != null);
      return result;
    }
  }, {
    key: 'getFileSource',
    value: function getFileSource(filepath) {
      return this.registerFile(filepath).getSource();
    }
  }]);

  return FileCache;
})();

module.exports = FileCache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVDYWNoZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7Ozt1QkFFTixXQUFXOzs4QkFDTixrQkFBa0I7O29CQUM5QixRQUFROzs7Ozs7OztJQUtuQixTQUFTO0FBSUYsV0FKUCxTQUFTLENBSUQsUUFBd0IsRUFBRTswQkFKbEMsU0FBUzs7QUFLWCxRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUMxQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7R0FDekI7O2VBUEcsU0FBUzs7V0FTRCxzQkFBQyxPQUFlLEVBQVE7QUFDbEMsVUFBTSxRQUFRLEdBQUcsd0JBQVUsT0FBTyxDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzlCLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxzQkFBUyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQzlDLFlBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLDBCQUEwQixFQUFFLEVBQzNDLHVCQUF1QixFQUN2QjtBQUNFLG9CQUFVLEVBQUUsUUFBUTtBQUNwQixlQUFLLEVBQUUsT0FBTztBQUNkLHFCQUFXLEVBQUUsQ0FBQztBQUNkLHVCQUFhLEVBQUUsQ0FBQztBQUNoQixtQkFBUyxFQUFFLENBQUM7QUFDWixxQkFBVyxFQUFFLENBQUM7U0FDZixDQUFDLENBQUM7T0FDTjtBQUNELFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLCtCQUFVLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQztBQUMxQixhQUFPLE1BQU0sQ0FBQztLQUNmOzs7V0FFWSx1QkFBQyxRQUFnQixFQUFtQjtBQUMvQyxhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDaEQ7OztTQWhDRyxTQUFTOzs7QUFtQ2YsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoiRmlsZUNhY2hlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge3VyaVRvUGF0aH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7Q2xpZW50Q2FsbGJhY2t9IGZyb20gJy4vQ2xpZW50Q2FsbGJhY2snO1xuaW1wb3J0IEZpbGUgZnJvbSAnLi9GaWxlJztcblxuLyoqXG4gKiBIYW5kbGVzIHJlZ2lzdGVyaW5nIGZpbGVzIGVuY291bnRlcmVkIGR1cmluZyBkZWJ1Z2dpbmcgd2l0aCB0aGUgQ2hyb21lIGRlYnVnZ2VyXG4gKi9cbmNsYXNzIEZpbGVDYWNoZSB7XG4gIF9jYWxsYmFjazogQ2xpZW50Q2FsbGJhY2s7XG4gIF9maWxlczogTWFwPHN0cmluZywgRmlsZT47XG5cbiAgY29uc3RydWN0b3IoY2FsbGJhY2s6IENsaWVudENhbGxiYWNrKSB7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLl9maWxlcyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRmlsZShmaWxlVXJsOiBzdHJpbmcpOiBGaWxlIHtcbiAgICBjb25zdCBmaWxlcGF0aCA9IHVyaVRvUGF0aChmaWxlVXJsKTtcbiAgICBpZiAoIXRoaXMuX2ZpbGVzLmhhcyhmaWxlcGF0aCkpIHtcbiAgICAgIHRoaXMuX2ZpbGVzLnNldChmaWxlcGF0aCwgbmV3IEZpbGUoZmlsZXBhdGgpKTtcbiAgICAgIHRoaXMuX2NhbGxiYWNrLnNlbmRNZXRob2QoXG4gICAgICAgIHRoaXMuX2NhbGxiYWNrLmdldFNlcnZlck1lc3NhZ2VPYnNlcnZhYmxlKCksXG4gICAgICAgICdEZWJ1Z2dlci5zY3JpcHRQYXJzZWQnLFxuICAgICAgICB7XG4gICAgICAgICAgJ3NjcmlwdElkJzogZmlsZXBhdGgsXG4gICAgICAgICAgJ3VybCc6IGZpbGVVcmwsXG4gICAgICAgICAgJ3N0YXJ0TGluZSc6IDAsXG4gICAgICAgICAgJ3N0YXJ0Q29sdW1uJzogMCxcbiAgICAgICAgICAnZW5kTGluZSc6IDAsXG4gICAgICAgICAgJ2VuZENvbHVtbic6IDAsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9maWxlcy5nZXQoZmlsZXBhdGgpO1xuICAgIGludmFyaWFudChyZXN1bHQgIT0gbnVsbCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldEZpbGVTb3VyY2UoZmlsZXBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJGaWxlKGZpbGVwYXRoKS5nZXRTb3VyY2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVDYWNoZTtcbiJdfQ==