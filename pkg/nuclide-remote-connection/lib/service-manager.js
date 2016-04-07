var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideServerLibServiceframeworkIndex = require('../../nuclide-server/lib/serviceframework/index');

var _nuclideServerLibServiceframeworkIndex2 = _interopRequireDefault(_nuclideServerLibServiceframeworkIndex);

var _ServiceLogger = require('./ServiceLogger');

var _ServiceLogger2 = _interopRequireDefault(_ServiceLogger);

var logger = require('../../nuclide-logging').getLogger();

var _require = require('./ServerConnection');

var ServerConnection = _require.ServerConnection;

var _require2 = require('../../nuclide-remote-uri');

var isRemote = _require2.isRemote;
var getHostname = _require2.getHostname;

var newServices = _nuclideServerLibServiceframeworkIndex2['default'].loadServicesConfig();

/**
 * Create or get a cached service.
 * @param nuclideUri It could either be either a local path or a remote path in form of
 *    `nuclide:$host:$port/$path`. The function will use the $host from remote path to
 *    create a remote service or create a local service if the uri is local path.
 */
function getServiceByNuclideUri(serviceName) {
  var nuclideUri = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var hostname = nuclideUri && isRemote(nuclideUri) ? getHostname(nuclideUri) : null;
  return getService(serviceName, hostname);
}

/**
 * Create or get a cached service. If hostname is null or empty string,
 * it returns a local service, otherwise a remote service will be returned.
 */
function getService(serviceName, hostname) {
  if (hostname) {
    var serverConnection = ServerConnection.getByHostname(hostname);
    if (serverConnection == null) {
      return null;
    }
    return serverConnection.getService(serviceName);
  } else {
    var _newServices$filter = newServices.filter(function (config) {
      return config.name === serviceName;
    });

    var _newServices$filter2 = _slicedToArray(_newServices$filter, 1);

    var serviceConfig = _newServices$filter2[0];

    (0, _assert2['default'])(serviceConfig, 'No config found for service ' + serviceName);
    // $FlowIgnore
    return require(serviceConfig.implementation);
  }
}

var serviceLogger = undefined;
function getServiceLogger() {
  if (!serviceLogger) {
    serviceLogger = new _ServiceLogger2['default']();
    serviceLogger.onNewItem(function (item) {
      // TODO(t8579744): Log these to a separate file. Note that whatever file is used should also
      // be included in bug reports.
      logger.debug('Service call:', item.service, item.method, item.isLocal, item.argInfo);
    });
  }
  return serviceLogger;
}

module.exports = {
  getService: getService,
  getServiceByNuclideUri: getServiceByNuclideUri,
  getServiceLogger: getServiceLogger
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2UtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7c0JBaUJzQixRQUFROzs7O3FEQUNELGlEQUFpRDs7Ozs2QkFDcEQsaUJBQWlCOzs7O0FBTjNDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOztlQUNqQyxPQUFPLENBQUMsb0JBQW9CLENBQUM7O0lBQWpELGdCQUFnQixZQUFoQixnQkFBZ0I7O2dCQUNTLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQzs7SUFBNUQsUUFBUSxhQUFSLFFBQVE7SUFBRSxXQUFXLGFBQVgsV0FBVzs7QUFNNUIsSUFBTSxXQUFXLEdBQUcsbURBQWlCLGtCQUFrQixFQUFFLENBQUM7Ozs7Ozs7O0FBUTFELFNBQVMsc0JBQXNCLENBQzdCLFdBQW1CLEVBRWI7TUFETixVQUF1Qix5REFBRyxJQUFJOztBQUU5QixNQUFNLFFBQVEsR0FBRyxBQUFDLFVBQVUsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQ2xELFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FDdkIsSUFBSSxDQUFDO0FBQ1AsU0FBTyxVQUFVLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQzFDOzs7Ozs7QUFNRCxTQUFTLFVBQVUsQ0FBQyxXQUFtQixFQUFFLFFBQWlCLEVBQVE7QUFDaEUsTUFBSSxRQUFRLEVBQUU7QUFDWixRQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsRSxRQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM1QixhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsV0FBTyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDakQsTUFBTTs4QkFDbUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFBLE1BQU07YUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVc7S0FBQSxDQUFDOzs7O1FBQTFFLGFBQWE7O0FBQ3BCLDZCQUFVLGFBQWEsbUNBQWlDLFdBQVcsQ0FBRyxDQUFDOztBQUV2RSxXQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDOUM7Q0FDRjs7QUFFRCxJQUFJLGFBQTZCLFlBQUEsQ0FBQztBQUNsQyxTQUFTLGdCQUFnQixHQUFrQjtBQUN6QyxNQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLGlCQUFhLEdBQUcsZ0NBQW1CLENBQUM7QUFDcEMsaUJBQWEsQ0FBQyxTQUFTLENBQUMsVUFBQSxJQUFJLEVBQUk7OztBQUc5QixZQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEYsQ0FBQyxDQUFDO0dBQ0o7QUFDRCxTQUFPLGFBQWEsQ0FBQztDQUN0Qjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLGtCQUFnQixFQUFoQixnQkFBZ0I7Q0FDakIsQ0FBQyIsImZpbGUiOiJzZXJ2aWNlLW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5jb25zdCB7U2VydmVyQ29ubmVjdGlvbn0gPSByZXF1aXJlKCcuL1NlcnZlckNvbm5lY3Rpb24nKTtcbmNvbnN0IHtpc1JlbW90ZSwgZ2V0SG9zdG5hbWV9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBTZXJ2aWNlRnJhbWV3b3JrIGZyb20gJy4uLy4uL251Y2xpZGUtc2VydmVyL2xpYi9zZXJ2aWNlZnJhbWV3b3JrL2luZGV4JztcbmltcG9ydCBTZXJ2aWNlTG9nZ2VyIGZyb20gJy4vU2VydmljZUxvZ2dlcic7XG5cbmNvbnN0IG5ld1NlcnZpY2VzID0gU2VydmljZUZyYW1ld29yay5sb2FkU2VydmljZXNDb25maWcoKTtcblxuLyoqXG4gKiBDcmVhdGUgb3IgZ2V0IGEgY2FjaGVkIHNlcnZpY2UuXG4gKiBAcGFyYW0gbnVjbGlkZVVyaSBJdCBjb3VsZCBlaXRoZXIgYmUgZWl0aGVyIGEgbG9jYWwgcGF0aCBvciBhIHJlbW90ZSBwYXRoIGluIGZvcm0gb2ZcbiAqICAgIGBudWNsaWRlOiRob3N0OiRwb3J0LyRwYXRoYC4gVGhlIGZ1bmN0aW9uIHdpbGwgdXNlIHRoZSAkaG9zdCBmcm9tIHJlbW90ZSBwYXRoIHRvXG4gKiAgICBjcmVhdGUgYSByZW1vdGUgc2VydmljZSBvciBjcmVhdGUgYSBsb2NhbCBzZXJ2aWNlIGlmIHRoZSB1cmkgaXMgbG9jYWwgcGF0aC5cbiAqL1xuZnVuY3Rpb24gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaShcbiAgc2VydmljZU5hbWU6IHN0cmluZyxcbiAgbnVjbGlkZVVyaTogP051Y2xpZGVVcmkgPSBudWxsXG4pOiA/YW55IHtcbiAgY29uc3QgaG9zdG5hbWUgPSAobnVjbGlkZVVyaSAmJiBpc1JlbW90ZShudWNsaWRlVXJpKSkgP1xuICAgIGdldEhvc3RuYW1lKG51Y2xpZGVVcmkpIDpcbiAgICBudWxsO1xuICByZXR1cm4gZ2V0U2VydmljZShzZXJ2aWNlTmFtZSwgaG9zdG5hbWUpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBvciBnZXQgYSBjYWNoZWQgc2VydmljZS4gSWYgaG9zdG5hbWUgaXMgbnVsbCBvciBlbXB0eSBzdHJpbmcsXG4gKiBpdCByZXR1cm5zIGEgbG9jYWwgc2VydmljZSwgb3RoZXJ3aXNlIGEgcmVtb3RlIHNlcnZpY2Ugd2lsbCBiZSByZXR1cm5lZC5cbiAqL1xuZnVuY3Rpb24gZ2V0U2VydmljZShzZXJ2aWNlTmFtZTogc3RyaW5nLCBob3N0bmFtZTogP3N0cmluZyk6ID9hbnkge1xuICBpZiAoaG9zdG5hbWUpIHtcbiAgICBjb25zdCBzZXJ2ZXJDb25uZWN0aW9uID0gU2VydmVyQ29ubmVjdGlvbi5nZXRCeUhvc3RuYW1lKGhvc3RuYW1lKTtcbiAgICBpZiAoc2VydmVyQ29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHNlcnZlckNvbm5lY3Rpb24uZ2V0U2VydmljZShzZXJ2aWNlTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgW3NlcnZpY2VDb25maWddID0gbmV3U2VydmljZXMuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcubmFtZSA9PT0gc2VydmljZU5hbWUpO1xuICAgIGludmFyaWFudChzZXJ2aWNlQ29uZmlnLCBgTm8gY29uZmlnIGZvdW5kIGZvciBzZXJ2aWNlICR7c2VydmljZU5hbWV9YCk7XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICByZXR1cm4gcmVxdWlyZShzZXJ2aWNlQ29uZmlnLmltcGxlbWVudGF0aW9uKTtcbiAgfVxufVxuXG5sZXQgc2VydmljZUxvZ2dlcjogP1NlcnZpY2VMb2dnZXI7XG5mdW5jdGlvbiBnZXRTZXJ2aWNlTG9nZ2VyKCk6IFNlcnZpY2VMb2dnZXIge1xuICBpZiAoIXNlcnZpY2VMb2dnZXIpIHtcbiAgICBzZXJ2aWNlTG9nZ2VyID0gbmV3IFNlcnZpY2VMb2dnZXIoKTtcbiAgICBzZXJ2aWNlTG9nZ2VyLm9uTmV3SXRlbShpdGVtID0+IHtcbiAgICAgIC8vIFRPRE8odDg1Nzk3NDQpOiBMb2cgdGhlc2UgdG8gYSBzZXBhcmF0ZSBmaWxlLiBOb3RlIHRoYXQgd2hhdGV2ZXIgZmlsZSBpcyB1c2VkIHNob3VsZCBhbHNvXG4gICAgICAvLyBiZSBpbmNsdWRlZCBpbiBidWcgcmVwb3J0cy5cbiAgICAgIGxvZ2dlci5kZWJ1ZygnU2VydmljZSBjYWxsOicsIGl0ZW0uc2VydmljZSwgaXRlbS5tZXRob2QsIGl0ZW0uaXNMb2NhbCwgaXRlbS5hcmdJbmZvKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc2VydmljZUxvZ2dlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldFNlcnZpY2UsXG4gIGdldFNlcnZpY2VCeU51Y2xpZGVVcmksXG4gIGdldFNlcnZpY2VMb2dnZXIsXG59O1xuIl19