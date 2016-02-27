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
        source = (yield require('../../commons').readFile(this._path, 'utf8')).toString();
        this._source = source;
      }
      return source;
    })
  }]);

  return File;
})();

module.exports = File;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBY00sSUFBSTtBQUlHLFdBSlAsSUFBSSxDQUlJLElBQVksRUFBRTswQkFKdEIsSUFBSTs7QUFLTixRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztHQUNyQjs7ZUFQRyxJQUFJOzs2QkFTTyxhQUFvQjtBQUNqQyxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzFCLFVBQUksTUFBTSxLQUFLLElBQUksRUFBRTtBQUNuQixjQUFNLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQSxDQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ2xGLFlBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO09BQ3ZCO0FBQ0QsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1NBaEJHLElBQUk7OztBQW9CVixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJGaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyoqXG4gKiBBIGZpbGUgaW4gdGhlIGZpbGUgY2FjaGUuXG4gKi9cbmNsYXNzIEZpbGUge1xuICBfcGF0aDogc3RyaW5nO1xuICBfc291cmNlOiA/c3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgIHRoaXMuX3NvdXJjZSA9IG51bGw7XG4gIH1cblxuICBhc3luYyBnZXRTb3VyY2UoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgc291cmNlID0gdGhpcy5fc291cmNlO1xuICAgIGlmIChzb3VyY2UgPT09IG51bGwpIHtcbiAgICAgIHNvdXJjZSA9IChhd2FpdCByZXF1aXJlKCcuLi8uLi9jb21tb25zJykucmVhZEZpbGUodGhpcy5fcGF0aCwgJ3V0ZjgnKSkudG9TdHJpbmcoKTtcbiAgICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZTtcbiJdfQ==