

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = Object.defineProperties({

  isBuckFile: function isBuckFile(filePath) {
    // TODO(mbolin): Buck does have an option where the user can customize the
    // name of the build file: https://github.com/facebook/buck/issues/238.
    // This function will not work for those who use that option.
    return require('path').basename(filePath) === 'BUCK';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVdBLE1BQU0sQ0FBQyxPQUFPLDJCQUFHOztBQUtmLFlBQVUsRUFBRSxvQkFBUyxRQUFnQixFQUFXOzs7O0FBSTlDLFdBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxNQUFNLENBQUM7R0FDdEQ7Q0FDRjtBQVZLLGFBQVc7U0FBQSxlQUFHO0FBQ2hCLGFBQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ2pDOzs7O0VBUUYsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldCBCdWNrUHJvamVjdCgpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi9CdWNrUHJvamVjdCcpO1xuICB9LFxuXG4gIGlzQnVja0ZpbGU6IGZ1bmN0aW9uKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBUT0RPKG1ib2xpbik6IEJ1Y2sgZG9lcyBoYXZlIGFuIG9wdGlvbiB3aGVyZSB0aGUgdXNlciBjYW4gY3VzdG9taXplIHRoZVxuICAgIC8vIG5hbWUgb2YgdGhlIGJ1aWxkIGZpbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9idWNrL2lzc3Vlcy8yMzguXG4gICAgLy8gVGhpcyBmdW5jdGlvbiB3aWxsIG5vdCB3b3JrIGZvciB0aG9zZSB3aG8gdXNlIHRoYXQgb3B0aW9uLlxuICAgIHJldHVybiByZXF1aXJlKCdwYXRoJykuYmFzZW5hbWUoZmlsZVBhdGgpID09PSAnQlVDSyc7XG4gIH0sXG59O1xuIl19