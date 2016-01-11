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

var _serverLibServiceframework = require('../../server/lib/serviceframework');

var _serverLibServiceframework2 = _interopRequireDefault(_serverLibServiceframework);

var _ServiceLogger = require('./ServiceLogger');

var _ServiceLogger2 = _interopRequireDefault(_ServiceLogger);

var logger = require('../../logging').getLogger();

var _require = require('./RemoteConnection');

var RemoteConnection = _require.RemoteConnection;

var _require2 = require('../../remote-uri');

var isRemote = _require2.isRemote;
var getHostname = _require2.getHostname;

var newServices = _serverLibServiceframework2['default'].loadServicesConfig();

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
    var remoteConnection = RemoteConnection.getByHostnameAndPath(hostname, null);
    if (remoteConnection == null) {
      return null;
    }
    return remoteConnection.getService(serviceName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2UtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7c0JBaUJzQixRQUFROzs7O3lDQUNELG1DQUFtQzs7Ozs2QkFDdEMsaUJBQWlCOzs7O0FBTjNDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7ZUFDekIsT0FBTyxDQUFDLG9CQUFvQixDQUFDOztJQUFqRCxnQkFBZ0IsWUFBaEIsZ0JBQWdCOztnQkFDUyxPQUFPLENBQUMsa0JBQWtCLENBQUM7O0lBQXBELFFBQVEsYUFBUixRQUFRO0lBQUUsV0FBVyxhQUFYLFdBQVc7O0FBTTVCLElBQU0sV0FBVyxHQUFHLHVDQUFpQixrQkFBa0IsRUFBRSxDQUFDOzs7Ozs7OztBQVExRCxTQUFTLHNCQUFzQixDQUM3QixXQUFtQixFQUViO01BRE4sVUFBdUIseURBQUcsSUFBSTs7QUFFOUIsTUFBTSxRQUFRLEdBQUcsQUFBQyxVQUFVLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUNsRCxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQ3ZCLElBQUksQ0FBQztBQUNQLFNBQU8sVUFBVSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztDQUMxQzs7Ozs7O0FBTUQsU0FBUyxVQUFVLENBQUMsV0FBbUIsRUFBRSxRQUFpQixFQUFRO0FBQ2hFLE1BQUksUUFBUSxFQUFFO0FBQ1osUUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0UsUUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEVBQUU7QUFDNUIsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELFdBQU8sZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ2pELE1BQU07OEJBQ21CLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQSxNQUFNO2FBQUksTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXO0tBQUEsQ0FBQzs7OztRQUExRSxhQUFhOztBQUNwQiw2QkFBVSxhQUFhLG1DQUFpQyxXQUFXLENBQUcsQ0FBQzs7QUFFdkUsV0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0dBQzlDO0NBQ0Y7O0FBRUQsSUFBSSxhQUE2QixZQUFBLENBQUM7QUFDbEMsU0FBUyxnQkFBZ0IsR0FBa0I7QUFDekMsTUFBSSxDQUFDLGFBQWEsRUFBRTtBQUNsQixpQkFBYSxHQUFHLGdDQUFtQixDQUFDO0FBQ3BDLGlCQUFhLENBQUMsU0FBUyxDQUFDLFVBQUEsSUFBSSxFQUFJOzs7QUFHOUIsWUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3RGLENBQUMsQ0FBQztHQUNKO0FBQ0QsU0FBTyxhQUFhLENBQUM7Q0FDdEI7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFlBQVUsRUFBVixVQUFVO0FBQ1Ysd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0NBQ2pCLENBQUMiLCJmaWxlIjoic2VydmljZS1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5jb25zdCB7UmVtb3RlQ29ubmVjdGlvbn0gPSByZXF1aXJlKCcuL1JlbW90ZUNvbm5lY3Rpb24nKTtcbmNvbnN0IHtpc1JlbW90ZSwgZ2V0SG9zdG5hbWV9ID0gcmVxdWlyZSgnLi4vLi4vcmVtb3RlLXVyaScpO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgU2VydmljZUZyYW1ld29yayBmcm9tICcuLi8uLi9zZXJ2ZXIvbGliL3NlcnZpY2VmcmFtZXdvcmsnO1xuaW1wb3J0IFNlcnZpY2VMb2dnZXIgZnJvbSAnLi9TZXJ2aWNlTG9nZ2VyJztcblxuY29uc3QgbmV3U2VydmljZXMgPSBTZXJ2aWNlRnJhbWV3b3JrLmxvYWRTZXJ2aWNlc0NvbmZpZygpO1xuXG4vKipcbiAqIENyZWF0ZSBvciBnZXQgYSBjYWNoZWQgc2VydmljZS5cbiAqIEBwYXJhbSBudWNsaWRlVXJpIEl0IGNvdWxkIGVpdGhlciBiZSBlaXRoZXIgYSBsb2NhbCBwYXRoIG9yIGEgcmVtb3RlIHBhdGggaW4gZm9ybSBvZlxuICogICAgYG51Y2xpZGU6JGhvc3Q6JHBvcnQvJHBhdGhgLiBUaGUgZnVuY3Rpb24gd2lsbCB1c2UgdGhlICRob3N0IGZyb20gcmVtb3RlIHBhdGggdG9cbiAqICAgIGNyZWF0ZSBhIHJlbW90ZSBzZXJ2aWNlIG9yIGNyZWF0ZSBhIGxvY2FsIHNlcnZpY2UgaWYgdGhlIHVyaSBpcyBsb2NhbCBwYXRoLlxuICovXG5mdW5jdGlvbiBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKFxuICBzZXJ2aWNlTmFtZTogc3RyaW5nLFxuICBudWNsaWRlVXJpOiA/TnVjbGlkZVVyaSA9IG51bGxcbik6ID9hbnkge1xuICBjb25zdCBob3N0bmFtZSA9IChudWNsaWRlVXJpICYmIGlzUmVtb3RlKG51Y2xpZGVVcmkpKSA/XG4gICAgZ2V0SG9zdG5hbWUobnVjbGlkZVVyaSkgOlxuICAgIG51bGw7XG4gIHJldHVybiBnZXRTZXJ2aWNlKHNlcnZpY2VOYW1lLCBob3N0bmFtZSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIG9yIGdldCBhIGNhY2hlZCBzZXJ2aWNlLiBJZiBob3N0bmFtZSBpcyBudWxsIG9yIGVtcHR5IHN0cmluZyxcbiAqIGl0IHJldHVybnMgYSBsb2NhbCBzZXJ2aWNlLCBvdGhlcndpc2UgYSByZW1vdGUgc2VydmljZSB3aWxsIGJlIHJldHVybmVkLlxuICovXG5mdW5jdGlvbiBnZXRTZXJ2aWNlKHNlcnZpY2VOYW1lOiBzdHJpbmcsIGhvc3RuYW1lOiA/c3RyaW5nKTogP2FueSB7XG4gIGlmIChob3N0bmFtZSkge1xuICAgIGNvbnN0IHJlbW90ZUNvbm5lY3Rpb24gPSBSZW1vdGVDb25uZWN0aW9uLmdldEJ5SG9zdG5hbWVBbmRQYXRoKGhvc3RuYW1lLCBudWxsKTtcbiAgICBpZiAocmVtb3RlQ29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHJlbW90ZUNvbm5lY3Rpb24uZ2V0U2VydmljZShzZXJ2aWNlTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgW3NlcnZpY2VDb25maWddID0gbmV3U2VydmljZXMuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcubmFtZSA9PT0gc2VydmljZU5hbWUpO1xuICAgIGludmFyaWFudChzZXJ2aWNlQ29uZmlnLCBgTm8gY29uZmlnIGZvdW5kIGZvciBzZXJ2aWNlICR7c2VydmljZU5hbWV9YCk7XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICByZXR1cm4gcmVxdWlyZShzZXJ2aWNlQ29uZmlnLmltcGxlbWVudGF0aW9uKTtcbiAgfVxufVxuXG5sZXQgc2VydmljZUxvZ2dlcjogP1NlcnZpY2VMb2dnZXI7XG5mdW5jdGlvbiBnZXRTZXJ2aWNlTG9nZ2VyKCk6IFNlcnZpY2VMb2dnZXIge1xuICBpZiAoIXNlcnZpY2VMb2dnZXIpIHtcbiAgICBzZXJ2aWNlTG9nZ2VyID0gbmV3IFNlcnZpY2VMb2dnZXIoKTtcbiAgICBzZXJ2aWNlTG9nZ2VyLm9uTmV3SXRlbShpdGVtID0+IHtcbiAgICAgIC8vIFRPRE8odDg1Nzk3NDQpOiBMb2cgdGhlc2UgdG8gYSBzZXBhcmF0ZSBmaWxlLiBOb3RlIHRoYXQgd2hhdGV2ZXIgZmlsZSBpcyB1c2VkIHNob3VsZCBhbHNvXG4gICAgICAvLyBiZSBpbmNsdWRlZCBpbiBidWcgcmVwb3J0cy5cbiAgICAgIGxvZ2dlci5kZWJ1ZygnU2VydmljZSBjYWxsOicsIGl0ZW0uc2VydmljZSwgaXRlbS5tZXRob2QsIGl0ZW0uaXNMb2NhbCwgaXRlbS5hcmdJbmZvKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc2VydmljZUxvZ2dlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldFNlcnZpY2UsXG4gIGdldFNlcnZpY2VCeU51Y2xpZGVVcmksXG4gIGdldFNlcnZpY2VMb2dnZXIsXG59O1xuIl19