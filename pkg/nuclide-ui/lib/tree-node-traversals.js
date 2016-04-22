

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyZWUtbm9kZS10cmF2ZXJzYWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBYUEsTUFBTSxDQUFDLE9BQU8sR0FBRzs7OztBQUlmLG1CQUFpQixFQUFBLDJCQUFDLFFBQXNCLEVBQUUsUUFBb0MsRUFBRTtBQUM5RSxRQUFNLEtBQUssR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pCLFdBQU8sS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDekIsVUFBTSxLQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLGNBQVEsQ0FBQyxLQUFJLENBQUMsQ0FBQztBQUNmLE9BQUMsS0FBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFBLENBQUUsT0FBTyxDQUFDLFVBQUEsU0FBUztlQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQzlFO0dBQ0Y7Q0FDRixDQUFDIiwiZmlsZSI6InRyZWUtbm9kZS10cmF2ZXJzYWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xhenlUcmVlTm9kZX0gZnJvbSAnLi9MYXp5VHJlZU5vZGUnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLyoqXG4gICAqIENhbGwgYGNhbGxiYWNrYCBvbiBldmVyeSBub2RlIGluIHRoZSBzdWJ0cmVlLCBpbmNsdWRpbmcgYHJvb3ROb2RlYC5cbiAgICovXG4gIGZvckVhY2hDYWNoZWROb2RlKHJvb3ROb2RlOiBMYXp5VHJlZU5vZGUsIGNhbGxiYWNrOiAobm9kZTogTGF6eVRyZWVOb2RlKT0+dm9pZCkge1xuICAgIGNvbnN0IHN0YWNrID0gW3Jvb3ROb2RlXTtcbiAgICB3aGlsZSAoc3RhY2subGVuZ3RoICE9PSAwKSB7XG4gICAgICBjb25zdCBub2RlID0gc3RhY2sucG9wKCk7XG4gICAgICBjYWxsYmFjayhub2RlKTtcbiAgICAgIChub2RlLmdldENhY2hlZENoaWxkcmVuKCkgfHwgW10pLmZvckVhY2goY2hpbGROb2RlID0+IHN0YWNrLnB1c2goY2hpbGROb2RlKSk7XG4gICAgfVxuICB9LFxufTtcbiJdfQ==