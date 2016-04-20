Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getOutline = getOutline;

var _parsing = require('./parsing');

function getOutline(text) {
  var expression = (0, _parsing.parseJSON)(text);
  if (expression == null) {
    return null;
  }
  if (expression.type === 'ObjectExpression') {
    var outlineTrees = expression.properties
    // Filter out property keys that aren't string literals, such as computed properties. They
    // aren't valid JSON but nothing actually enforces that we are getting valid JSON and we are
    // using a full JS parser so we have to handle cases like this.
    .filter(function (prop) {
      return prop.key.type === 'Literal' && typeof prop.key.value === 'string';
    }).map(function (prop) {
      return {
        plainText: prop.key.value,
        startPosition: (0, _parsing.babelPosToPoint)(prop.loc.start),
        endPosition: (0, _parsing.babelPosToPoint)(prop.loc.end),
        children: []
      };
    });
    return { outlineTrees: outlineTrees };
  }
  return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkpTT05PdXRsaW5lUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7dUJBYXlDLFdBQVc7O0FBRTdDLFNBQVMsVUFBVSxDQUFDLElBQVksRUFBWTtBQUNqRCxNQUFNLFVBQVUsR0FBRyx3QkFBVSxJQUFJLENBQUMsQ0FBQztBQUNuQyxNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELE1BQUksVUFBVSxDQUFDLElBQUksS0FBSyxrQkFBa0IsRUFBRTtBQUMxQyxRQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsVUFBVTs7OztLQUl2QyxNQUFNLENBQUMsVUFBQSxJQUFJO2FBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssUUFBUTtLQUFBLENBQUMsQ0FDakYsR0FBRyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ1gsYUFBTztBQUNMLGlCQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLO0FBQ3pCLHFCQUFhLEVBQUUsOEJBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQzlDLG1CQUFXLEVBQUUsOEJBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQzFDLGdCQUFRLEVBQUUsRUFBRTtPQUNiLENBQUM7S0FDSCxDQUFDLENBQUM7QUFDTCxXQUFPLEVBQUUsWUFBWSxFQUFaLFlBQVksRUFBRSxDQUFDO0dBQ3pCO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYiIsImZpbGUiOiJKU09OT3V0bGluZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge091dGxpbmV9IGZyb20gJy4uLy4uL251Y2xpZGUtb3V0bGluZS12aWV3JztcblxuaW1wb3J0IHtwYXJzZUpTT04sIGJhYmVsUG9zVG9Qb2ludH0gZnJvbSAnLi9wYXJzaW5nJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE91dGxpbmUodGV4dDogc3RyaW5nKTogP091dGxpbmUge1xuICBjb25zdCBleHByZXNzaW9uID0gcGFyc2VKU09OKHRleHQpO1xuICBpZiAoZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKGV4cHJlc3Npb24udHlwZSA9PT0gJ09iamVjdEV4cHJlc3Npb24nKSB7XG4gICAgY29uc3Qgb3V0bGluZVRyZWVzID0gZXhwcmVzc2lvbi5wcm9wZXJ0aWVzXG4gICAgICAvLyBGaWx0ZXIgb3V0IHByb3BlcnR5IGtleXMgdGhhdCBhcmVuJ3Qgc3RyaW5nIGxpdGVyYWxzLCBzdWNoIGFzIGNvbXB1dGVkIHByb3BlcnRpZXMuIFRoZXlcbiAgICAgIC8vIGFyZW4ndCB2YWxpZCBKU09OIGJ1dCBub3RoaW5nIGFjdHVhbGx5IGVuZm9yY2VzIHRoYXQgd2UgYXJlIGdldHRpbmcgdmFsaWQgSlNPTiBhbmQgd2UgYXJlXG4gICAgICAvLyB1c2luZyBhIGZ1bGwgSlMgcGFyc2VyIHNvIHdlIGhhdmUgdG8gaGFuZGxlIGNhc2VzIGxpa2UgdGhpcy5cbiAgICAgIC5maWx0ZXIocHJvcCA9PiBwcm9wLmtleS50eXBlID09PSAnTGl0ZXJhbCcgJiYgdHlwZW9mIHByb3Aua2V5LnZhbHVlID09PSAnc3RyaW5nJylcbiAgICAgIC5tYXAocHJvcCA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcGxhaW5UZXh0OiBwcm9wLmtleS52YWx1ZSxcbiAgICAgICAgICBzdGFydFBvc2l0aW9uOiBiYWJlbFBvc1RvUG9pbnQocHJvcC5sb2Muc3RhcnQpLFxuICAgICAgICAgIGVuZFBvc2l0aW9uOiBiYWJlbFBvc1RvUG9pbnQocHJvcC5sb2MuZW5kKSxcbiAgICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICByZXR1cm4geyBvdXRsaW5lVHJlZXMgfTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbiJdfQ==