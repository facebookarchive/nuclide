function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

module.exports = Object.defineProperties({

  isBuckFile: function isBuckFile(filePath) {
    // TODO(mbolin): Buck does have an option where the user can customize the
    // name of the build file: https://github.com/facebook/buck/issues/238.
    // This function will not work for those who use that option.
    return _path2['default'].basename(filePath) === 'BUCK';
  }
}, {
  BuckProject: {
    get: function get() {
      return require('./BuckProject');
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFXaUIsTUFBTTs7OztBQUV2QixNQUFNLENBQUMsT0FBTywyQkFBRzs7QUFLZixZQUFVLEVBQUUsb0JBQVMsUUFBZ0IsRUFBVzs7OztBQUk5QyxXQUFPLGtCQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLENBQUM7R0FDM0M7Q0FDRjtBQVZLLGFBQVc7U0FBQSxlQUFHO0FBQ2hCLGFBQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ2pDOzs7O0VBUUYsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgQnVja1Byb2plY3QoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4vQnVja1Byb2plY3QnKTtcbiAgfSxcblxuICBpc0J1Y2tGaWxlOiBmdW5jdGlvbihmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gVE9ETyhtYm9saW4pOiBCdWNrIGRvZXMgaGF2ZSBhbiBvcHRpb24gd2hlcmUgdGhlIHVzZXIgY2FuIGN1c3RvbWl6ZSB0aGVcbiAgICAvLyBuYW1lIG9mIHRoZSBidWlsZCBmaWxlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svYnVjay9pc3N1ZXMvMjM4LlxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBub3Qgd29yayBmb3IgdGhvc2Ugd2hvIHVzZSB0aGF0IG9wdGlvbi5cbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZShmaWxlUGF0aCkgPT09ICdCVUNLJztcbiAgfSxcbn07XG4iXX0=