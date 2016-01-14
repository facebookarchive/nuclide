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
        this._callback.sendMethod('Debugger.scriptParsed', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVDYWNoZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7Ozt1QkFFTixXQUFXOzs4QkFDTixrQkFBa0I7O29CQUM5QixRQUFROzs7Ozs7OztJQUtuQixTQUFTO0FBSUYsV0FKUCxTQUFTLENBSUQsUUFBd0IsRUFBRTswQkFKbEMsU0FBUzs7QUFLWCxRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUMxQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7R0FDekI7O2VBUEcsU0FBUzs7V0FTRCxzQkFBQyxPQUFlLEVBQVE7QUFDbEMsVUFBTSxRQUFRLEdBQUcsd0JBQVUsT0FBTyxDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzlCLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxzQkFBUyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQzlDLFlBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUN2Qix1QkFBdUIsRUFDdkI7QUFDRSxvQkFBVSxFQUFFLFFBQVE7QUFDcEIsZUFBSyxFQUFFLE9BQU87QUFDZCxxQkFBVyxFQUFFLENBQUM7QUFDZCx1QkFBYSxFQUFFLENBQUM7QUFDaEIsbUJBQVMsRUFBRSxDQUFDO0FBQ1oscUJBQVcsRUFBRSxDQUFDO1NBQ2YsQ0FBQyxDQUFDO09BQ047QUFDRCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QywrQkFBVSxNQUFNLElBQUksSUFBSSxDQUFDLENBQUM7QUFDMUIsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1dBRVksdUJBQUMsUUFBZ0IsRUFBbUI7QUFDL0MsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ2hEOzs7U0EvQkcsU0FBUzs7O0FBa0NmLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDIiwiZmlsZSI6IkZpbGVDYWNoZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHt1cmlUb1BhdGh9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQge0NsaWVudENhbGxiYWNrfSBmcm9tICcuL0NsaWVudENhbGxiYWNrJztcbmltcG9ydCBGaWxlIGZyb20gJy4vRmlsZSc7XG5cbi8qKlxuICogSGFuZGxlcyByZWdpc3RlcmluZyBmaWxlcyBlbmNvdW50ZXJlZCBkdXJpbmcgZGVidWdnaW5nIHdpdGggdGhlIENocm9tZSBkZWJ1Z2dlclxuICovXG5jbGFzcyBGaWxlQ2FjaGUge1xuICBfY2FsbGJhY2s6IENsaWVudENhbGxiYWNrO1xuICBfZmlsZXM6IE1hcDxzdHJpbmcsIEZpbGU+O1xuXG4gIGNvbnN0cnVjdG9yKGNhbGxiYWNrOiBDbGllbnRDYWxsYmFjaykge1xuICAgIHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5fZmlsZXMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICByZWdpc3RlckZpbGUoZmlsZVVybDogc3RyaW5nKTogRmlsZSB7XG4gICAgY29uc3QgZmlsZXBhdGggPSB1cmlUb1BhdGgoZmlsZVVybCk7XG4gICAgaWYgKCF0aGlzLl9maWxlcy5oYXMoZmlsZXBhdGgpKSB7XG4gICAgICB0aGlzLl9maWxlcy5zZXQoZmlsZXBhdGgsIG5ldyBGaWxlKGZpbGVwYXRoKSk7XG4gICAgICB0aGlzLl9jYWxsYmFjay5zZW5kTWV0aG9kKFxuICAgICAgICAnRGVidWdnZXIuc2NyaXB0UGFyc2VkJyxcbiAgICAgICAge1xuICAgICAgICAgICdzY3JpcHRJZCc6IGZpbGVwYXRoLFxuICAgICAgICAgICd1cmwnOiBmaWxlVXJsLFxuICAgICAgICAgICdzdGFydExpbmUnOiAwLFxuICAgICAgICAgICdzdGFydENvbHVtbic6IDAsXG4gICAgICAgICAgJ2VuZExpbmUnOiAwLFxuICAgICAgICAgICdlbmRDb2x1bW4nOiAwLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZmlsZXMuZ2V0KGZpbGVwYXRoKTtcbiAgICBpbnZhcmlhbnQocmVzdWx0ICE9IG51bGwpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBnZXRGaWxlU291cmNlKGZpbGVwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyRmlsZShmaWxlcGF0aCkuZ2V0U291cmNlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlQ2FjaGU7XG4iXX0=