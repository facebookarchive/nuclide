Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = observableFromSubscribeFunction;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function observableFromSubscribeFunction(fn) {
  return new _rx2['default'].Observable.create(function (observer) {
    return fn(function () {
      return observer.onNext.apply(observer, arguments);
    });
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O3FCQWdCd0IsK0JBQStCOzs7Ozs7Ozs7Ozs7a0JBTHhDLElBQUk7Ozs7QUFLSixTQUFTLCtCQUErQixDQUFDLEVBQXFCLEVBQWlCO0FBQzVGLFNBQU8sSUFBSSxnQkFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUEsUUFBUTtXQUFJLEVBQUUsQ0FBQzthQUFhLFFBQVEsQ0FBQyxNQUFNLE1BQUEsQ0FBZixRQUFRLFlBQWdCO0tBQUEsQ0FBQztHQUFBLENBQUMsQ0FBQztDQUN4RiIsImZpbGUiOiJvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxudHlwZSBTdWJzY3JpYmVDYWxsYmFjayA9ICguLi5hcmdzOiBBcnJheTxtaXhlZD4pID0+IG1peGVkO1xudHlwZSBTdWJzY3JpYmVGdW5jdGlvbiA9IChjYWxsYmFjazogU3Vic2NyaWJlQ2FsbGJhY2spID0+IGF0b20kSURpc3Bvc2FibGU7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oZm46IFN1YnNjcmliZUZ1bmN0aW9uKTogUnguT2JzZXJ2YWJsZSB7XG4gIHJldHVybiBuZXcgUnguT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4gZm4oKC4uLmFyZ3MpID0+IG9ic2VydmVyLm9uTmV4dCguLi5hcmdzKSkpO1xufVxuIl19