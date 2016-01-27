

module.exports = {
  /**
   * Call `callback` on every node in the subtree, including `rootNode`.
   */
  forEachCachedNode: function forEachCachedNode(rootNode, callback) {
    var stack = [rootNode];
    while (stack.length !== 0) {
      var _node = stack.pop();
      callback(_node);
      (_node.getCachedChildren() || []).forEach(function (childNode) {
        return stack.push(childNode);
      });
    }
  }
};

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyZWUtbm9kZS10cmF2ZXJzYWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBYUEsTUFBTSxDQUFDLE9BQU8sR0FBRzs7OztBQUlmLG1CQUFpQixFQUFBLDJCQUFDLFFBQXNCLEVBQUUsUUFBb0MsRUFBRTtBQUM5RSxRQUFNLEtBQUssR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pCLFdBQU8sS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDekIsVUFBTSxLQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLGNBQVEsQ0FBQyxLQUFJLENBQUMsQ0FBQztBQUNmLE9BQUMsS0FBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFBLENBQUUsT0FBTyxDQUFDLFVBQUMsU0FBUztlQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ2hGO0dBQ0Y7Q0FDRixDQUFDIiwiZmlsZSI6InRyZWUtbm9kZS10cmF2ZXJzYWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTGF6eVRyZWVOb2RlIGZyb20gJy4vTGF6eVRyZWVOb2RlJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qKlxuICAgKiBDYWxsIGBjYWxsYmFja2Agb24gZXZlcnkgbm9kZSBpbiB0aGUgc3VidHJlZSwgaW5jbHVkaW5nIGByb290Tm9kZWAuXG4gICAqL1xuICBmb3JFYWNoQ2FjaGVkTm9kZShyb290Tm9kZTogTGF6eVRyZWVOb2RlLCBjYWxsYmFjazogKG5vZGU6IExhenlUcmVlTm9kZSk9PnZvaWQpIHtcbiAgICBjb25zdCBzdGFjayA9IFtyb290Tm9kZV07XG4gICAgd2hpbGUgKHN0YWNrLmxlbmd0aCAhPT0gMCkge1xuICAgICAgY29uc3Qgbm9kZSA9IHN0YWNrLnBvcCgpO1xuICAgICAgY2FsbGJhY2sobm9kZSk7XG4gICAgICAobm9kZS5nZXRDYWNoZWRDaGlsZHJlbigpIHx8IFtdKS5mb3JFYWNoKChjaGlsZE5vZGUpID0+IHN0YWNrLnB1c2goY2hpbGROb2RlKSk7XG4gICAgfVxuICB9LFxufTtcbiJdfQ==