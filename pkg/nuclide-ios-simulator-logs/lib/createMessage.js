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

exports.createMessage = createMessage;

/**
 * Convert a structured logcat entry into the format that nuclide-output wants.
 */

function createMessage(record) {
  return {
    text: record.Message,
    level: getLevel(record.Level)
  };
}

function getLevel(level) {
  switch (level) {
    case '0': // Emergency
    case '1': // Alert
    case '2': // Critical
    case '3':
      // Error
      return 'error';
    case '4':
      // Warning
      return 'warning';
    case '5':
      // Notice
      return 'log';
    case '6':
      // Info
      return 'info';
    case '7':
      // Debug
      return 'debug';
    default:
      throw new Error('Invalid ASL level: ' + level);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJPLFNBQVMsYUFBYSxDQUFDLE1BQWlCLEVBQVc7QUFDeEQsU0FBTztBQUNMLFFBQUksRUFBRSxNQUFNLENBQUMsT0FBTztBQUNwQixTQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7R0FDOUIsQ0FBQztDQUNIOztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQWUsRUFBUztBQUN4QyxVQUFRLEtBQUs7QUFDWCxTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRyxDQUFDO0FBQ1QsU0FBSyxHQUFHLENBQUM7QUFDVCxTQUFLLEdBQUc7O0FBQ04sYUFBTyxPQUFPLENBQUM7QUFBQSxBQUNqQixTQUFLLEdBQUc7O0FBQ04sYUFBTyxTQUFTLENBQUM7QUFBQSxBQUNuQixTQUFLLEdBQUc7O0FBQ04sYUFBTyxLQUFLLENBQUM7QUFBQSxBQUNmLFNBQUssR0FBRzs7QUFDTixhQUFPLE1BQU0sQ0FBQztBQUFBLEFBQ2hCLFNBQUssR0FBRzs7QUFDTixhQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2pCO0FBQ0UsWUFBTSxJQUFJLEtBQUsseUJBQXVCLEtBQUssQ0FBRyxDQUFDO0FBQUEsR0FDbEQ7Q0FDRiIsImZpbGUiOiJjcmVhdGVNZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xldmVsLCBNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLW91dHB1dC9saWIvdHlwZXMnO1xuaW1wb3J0IHR5cGUge0FzbExldmVsLCBBc2xSZWNvcmR9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIENvbnZlcnQgYSBzdHJ1Y3R1cmVkIGxvZ2NhdCBlbnRyeSBpbnRvIHRoZSBmb3JtYXQgdGhhdCBudWNsaWRlLW91dHB1dCB3YW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2UocmVjb3JkOiBBc2xSZWNvcmQpOiBNZXNzYWdlIHtcbiAgcmV0dXJuIHtcbiAgICB0ZXh0OiByZWNvcmQuTWVzc2FnZSxcbiAgICBsZXZlbDogZ2V0TGV2ZWwocmVjb3JkLkxldmVsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TGV2ZWwobGV2ZWw6IEFzbExldmVsKTogTGV2ZWwge1xuICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgY2FzZSAnMCc6IC8vIEVtZXJnZW5jeVxuICAgIGNhc2UgJzEnOiAvLyBBbGVydFxuICAgIGNhc2UgJzInOiAvLyBDcml0aWNhbFxuICAgIGNhc2UgJzMnOiAvLyBFcnJvclxuICAgICAgcmV0dXJuICdlcnJvcic7XG4gICAgY2FzZSAnNCc6IC8vIFdhcm5pbmdcbiAgICAgIHJldHVybiAnd2FybmluZyc7XG4gICAgY2FzZSAnNSc6IC8vIE5vdGljZVxuICAgICAgcmV0dXJuICdsb2cnO1xuICAgIGNhc2UgJzYnOiAvLyBJbmZvXG4gICAgICByZXR1cm4gJ2luZm8nO1xuICAgIGNhc2UgJzcnOiAvLyBEZWJ1Z1xuICAgICAgcmV0dXJuICdkZWJ1Zyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBBU0wgbGV2ZWw6ICR7bGV2ZWx9YCk7XG4gIH1cbn1cbiJdfQ==