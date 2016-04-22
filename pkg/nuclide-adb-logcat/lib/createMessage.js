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
 * Convert a structured logcat entry into the format that nuclide-console wants.
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
      return 'warning';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FCQWlCd0IsYUFBYTs7Ozs7O0FBQXRCLFNBQVMsYUFBYSxDQUFDLEtBQWtCLEVBQVc7QUFDakUsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUM7QUFDbEUsU0FBTztBQUNMLFFBQUksRUFBRSxLQUFLLENBQUMsT0FBTztBQUNuQixTQUFLLEVBQUUsZUFBZSxDQUFDLFFBQVEsQ0FBQztHQUNqQyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxlQUFlLENBQUMsUUFBa0IsRUFBUztBQUNsRCxVQUFRLFFBQVE7QUFDZCxTQUFLLEdBQUc7O0FBQ04sYUFBTyxTQUFTLENBQUM7QUFBQSxBQUNuQixTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRzs7QUFDTixhQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2pCLFNBQUssR0FBRzs7QUFDTixZQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFBQSxBQUN4RCxTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRyxDQUFDO0FBQ1QsU0FBSyxHQUFHLENBQUM7QUFDVDtBQUNFLGFBQU8sTUFBTSxDQUFDO0FBQUEsR0FDakI7Q0FDRiIsImZpbGUiOiJjcmVhdGVNZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xldmVsLCBNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbnNvbGUvbGliL3R5cGVzJztcbmltcG9ydCB0eXBlIHtMb2djYXRFbnRyeSwgUHJpb3JpdHl9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIENvbnZlcnQgYSBzdHJ1Y3R1cmVkIGxvZ2NhdCBlbnRyeSBpbnRvIHRoZSBmb3JtYXQgdGhhdCBudWNsaWRlLWNvbnNvbGUgd2FudHMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2UoZW50cnk6IExvZ2NhdEVudHJ5KTogTWVzc2FnZSB7XG4gIGNvbnN0IHByaW9yaXR5ID0gZW50cnkubWV0YWRhdGEgJiYgZW50cnkubWV0YWRhdGEucHJpb3JpdHkgfHwgJ0knO1xuICByZXR1cm4ge1xuICAgIHRleHQ6IGVudHJ5Lm1lc3NhZ2UsXG4gICAgbGV2ZWw6IHByaW9yaXR5VG9MZXZlbChwcmlvcml0eSksXG4gIH07XG59XG5cbmZ1bmN0aW9uIHByaW9yaXR5VG9MZXZlbChwcmlvcml0eTogUHJpb3JpdHkpOiBMZXZlbCB7XG4gIHN3aXRjaCAocHJpb3JpdHkpIHtcbiAgICBjYXNlICdXJzogLy8gd2FyblxuICAgICAgcmV0dXJuICd3YXJuaW5nJztcbiAgICBjYXNlICdFJzogLy8gZXJyb3JcbiAgICBjYXNlICdGJzogLy8gZmF0YWxcbiAgICAgIHJldHVybiAnZXJyb3InO1xuICAgIGNhc2UgJ1MnOiAvLyBzaWxlbnRcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2lsZW50IG1lc3NhZ2VzIHNob3VsZCBiZSBmaWx0ZXJlZCcpO1xuICAgIGNhc2UgJ1YnOiAvLyB2ZXJib3NlXG4gICAgY2FzZSAnRCc6IC8vIGRlYnVnXG4gICAgY2FzZSAnSSc6IC8vIGluZm9cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdpbmZvJztcbiAgfVxufVxuIl19