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

/**
 * @return FuzzyFileSearchService for the specified directory if it is part of a Hack project.
 */

var getFuzzyFileSearchService = _asyncToGenerator(function* (directory) {
  var directoryPath = directory.getPath();
  var serviceName = _featureConfig2['default'].get('nuclide-fuzzy-filename-provider.useRxMode') ? 'FuzzyFileSearchRxService' : 'FuzzyFileSearchService';
  var service = (0, _client.getServiceByNuclideUri)(serviceName, directoryPath);
  return service;
});

exports.getFuzzyFileSearchService = getFuzzyFileSearchService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var _client = require('../../client');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtQnNCLHlCQUF5QixxQkFBeEMsV0FDTCxTQUF5QixFQUNTO0FBQ2xDLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQyxNQUFNLFdBQVcsR0FBRywyQkFBYyxHQUFHLENBQUMsMkNBQTJDLENBQUMsR0FDOUUsMEJBQTBCLEdBQzFCLHdCQUF3QixDQUFDO0FBQzdCLE1BQU0sT0FBZ0MsR0FBRyxvQ0FDdkMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQzlCLFNBQU8sT0FBTyxDQUFDO0NBQ2hCOzs7Ozs7Ozs2QkFqQnlCLHNCQUFzQjs7OztzQkFFWCxjQUFjIiwiZmlsZSI6InV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGVvZiAqIGFzIEZ1enp5RmlsZVNlYXJjaFNlcnZpY2UgZnJvbSAnLi4vLi4vZnV6enktZmlsZS1zZWFyY2gtc2VydmljZSc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5cbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vY2xpZW50JztcblxuLyoqXG4gKiBAcmV0dXJuIEZ1enp5RmlsZVNlYXJjaFNlcnZpY2UgZm9yIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGlmIGl0IGlzIHBhcnQgb2YgYSBIYWNrIHByb2plY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRGdXp6eUZpbGVTZWFyY2hTZXJ2aWNlKFxuICBkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5LFxuKTogUHJvbWlzZTw/RnV6enlGaWxlU2VhcmNoU2VydmljZT4ge1xuICBjb25zdCBkaXJlY3RvcnlQYXRoID0gZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgY29uc3Qgc2VydmljZU5hbWUgPSBmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1mdXp6eS1maWxlbmFtZS1wcm92aWRlci51c2VSeE1vZGUnKVxuICAgID8gJ0Z1enp5RmlsZVNlYXJjaFJ4U2VydmljZSdcbiAgICA6ICdGdXp6eUZpbGVTZWFyY2hTZXJ2aWNlJztcbiAgY29uc3Qgc2VydmljZTogP0Z1enp5RmlsZVNlYXJjaFNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKFxuICAgIHNlcnZpY2VOYW1lLCBkaXJlY3RvcnlQYXRoKTtcbiAgcmV0dXJuIHNlcnZpY2U7XG59XG4iXX0=