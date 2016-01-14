

var NewLine = require('./NewLine');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getRootIdentifierInExpression = require('./getRootIdentifierInExpression');
var isGlobal = require('./isGlobal');
var jscs = require('jscodeshift');

var match = jscs.match;

var FirstNode = {
  /**
   * Gets the first node that it's safe to insert before on.
   *
   * Note: We never need to add a first node. If a first node doesn't exist
   * then there isn't ever code that would result in a require being changed.
   */
  get: function get(root) {
    var first = undefined;
    root.find(jscs.Node).filter(function (path) {
      return isGlobal(path);
    }).forEach(function (path) {
      if (!first && FirstNode.isValidFirstNode(path)) {
        first = path;
      }
    });
    return first;
  },

  /**
   * Filter to see if a node is a valid first node.
   */
  isValidFirstNode: function isValidFirstNode(path) {
    // A new line literal is okay.
    if (match(path, { expression: { value: NewLine.literal } })) {
      return true;
    }
    // Any other literal is not.
    if (match(path, { expression: { type: 'Literal' } })) {
      return false;
    }
    var firstObject = getRootIdentifierInExpression(path.node);
    if (firstObject && match(firstObject, { name: 'jest' })) {
      return false;
    }
    return true;
  }
};

module.exports = FirstNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpcnN0Tm9kZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQUVyQyxJQUFNLDZCQUE2QixHQUFHLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ2pGLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN2QyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7O0lBRTdCLEtBQUssR0FBSSxJQUFJLENBQWIsS0FBSzs7QUFFWixJQUFNLFNBQVMsR0FBRzs7Ozs7OztBQU9oQixLQUFHLEVBQUEsYUFBQyxJQUFnQixFQUFhO0FBQy9CLFFBQUksS0FBSyxZQUFBLENBQUM7QUFDVixRQUFJLENBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDZixNQUFNLENBQUMsVUFBQSxJQUFJO2FBQUksUUFBUSxDQUFDLElBQUksQ0FBQztLQUFBLENBQUMsQ0FDOUIsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ2YsVUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDOUMsYUFBSyxHQUFHLElBQUksQ0FBQztPQUNkO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsV0FBTyxLQUFLLENBQUM7R0FDZDs7Ozs7QUFLRCxrQkFBZ0IsRUFBQSwwQkFBQyxJQUFjLEVBQVc7O0FBRXhDLFFBQUksS0FBSyxDQUFDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxFQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFDLEVBQUMsQ0FBQyxFQUFFO0FBQ3ZELGFBQU8sSUFBSSxDQUFDO0tBQ2I7O0FBRUQsUUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBQyxFQUFDLENBQUMsRUFBRTtBQUNoRCxhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsUUFBTSxXQUFXLEdBQUcsNkJBQTZCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELFFBQUksV0FBVyxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFBRTtBQUNyRCxhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoiRmlyc3ROb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbGxlY3Rpb24sIE5vZGVQYXRofSBmcm9tICcuLi90eXBlcy9hc3QnO1xuXG5jb25zdCBOZXdMaW5lID0gcmVxdWlyZSgnLi9OZXdMaW5lJyk7XG5cbmNvbnN0IGdldFJvb3RJZGVudGlmaWVySW5FeHByZXNzaW9uID0gcmVxdWlyZSgnLi9nZXRSb290SWRlbnRpZmllckluRXhwcmVzc2lvbicpO1xuY29uc3QgaXNHbG9iYWwgPSByZXF1aXJlKCcuL2lzR2xvYmFsJyk7XG5jb25zdCBqc2NzID0gcmVxdWlyZSgnanNjb2Rlc2hpZnQnKTtcblxuY29uc3Qge21hdGNofSA9IGpzY3M7XG5cbmNvbnN0IEZpcnN0Tm9kZSA9IHtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGZpcnN0IG5vZGUgdGhhdCBpdCdzIHNhZmUgdG8gaW5zZXJ0IGJlZm9yZSBvbi5cbiAgICpcbiAgICogTm90ZTogV2UgbmV2ZXIgbmVlZCB0byBhZGQgYSBmaXJzdCBub2RlLiBJZiBhIGZpcnN0IG5vZGUgZG9lc24ndCBleGlzdFxuICAgKiB0aGVuIHRoZXJlIGlzbid0IGV2ZXIgY29kZSB0aGF0IHdvdWxkIHJlc3VsdCBpbiBhIHJlcXVpcmUgYmVpbmcgY2hhbmdlZC5cbiAgICovXG4gIGdldChyb290OiBDb2xsZWN0aW9uKTogP05vZGVQYXRoIHtcbiAgICBsZXQgZmlyc3Q7XG4gICAgcm9vdFxuICAgICAgLmZpbmQoanNjcy5Ob2RlKVxuICAgICAgLmZpbHRlcihwYXRoID0+IGlzR2xvYmFsKHBhdGgpKVxuICAgICAgLmZvckVhY2gocGF0aCA9PiB7XG4gICAgICAgIGlmICghZmlyc3QgJiYgRmlyc3ROb2RlLmlzVmFsaWRGaXJzdE5vZGUocGF0aCkpIHtcbiAgICAgICAgICBmaXJzdCA9IHBhdGg7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHJldHVybiBmaXJzdDtcbiAgfSxcblxuICAvKipcbiAgICogRmlsdGVyIHRvIHNlZSBpZiBhIG5vZGUgaXMgYSB2YWxpZCBmaXJzdCBub2RlLlxuICAgKi9cbiAgaXNWYWxpZEZpcnN0Tm9kZShwYXRoOiBOb2RlUGF0aCk6IGJvb2xlYW4ge1xuICAgIC8vIEEgbmV3IGxpbmUgbGl0ZXJhbCBpcyBva2F5LlxuICAgIGlmIChtYXRjaChwYXRoLCB7ZXhwcmVzc2lvbjoge3ZhbHVlOiBOZXdMaW5lLmxpdGVyYWx9fSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBBbnkgb3RoZXIgbGl0ZXJhbCBpcyBub3QuXG4gICAgaWYgKG1hdGNoKHBhdGgsIHtleHByZXNzaW9uOiB7dHlwZTogJ0xpdGVyYWwnfX0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGZpcnN0T2JqZWN0ID0gZ2V0Um9vdElkZW50aWZpZXJJbkV4cHJlc3Npb24ocGF0aC5ub2RlKTtcbiAgICBpZiAoZmlyc3RPYmplY3QgJiYgbWF0Y2goZmlyc3RPYmplY3QsIHtuYW1lOiAnamVzdCd9KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmlyc3ROb2RlO1xuIl19