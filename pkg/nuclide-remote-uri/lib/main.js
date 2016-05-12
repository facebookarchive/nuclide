Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// NuclideUri's are either a local file path, or a URI
// of the form nuclide://<host>:<port><path>
//
// This package creates, queries and decomposes NuclideUris.

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var REMOTE_PATH_URI_PREFIX = 'nuclide://';

function isRemote(uri) {
  return uri.startsWith(REMOTE_PATH_URI_PREFIX);
}

function isLocal(uri) {
  return !isRemote(uri);
}

function createRemoteUri(hostname, remotePort, remotePath) {
  return 'nuclide://' + hostname + ':' + remotePort + remotePath;
}

/**
 * Parses `uri` with Node's `url.parse` and calls `decodeURI` on `href`, `path`, and `pathname` of
 * the parsed URL object.
 *
 * * `url.parse` seems to apply encodeURI to the URL, and we typically don't want this behavior.
 * * Nuclide URIs disallow use of the `hash` attribute, and any hash characters are interpreted as
 *   as literal hashes.
 *
 *   For example:
 *
 *       parse('nuclide://f.co:123/path/to/#foo.txt#')
 *       >
 *         {
 *           ...
 *           path: '/path/to/#foo.txt#',
 *           ...
 *         }
 */
function parse(uri) {
  var parsedUri = (_url2 || _url()).default.parse(uri);

  (0, (_assert2 || _assert()).default)(parsedUri.path, 'Nuclide URIs must contain paths, \'' + parsedUri.path + '\' found while parsing \'' + uri + '\'');
  var path = parsedUri.path;
  // `url.parse` treates the first '#' character as the beginning of the `hash` attribute. That
  // feature is not used in Nuclide and is instead treated as part of the path.
  if (parsedUri.hash != null) {
    path += parsedUri.hash;
  }

  (0, (_assert2 || _assert()).default)(parsedUri.pathname, 'Nuclide URIs must contain pathnamess, \'' + parsedUri.pathname + '\' found while parsing \'' + uri + '\'');
  var pathname = parsedUri.pathname;
  // `url.parse` treates the first '#' character as the beginning of the `hash` attribute. That
  // feature is not used in Nuclide and is instead treated as part of the pathname.
  if (parsedUri.hash != null) {
    pathname += parsedUri.hash;
  }

  // Explicitly copying object properties appeases Flow's "maybe" type handling. Using the `...`
  // operator causes null/undefined errors, and `Object.assign` bypasses type checking.
  return {
    auth: parsedUri.auth,
    host: parsedUri.host,
    hostname: parsedUri.hostname,
    href: decodeURI(parsedUri.href),
    path: decodeURI(path),
    pathname: decodeURI(pathname),
    port: parsedUri.port,
    protocol: parsedUri.protocol,
    query: parsedUri.query,
    search: parsedUri.search,
    slashes: parsedUri.slashes
  };
}

function parseRemoteUri(remoteUri) {
  if (!isRemote(remoteUri)) {
    throw new Error('Expected remote uri. Got ' + remoteUri);
  }
  var parsedUri = parse(remoteUri);
  (0, (_assert2 || _assert()).default)(parsedUri.hostname, 'Remote Nuclide URIs must contain hostnames, \'' + parsedUri.hostname + '\' found ' + ('while parsing \'' + remoteUri + '\''));
  (0, (_assert2 || _assert()).default)(parsedUri.port, 'Remote Nuclide URIs must have port numbers, \'' + parsedUri.port + '\' found ' + ('while parsing \'' + remoteUri + '\''));

  // Explicitly copying object properties appeases Flow's "maybe" type handling. Using the `...`
  // operator causes null/undefined errors, and `Object.assign` bypasses type checking.
  return {
    auth: parsedUri.auth,
    host: parsedUri.host,
    hostname: parsedUri.hostname,
    href: parsedUri.href,
    path: parsedUri.path,
    pathname: parsedUri.pathname,
    port: parsedUri.port,
    protocol: parsedUri.protocol,
    query: parsedUri.query,
    search: parsedUri.search,
    slashes: parsedUri.slashes
  };
}

function getPath(uri) {
  return parse(uri).path;
}

function getHostname(remoteUri) {
  return parseRemoteUri(remoteUri).hostname;
}

function getPort(remoteUri) {
  return Number(parseRemoteUri(remoteUri).port);
}

function join(uri) {
  var uriPathModule = pathModuleFor(uri);

  for (var _len = arguments.length, relativePath = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    relativePath[_key - 1] = arguments[_key];
  }

  if (isRemote(uri)) {
    var _parseRemoteUri = parseRemoteUri(uri);

    var _hostname = _parseRemoteUri.hostname;
    var _port = _parseRemoteUri.port;
    var _path3 = _parseRemoteUri.path;

    relativePath.splice(0, 0, _path3);
    return createRemoteUri(_hostname, Number(_port), uriPathModule.join.apply(null, relativePath));
  } else {
    relativePath.splice(0, 0, uri);
    return uriPathModule.join.apply(null, relativePath);
  }
}

function normalize(uri) {
  var uriPathModule = pathModuleFor(uri);
  if (isRemote(uri)) {
    var _parseRemoteUri2 = parseRemoteUri(uri);

    var _hostname2 = _parseRemoteUri2.hostname;
    var _port2 = _parseRemoteUri2.port;
    var _path4 = _parseRemoteUri2.path;

    return createRemoteUri(_hostname2, Number(_port2), uriPathModule.normalize(_path4));
  } else {
    return uriPathModule.normalize(uri);
  }
}

function getParent(uri) {
  // TODO: Is this different than dirname?
  return normalize(join(uri, '..'));
}

function relative(uri, other) {
  var uriPathModule = pathModuleFor(uri);
  var remote = isRemote(uri);
  if (remote !== isRemote(other) || remote && getHostname(uri) !== getHostname(other)) {
    throw new Error('Cannot relative urls on different hosts: ' + uri + ' and ' + other);
  }
  if (remote) {
    return uriPathModule.relative(getPath(uri), getPath(other));
  } else {
    return uriPathModule.relative(uri, other);
  }
}

// TODO: Add optional ext parameter
function basename(uri) {
  var uriPathModule = pathModuleFor(uri);
  if (isRemote(uri)) {
    return uriPathModule.basename(getPath(uri));
  } else {
    return uriPathModule.basename(uri);
  }
}

function dirname(uri) {
  var uriPathModule = pathModuleFor(uri);
  if (isRemote(uri)) {
    var _parseRemoteUri3 = parseRemoteUri(uri);

    var _hostname3 = _parseRemoteUri3.hostname;
    var _port3 = _parseRemoteUri3.port;
    var _path5 = _parseRemoteUri3.path;

    return createRemoteUri(_hostname3, Number(_port3), uriPathModule.dirname(_path5));
  } else {
    return uriPathModule.dirname(uri);
  }
}

/**
 * uri is either a file: uri, or a nuclide: uri.
 * must convert file: uri's to just a path for atom.
 *
 * Returns null if not a valid file: URI.
 */
function uriToNuclideUri(uri) {
  var urlParts = (_url2 || _url()).default.parse(uri, false);
  if (urlParts.protocol === 'file:' && urlParts.path) {
    // only handle real files for now.
    return urlParts.path;
  } else if (isRemote(uri)) {
    return uri;
  } else {
    return null;
  }
}

/**
 * Converts local paths to file: URI's. Leaves remote URI's alone.
 */
function nuclideUriToUri(uri) {
  if (isRemote(uri)) {
    return uri;
  } else {
    return 'file://' + uri;
  }
}

/**
 * Returns true if child is equal to, or is a proper child of parent.
 */
function contains(parent, child) {
  parent = parent.replace(/\/$/, '');
  child = child.replace(/\/$/, '');
  return child.startsWith(parent) && (child.length === parent.length || child[parent.length] === '/');
}

var hostFormatters = [];

// A formatter which may shorten hostnames.
// Returns null if the formatter won't shorten the hostname.

// Registers a host formatter for nuclideUriToDisplayString
function registerHostnameFormatter(formatter) {
  hostFormatters.push(formatter);
  return {
    dispose: function dispose() {
      var index = hostFormatters.indexOf(formatter);
      if (index >= 0) {
        hostFormatters.splice(index, 1);
      }
    }
  };
}

/**
 * NuclideUris should never be shown to humans.
 * This function returns a human usable string.
 */
function nuclideUriToDisplayString(uri) {
  if (isRemote(uri)) {
    var _hostname4 = getHostname(uri);
    for (var formatter of hostFormatters) {
      var formattedHostname = formatter(_hostname4);
      if (formattedHostname) {
        _hostname4 = formattedHostname;
        break;
      }
    }
    return _hostname4 + '/' + getPath(uri);
  } else {
    return uri;
  }
}

function pathModuleFor(uri) {
  var posixPath = (_path2 || _path()).default.posix;
  var win32Path = (_path2 || _path()).default.win32;

  if (uri.startsWith(posixPath.sep)) {
    return posixPath;
  }
  if (uri.indexOf('://') > -1) {
    return posixPath;
  }
  if (uri[1] === ':' && uri[2] === win32Path.sep) {
    return win32Path;
  }

  if (uri.split(win32Path.sep).length > uri.split(posixPath.sep).length) {
    return win32Path;
  } else {
    return posixPath;
  }
}

module.exports = {
  basename: basename,
  dirname: dirname,
  isRemote: isRemote,
  isLocal: isLocal,
  createRemoteUri: createRemoteUri,
  parse: parse,
  parseRemoteUri: parseRemoteUri,
  getPath: getPath,
  getHostname: getHostname,
  getPort: getPort,
  join: join,
  relative: relative,
  normalize: normalize,
  getParent: getParent,
  uriToNuclideUri: uriToNuclideUri,
  nuclideUriToUri: nuclideUriToUri,
  contains: contains,
  nuclideUriToDisplayString: nuclideUriToDisplayString,
  registerHostnameFormatter: registerHostnameFormatter,
  pathModuleFor: pathModuleFor
};