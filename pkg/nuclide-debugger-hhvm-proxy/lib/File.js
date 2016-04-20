var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

/**
 * A file in the file cache.
 */

var File = (function () {
  function File(path) {
    _classCallCheck(this, File);

    this._path = path;
    this._source = null;
  }

  _createClass(File, [{
    key: 'getSource',
    value: _asyncToGenerator(function* () {
      var source = this._source;
      if (source === null) {
        source = (yield _nuclideCommons.fsPromise.readFile(this._path, 'utf8')).toString();
        this._source = source;
      }
      return source;
    })
  }]);

  return File;
})();

module.exports = File;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OEJBV3dCLHVCQUF1Qjs7Ozs7O0lBS3pDLElBQUk7QUFJRyxXQUpQLElBQUksQ0FJSSxJQUFZLEVBQUU7MEJBSnRCLElBQUk7O0FBS04sUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7R0FDckI7O2VBUEcsSUFBSTs7NkJBU08sYUFBb0I7QUFDakMsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMxQixVQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7QUFDbkIsY0FBTSxHQUFHLENBQUMsTUFBTSwwQkFBVSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQSxDQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ25FLFlBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO09BQ3ZCO0FBQ0QsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1NBaEJHLElBQUk7OztBQW9CVixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJGaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtmc1Byb21pc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbi8qKlxuICogQSBmaWxlIGluIHRoZSBmaWxlIGNhY2hlLlxuICovXG5jbGFzcyBGaWxlIHtcbiAgX3BhdGg6IHN0cmluZztcbiAgX3NvdXJjZTogP3N0cmluZztcblxuICBjb25zdHJ1Y3RvcihwYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9wYXRoID0gcGF0aDtcbiAgICB0aGlzLl9zb3VyY2UgPSBudWxsO1xuICB9XG5cbiAgYXN5bmMgZ2V0U291cmNlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IHNvdXJjZSA9IHRoaXMuX3NvdXJjZTtcbiAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICBzb3VyY2UgPSAoYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKHRoaXMuX3BhdGgsICd1dGY4JykpLnRvU3RyaW5nKCk7XG4gICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGU7XG4iXX0=