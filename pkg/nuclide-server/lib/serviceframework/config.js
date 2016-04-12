Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.loadServicesConfig = loadServicesConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var PACKAGE_ROOT = _path2['default'].resolve(__dirname, '..', '..');

/**
 * Load service configs, and resolve all of the paths to absolute paths.
 */

function loadServicesConfig() {
  // $FlowIssue - This path is not recognized.
  var publicServices = createServiceConfigObject(require('../../services-3.json'));
  var privateServices = [];
  try {
    // $FlowIssue - This path is not recognized.
    privateServices = createServiceConfigObject(require('../../fb/fb-services-3.json'));
  } catch (e) {
    // This file may not exist.
  }
  return publicServices.concat(privateServices);
}

/**
 * Takes the contents of a service config JSON file, and formats each entry into
 * a ConfigEntry.
 */
function createServiceConfigObject(jsonConfig) {
  return jsonConfig.map(function (config) {
    // TODO(peterhal): Remove this once all services have had their def files removed.
    if (config.definition == null) {
      config.definition = config.implementation;
    }
    return {
      name: config.name,
      definition: resolveServicePath(config.definition),
      implementation: resolveServicePath(config.implementation)
    };
  });
}

/**
 * Resolve service path defined in services-3.json to absolute path. The service path could
 * be in one of following forms:
 *   1. A path relative to the folder that contains `service-config.json`.
 *   2. An absolute path.
 *   3. A path in form of `$dependency_package/path/to/service`. For example,
 *      'nuclide-commons/lib/array.js'.
 */
function resolveServicePath(servicePath) {
  try {
    return require.resolve(servicePath);
  } catch (e) {
    return _path2['default'].resolve(PACKAGE_ROOT, servicePath);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7b0JBV2lCLE1BQU07Ozs7QUFHdkIsSUFBTSxZQUFZLEdBQUcsa0JBQUssT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Ozs7OztBQUtsRCxTQUFTLGtCQUFrQixHQUF1Qjs7QUFFdkQsTUFBTSxjQUFjLEdBQUcseUJBQXlCLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztBQUNuRixNQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDekIsTUFBSTs7QUFFRixtQkFBZSxHQUFHLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7R0FDckYsQ0FBQyxPQUFPLENBQUMsRUFBRTs7R0FFWDtBQUNELFNBQU8sY0FBYyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUMvQzs7Ozs7O0FBTUQsU0FBUyx5QkFBeUIsQ0FBQyxVQUF5QixFQUFzQjtBQUNoRixTQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7O0FBRTlCLFFBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDN0IsWUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO0tBQzNDO0FBQ0QsV0FBTztBQUNMLFVBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtBQUNqQixnQkFBVSxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDakQsb0JBQWMsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO0tBQzFELENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSjs7Ozs7Ozs7OztBQVVELFNBQVMsa0JBQWtCLENBQUMsV0FBbUIsRUFBVTtBQUN2RCxNQUFJO0FBQ0YsV0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ3JDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLGtCQUFLLE9BQU8sQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7R0FDaEQ7Q0FDRiIsImZpbGUiOiJjb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0eXBlIHtDb25maWdFbnRyeX0gZnJvbSAnLi9pbmRleCc7XG5cbmNvbnN0IFBBQ0tBR0VfUk9PVCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicpO1xuXG4vKipcbiAqIExvYWQgc2VydmljZSBjb25maWdzLCBhbmQgcmVzb2x2ZSBhbGwgb2YgdGhlIHBhdGhzIHRvIGFic29sdXRlIHBhdGhzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZFNlcnZpY2VzQ29uZmlnKCk6IEFycmF5PENvbmZpZ0VudHJ5PiB7XG4gIC8vICRGbG93SXNzdWUgLSBUaGlzIHBhdGggaXMgbm90IHJlY29nbml6ZWQuXG4gIGNvbnN0IHB1YmxpY1NlcnZpY2VzID0gY3JlYXRlU2VydmljZUNvbmZpZ09iamVjdChyZXF1aXJlKCcuLi8uLi9zZXJ2aWNlcy0zLmpzb24nKSk7XG4gIGxldCBwcml2YXRlU2VydmljZXMgPSBbXTtcbiAgdHJ5IHtcbiAgICAvLyAkRmxvd0lzc3VlIC0gVGhpcyBwYXRoIGlzIG5vdCByZWNvZ25pemVkLlxuICAgIHByaXZhdGVTZXJ2aWNlcyA9IGNyZWF0ZVNlcnZpY2VDb25maWdPYmplY3QocmVxdWlyZSgnLi4vLi4vZmIvZmItc2VydmljZXMtMy5qc29uJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gVGhpcyBmaWxlIG1heSBub3QgZXhpc3QuXG4gIH1cbiAgcmV0dXJuIHB1YmxpY1NlcnZpY2VzLmNvbmNhdChwcml2YXRlU2VydmljZXMpO1xufVxuXG4vKipcbiAqIFRha2VzIHRoZSBjb250ZW50cyBvZiBhIHNlcnZpY2UgY29uZmlnIEpTT04gZmlsZSwgYW5kIGZvcm1hdHMgZWFjaCBlbnRyeSBpbnRvXG4gKiBhIENvbmZpZ0VudHJ5LlxuICovXG5mdW5jdGlvbiBjcmVhdGVTZXJ2aWNlQ29uZmlnT2JqZWN0KGpzb25Db25maWc6IEFycmF5PE9iamVjdD4pOiBBcnJheTxDb25maWdFbnRyeT4ge1xuICByZXR1cm4ganNvbkNvbmZpZy5tYXAoY29uZmlnID0+IHtcbiAgICAvLyBUT0RPKHBldGVyaGFsKTogUmVtb3ZlIHRoaXMgb25jZSBhbGwgc2VydmljZXMgaGF2ZSBoYWQgdGhlaXIgZGVmIGZpbGVzIHJlbW92ZWQuXG4gICAgaWYgKGNvbmZpZy5kZWZpbml0aW9uID09IG51bGwpIHtcbiAgICAgIGNvbmZpZy5kZWZpbml0aW9uID0gY29uZmlnLmltcGxlbWVudGF0aW9uO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICBkZWZpbml0aW9uOiByZXNvbHZlU2VydmljZVBhdGgoY29uZmlnLmRlZmluaXRpb24pLFxuICAgICAgaW1wbGVtZW50YXRpb246IHJlc29sdmVTZXJ2aWNlUGF0aChjb25maWcuaW1wbGVtZW50YXRpb24pLFxuICAgIH07XG4gIH0pO1xufVxuXG4vKipcbiAqIFJlc29sdmUgc2VydmljZSBwYXRoIGRlZmluZWQgaW4gc2VydmljZXMtMy5qc29uIHRvIGFic29sdXRlIHBhdGguIFRoZSBzZXJ2aWNlIHBhdGggY291bGRcbiAqIGJlIGluIG9uZSBvZiBmb2xsb3dpbmcgZm9ybXM6XG4gKiAgIDEuIEEgcGF0aCByZWxhdGl2ZSB0byB0aGUgZm9sZGVyIHRoYXQgY29udGFpbnMgYHNlcnZpY2UtY29uZmlnLmpzb25gLlxuICogICAyLiBBbiBhYnNvbHV0ZSBwYXRoLlxuICogICAzLiBBIHBhdGggaW4gZm9ybSBvZiBgJGRlcGVuZGVuY3lfcGFja2FnZS9wYXRoL3RvL3NlcnZpY2VgLiBGb3IgZXhhbXBsZSxcbiAqICAgICAgJ251Y2xpZGUtY29tbW9ucy9saWIvYXJyYXkuanMnLlxuICovXG5mdW5jdGlvbiByZXNvbHZlU2VydmljZVBhdGgoc2VydmljZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUucmVzb2x2ZShzZXJ2aWNlUGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKFBBQ0tBR0VfUk9PVCwgc2VydmljZVBhdGgpO1xuICB9XG59XG4iXX0=