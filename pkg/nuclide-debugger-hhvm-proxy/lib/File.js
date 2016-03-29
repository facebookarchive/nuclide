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
        source = (yield require('../../nuclide-commons').readFile(this._path, 'utf8')).toString();
        this._source = source;
      }
      return source;
    })
  }]);

  return File;
})();

module.exports = File;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBY00sSUFBSTtBQUlHLFdBSlAsSUFBSSxDQUlJLElBQVksRUFBRTswQkFKdEIsSUFBSTs7QUFLTixRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztHQUNyQjs7ZUFQRyxJQUFJOzs2QkFTTyxhQUFvQjtBQUNqQyxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzFCLFVBQUksTUFBTSxLQUFLLElBQUksRUFBRTtBQUNuQixjQUFNLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBLENBQUUsUUFBUSxFQUFFLENBQUM7QUFDMUYsWUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7T0FDdkI7QUFDRCxhQUFPLE1BQU0sQ0FBQztLQUNmOzs7U0FoQkcsSUFBSTs7O0FBb0JWLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDIiwiZmlsZSI6IkZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIEEgZmlsZSBpbiB0aGUgZmlsZSBjYWNoZS5cbiAqL1xuY2xhc3MgRmlsZSB7XG4gIF9wYXRoOiBzdHJpbmc7XG4gIF9zb3VyY2U6ID9zdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fcGF0aCA9IHBhdGg7XG4gICAgdGhpcy5fc291cmNlID0gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIGdldFNvdXJjZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBzb3VyY2UgPSB0aGlzLl9zb3VyY2U7XG4gICAgaWYgKHNvdXJjZSA9PT0gbnVsbCkge1xuICAgICAgc291cmNlID0gKGF3YWl0IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpLnJlYWRGaWxlKHRoaXMuX3BhdGgsICd1dGY4JykpLnRvU3RyaW5nKCk7XG4gICAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGU7XG4iXX0=