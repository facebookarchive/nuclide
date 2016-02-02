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

exports['default'] = createMessage;

/**
 * Convert a structured logcat entry into the format that nuclide-output wants.
 */

function createMessage(entry) {
  var priority = entry.metadata && entry.metadata.priority || 'I';
  return {
    text: entry.message,
    level: priorityToLevel(priority)
  };
}

function priorityToLevel(priority) {
  switch (priority) {
    case 'W':
      // warn
      return 'warn';
    case 'E': // error
    case 'F':
      // fatal
      return 'error';
    case 'S':
      // silent
      throw new Error('Silent messages should be filtered');
    case 'V': // verbose
    case 'D': // debug
    case 'I': // info
    default:
      return 'info';
  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FCQWlCd0IsYUFBYTs7Ozs7O0FBQXRCLFNBQVMsYUFBYSxDQUFDLEtBQWtCLEVBQVc7QUFDakUsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUM7QUFDbEUsU0FBTztBQUNMLFFBQUksRUFBRSxLQUFLLENBQUMsT0FBTztBQUNuQixTQUFLLEVBQUUsZUFBZSxDQUFDLFFBQVEsQ0FBQztHQUNqQyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxlQUFlLENBQUMsUUFBa0IsRUFBUztBQUNsRCxVQUFRLFFBQVE7QUFDZCxTQUFLLEdBQUc7O0FBQ04sYUFBTyxNQUFNLENBQUM7QUFBQSxBQUNoQixTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRzs7QUFDTixhQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2pCLFNBQUssR0FBRzs7QUFDTixZQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFBQSxBQUN4RCxTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRyxDQUFDO0FBQ1QsU0FBSyxHQUFHLENBQUM7QUFDVDtBQUNFLGFBQU8sTUFBTSxDQUFDO0FBQUEsR0FDakI7Q0FDRiIsImZpbGUiOiJjcmVhdGVNZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xldmVsLCBNZXNzYWdlfSBmcm9tICcuLi8uLi9vdXRwdXQvbGliL3R5cGVzJztcbmltcG9ydCB0eXBlIHtMb2djYXRFbnRyeSwgUHJpb3JpdHl9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIENvbnZlcnQgYSBzdHJ1Y3R1cmVkIGxvZ2NhdCBlbnRyeSBpbnRvIHRoZSBmb3JtYXQgdGhhdCBudWNsaWRlLW91dHB1dCB3YW50cy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZShlbnRyeTogTG9nY2F0RW50cnkpOiBNZXNzYWdlIHtcbiAgY29uc3QgcHJpb3JpdHkgPSBlbnRyeS5tZXRhZGF0YSAmJiBlbnRyeS5tZXRhZGF0YS5wcmlvcml0eSB8fCAnSSc7XG4gIHJldHVybiB7XG4gICAgdGV4dDogZW50cnkubWVzc2FnZSxcbiAgICBsZXZlbDogcHJpb3JpdHlUb0xldmVsKHByaW9yaXR5KSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJpb3JpdHlUb0xldmVsKHByaW9yaXR5OiBQcmlvcml0eSk6IExldmVsIHtcbiAgc3dpdGNoIChwcmlvcml0eSkge1xuICAgIGNhc2UgJ1cnOiAvLyB3YXJuXG4gICAgICByZXR1cm4gJ3dhcm4nO1xuICAgIGNhc2UgJ0UnOiAvLyBlcnJvclxuICAgIGNhc2UgJ0YnOiAvLyBmYXRhbFxuICAgICAgcmV0dXJuICdlcnJvcic7XG4gICAgY2FzZSAnUyc6IC8vIHNpbGVudFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaWxlbnQgbWVzc2FnZXMgc2hvdWxkIGJlIGZpbHRlcmVkJyk7XG4gICAgY2FzZSAnVic6IC8vIHZlcmJvc2VcbiAgICBjYXNlICdEJzogLy8gZGVidWdcbiAgICBjYXNlICdJJzogLy8gaW5mb1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ2luZm8nO1xuICB9XG59XG4iXX0=