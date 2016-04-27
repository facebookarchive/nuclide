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