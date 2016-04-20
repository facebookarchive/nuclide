Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getRuntimeInformation = getRuntimeInformation;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _clientInfo = require('./clientInfo');

var _systemInfo = require('./systemInfo');

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

var _session = require('./session');

var _session2 = _interopRequireDefault(_session);

var cachedInformation = null;

function getCacheableRuntimeInformation() {
  if (cachedInformation !== null) {
    return cachedInformation;
  }

  cachedInformation = {
    sessionId: '',
    user: _environment2['default'].USER,
    osType: (0, _systemInfo.getOsType)(),
    timestamp: 0,
    isClient: (0, _clientInfo.isRunningInClient)(),
    isDevelopment: (0, _clientInfo.isDevelopment)(),
    atomVersion: (0, _clientInfo.isRunningInClient)() ? (0, _clientInfo.getAtomVersion)() : '',
    nuclideVersion: (0, _clientInfo.getNuclideVersion)(),
    installerPackageVersion: 0,
    uptime: 0,
    // TODO (chenshen) fill following information.
    serverVersion: 0
  };

  return cachedInformation;
}

function getRuntimeInformation() {
  var runtimeInformation = _extends({}, getCacheableRuntimeInformation(), {
    sessionId: _session2['default'].id,
    timestamp: Date.now(),
    uptime: Math.floor(process.uptime() * 1000)
  });
  return runtimeInformation;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bnRpbWVJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQkFnQk8sY0FBYzs7MEJBQ0csY0FBYzs7MkJBQ2QsZUFBZTs7Ozt1QkFDbkIsV0FBVzs7OztBQWdCL0IsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLENBQUM7O0FBRTdCLFNBQVMsOEJBQThCLEdBQXVCO0FBQzVELE1BQUksaUJBQWlCLEtBQUssSUFBSSxFQUFFO0FBQzlCLFdBQU8saUJBQWlCLENBQUM7R0FDMUI7O0FBRUQsbUJBQWlCLEdBQUc7QUFDbEIsYUFBUyxFQUFFLEVBQUU7QUFDYixRQUFJLEVBQUUseUJBQVksSUFBSTtBQUN0QixVQUFNLEVBQUUsNEJBQVc7QUFDbkIsYUFBUyxFQUFFLENBQUM7QUFDWixZQUFRLEVBQUUsb0NBQW1CO0FBQzdCLGlCQUFhLEVBQUUsZ0NBQWU7QUFDOUIsZUFBVyxFQUFFLG9DQUFtQixHQUFHLGlDQUFnQixHQUFHLEVBQUU7QUFDeEQsa0JBQWMsRUFBRSxvQ0FBbUI7QUFDbkMsMkJBQXVCLEVBQUUsQ0FBQztBQUMxQixVQUFNLEVBQUUsQ0FBQzs7QUFFVCxpQkFBYSxFQUFFLENBQUM7R0FDakIsQ0FBQzs7QUFFRixTQUFPLGlCQUFpQixDQUFDO0NBQzFCOztBQUVNLFNBQVMscUJBQXFCLEdBQXVCO0FBQzFELE1BQU0sa0JBQWtCLGdCQUNuQiw4QkFBOEIsRUFBRTtBQUNuQyxhQUFTLEVBQUUscUJBQVEsRUFBRTtBQUNyQixhQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNyQixVQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQzVDLENBQUM7QUFDRixTQUFPLGtCQUFrQixDQUFDO0NBQzNCIiwiZmlsZSI6InJ1bnRpbWVJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtcbiAgZ2V0QXRvbVZlcnNpb24sXG4gIGdldE51Y2xpZGVWZXJzaW9uLFxuICBpc0RldmVsb3BtZW50LFxuICBpc1J1bm5pbmdJbkNsaWVudCxcbn0gZnJvbSAnLi9jbGllbnRJbmZvJztcbmltcG9ydCB7Z2V0T3NUeXBlfSBmcm9tICcuL3N5c3RlbUluZm8nO1xuaW1wb3J0IGVudmlyb25tZW50IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHNlc3Npb24gZnJvbSAnLi9zZXNzaW9uJztcblxuZXhwb3J0IHR5cGUgUnVudGltZUluZm9ybWF0aW9uID0ge1xuICBzZXNzaW9uSWQ6IHN0cmluZztcbiAgdXNlcjogc3RyaW5nO1xuICBvc1R5cGU6IHN0cmluZztcbiAgdGltZXN0YW1wOiBudW1iZXI7XG4gIGlzQ2xpZW50OiBib29sZWFuO1xuICBpc0RldmVsb3BtZW50OiBib29sZWFuO1xuICBhdG9tVmVyc2lvbjogc3RyaW5nO1xuICBudWNsaWRlVmVyc2lvbjogc3RyaW5nO1xuICBpbnN0YWxsZXJQYWNrYWdlVmVyc2lvbjogbnVtYmVyO1xuICBzZXJ2ZXJWZXJzaW9uOiBudW1iZXI7XG4gIHVwdGltZTogbnVtYmVyO1xufTtcblxubGV0IGNhY2hlZEluZm9ybWF0aW9uID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0Q2FjaGVhYmxlUnVudGltZUluZm9ybWF0aW9uKCk6IFJ1bnRpbWVJbmZvcm1hdGlvbiB7XG4gIGlmIChjYWNoZWRJbmZvcm1hdGlvbiAhPT0gbnVsbCkge1xuICAgIHJldHVybiBjYWNoZWRJbmZvcm1hdGlvbjtcbiAgfVxuXG4gIGNhY2hlZEluZm9ybWF0aW9uID0ge1xuICAgIHNlc3Npb25JZDogJycsXG4gICAgdXNlcjogZW52aXJvbm1lbnQuVVNFUixcbiAgICBvc1R5cGU6IGdldE9zVHlwZSgpLFxuICAgIHRpbWVzdGFtcDogMCxcbiAgICBpc0NsaWVudDogaXNSdW5uaW5nSW5DbGllbnQoKSxcbiAgICBpc0RldmVsb3BtZW50OiBpc0RldmVsb3BtZW50KCksXG4gICAgYXRvbVZlcnNpb246IGlzUnVubmluZ0luQ2xpZW50KCkgPyBnZXRBdG9tVmVyc2lvbigpIDogJycsXG4gICAgbnVjbGlkZVZlcnNpb246IGdldE51Y2xpZGVWZXJzaW9uKCksXG4gICAgaW5zdGFsbGVyUGFja2FnZVZlcnNpb246IDAsXG4gICAgdXB0aW1lOiAwLFxuICAgIC8vIFRPRE8gKGNoZW5zaGVuKSBmaWxsIGZvbGxvd2luZyBpbmZvcm1hdGlvbi5cbiAgICBzZXJ2ZXJWZXJzaW9uOiAwLFxuICB9O1xuXG4gIHJldHVybiBjYWNoZWRJbmZvcm1hdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJ1bnRpbWVJbmZvcm1hdGlvbigpOiBSdW50aW1lSW5mb3JtYXRpb24ge1xuICBjb25zdCBydW50aW1lSW5mb3JtYXRpb24gPSB7XG4gICAgLi4uZ2V0Q2FjaGVhYmxlUnVudGltZUluZm9ybWF0aW9uKCksXG4gICAgc2Vzc2lvbklkOiBzZXNzaW9uLmlkLFxuICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICB1cHRpbWU6IE1hdGguZmxvb3IocHJvY2Vzcy51cHRpbWUoKSAqIDEwMDApLFxuICB9O1xuICByZXR1cm4gcnVudGltZUluZm9ybWF0aW9uO1xufVxuIl19