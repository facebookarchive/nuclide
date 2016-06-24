Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.split = split;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// NuclideUri's are either a local file path, or a URI
// of the form nuclide://<host><path>
//
// This package creates, queries and decomposes NuclideUris.

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri

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

function createRemoteUri(hostname, remotePath) {
  return 'nuclide://' + hostname + remotePath;
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
 *       parse('nuclide://f.co/path/to/#foo.txt#')
 *       >
 *         {
 *           ...
 *           path: '/path/to/#foo.txt#',
 *           ...
 *         }
 */
function parse(uri) {
  if (isLocal(uri)) {
    return {
      auth: null,
      host: null,
      hostname: null,
      href: uri,
      path: uri,
      pathname: uri,
      protocol: null,
      query: null,
      search: null,
      slashes: null
    };
  }

  var parsedUri = (_url2 || _url()).default.parse(_escapeBackslashes(uri));

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

  // Explicitly copying object properties appeases Flow's "maybe" type handling. Using the `...`
  // operator causes null/undefined errors, and `Object.assign` bypasses type checking.
  return {
    auth: parsedUri.auth,
    host: parsedUri.host,
    hostname: parsedUri.hostname,
    href: parsedUri.href,
    path: parsedUri.path,
    pathname: parsedUri.pathname,
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

function getHostnameOpt(remoteUri) {
  if (remoteUri == null || isLocal(remoteUri)) {
    return null;
  }

  return getHostname(remoteUri);
}

function join(uri) {
  var uriPathModule = _pathModuleFor(uri);

  for (var _len = arguments.length, relativePath = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    relativePath[_key - 1] = arguments[_key];
  }

  if (isRemote(uri)) {
    var _parseRemoteUri = parseRemoteUri(uri);

    var _hostname = _parseRemoteUri.hostname;
    var _path3 = _parseRemoteUri.path;

    relativePath.splice(0, 0, _path3);
    return createRemoteUri(_hostname, uriPathModule.join.apply(null, relativePath));
  } else {
    relativePath.splice(0, 0, uri);
    return uriPathModule.join.apply(null, relativePath);
  }
}

function normalize(uri) {
  var uriPathModule = _pathModuleFor(uri);
  if (isRemote(uri)) {
    var _parseRemoteUri2 = parseRemoteUri(uri);

    var _hostname2 = _parseRemoteUri2.hostname;
    var _path4 = _parseRemoteUri2.path;

    return createRemoteUri(_hostname2, uriPathModule.normalize(_path4));
  } else {
    return uriPathModule.normalize(uri);
  }
}

function normalizeDir(uri) {
  return ensureTrailingSeparator(normalize(uri));
}

function getParent(uri) {
  // TODO: Is this different than dirname?
  return normalize(join(uri, '..'));
}

function relative(uri, other) {
  var uriPathModule = _pathModuleFor(uri);
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

function basename(uri) {
  var ext = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  var uriPathModule = _pathModuleFor(uri);
  return uriPathModule.basename(getPath(uri), ext);
}

function dirname(uri) {
  var uriPathModule = _pathModuleFor(uri);
  if (isRemote(uri)) {
    var _parseRemoteUri3 = parseRemoteUri(uri);

    var _hostname3 = _parseRemoteUri3.hostname;
    var _path5 = _parseRemoteUri3.path;

    return createRemoteUri(_hostname3, uriPathModule.dirname(_path5));
  } else {
    return uriPathModule.dirname(uri);
  }
}

function extname(uri) {
  var uriPathModule = _pathModuleFor(uri);
  return uriPathModule.extname(getPath(uri));
}

function stripExtension(uri) {
  var ext = extname(uri);
  if (ext.length === 0) {
    return uri;
  }

  return uri.slice(0, -1 * ext.length);
}

/**
 * uri is either a file: uri, or a nuclide: uri.
 * must convert file: uri's to just a path for atom.
 *
 * Returns null if not a valid file: URI.
 */
function uriToNuclideUri(uri) {
  var urlParts = (_url2 || _url()).default.parse(_escapeBackslashes(uri), false);
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
  // Can't just do startsWith here. If this directory is "www" and you
  // are trying to check "www-base", just using startsWith would return
  // true, even though "www-base" is at the same level as "Www", not
  // contained in it.
  // Also, there's an issue with a trailing separator ambiguity. A path
  // like /abc/ does contain /abc
  // This function is used in some performance-sensitive parts, so we
  // want to avoid doing unnecessary string copy, as those that would
  // result from an ensureTrailingSeparator() call
  //
  // First we'll check the lengths.
  // Then check startsWith. If so, then if the two path lengths are
  // equal OR if the next character in the path to check is a path
  // separator, then we know the checked path is in this path.

  if (child.length < parent.length) {
    // A strong indication of false
    // It could be a matter of a trailing separator, though
    if (child.length < parent.length - 1) {
      // It must be more than just the separator
      return false;
    }

    return endsWithSeparator(parent) && parent.startsWith(child);
  }

  if (!child.startsWith(parent)) {
    return false;
  }

  if (endsWithSeparator(parent) || parent.length === child.length) {
    return true;
  }

  var uriPathModule = _pathModuleFor(child);
  return child.slice(parent.length).startsWith(uriPathModule.sep);
}

/**
 * Filter an array of paths to contain only the collapsed root paths, e.g.
 * [a/b/c, a/, c/d/, c/d/e] collapses to [a/, c/d/]
 */
function collapse(paths) {
  return paths.filter(function (p) {
    return !paths.some(function (fp) {
      return contains(fp, p) && fp !== p;
    });
  });
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

function ensureTrailingSeparator(uri) {
  var uriPathModule = _pathModuleFor(uri);
  if (uri.endsWith(uriPathModule.sep)) {
    return uri;
  }

  return uri + uriPathModule.sep;
}

function trimTrailingSeparator(uri) {
  var uriPathModule = _pathModuleFor(uri);
  var stripped = uri;

  while (stripped.endsWith(uriPathModule.sep) && !isRoot(stripped)) {
    stripped = stripped.slice(0, -1 * uriPathModule.sep.length);
  }

  return stripped;
}

function endsWithSeparator(uri) {
  var uriPathModule = _pathModuleFor(uri);
  return uri.endsWith(uriPathModule.sep);
}

function isAbsolute(uri) {
  if (isRemote(uri)) {
    return true;
  } else {
    return _pathModuleFor(uri).isAbsolute(uri);
  }
}

function resolve(uri) {
  var uriPathModule = _pathModuleFor(uri);

  for (var _len2 = arguments.length, paths = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    paths[_key2 - 1] = arguments[_key2];
  }

  if (isRemote(uri)) {
    var _parseRemoteUri4 = parseRemoteUri(uri);

    var _hostname5 = _parseRemoteUri4.hostname;
    var _path6 = _parseRemoteUri4.path;

    paths.splice(0, 0, _path6);
    return createRemoteUri(_hostname5, uriPathModule.resolve.apply(null, paths));
  } else {
    paths.splice(0, 0, uri);
    return uriPathModule.resolve.apply(null, paths);
  }
}

function expandHomeDir(uri) {
  // This function is POSIX only functionality, so using the posix path directly

  // Do not expand non home relative uris
  if (!uri.startsWith('~')) {
    return uri;
  }

  var HOME = process.env.HOME;

  (0, (_assert2 || _assert()).default)(HOME != null);

  if (uri === '~') {
    return HOME;
  }

  // Uris like ~abc should not be expanded
  if (!uri.startsWith('~/')) {
    return uri;
  }

  return (_path2 || _path()).default.posix.resolve(HOME, uri.replace('~', '.'));
}

/**
 * Splits a string containing local paths by an OS-specific path delimiter
 * Useful for splitting env variables such as PATH
 *
 * Since remote URI might contain the delimiter, only local paths are allowed.
 */
function splitPathList(paths) {
  (0, (_assert2 || _assert()).default)(paths.indexOf(REMOTE_PATH_URI_PREFIX) < 0, 'Splitting remote URIs is not supported');
  var pathsModule = _pathModuleFor(paths);

  return paths.split(pathsModule.delimiter);
}

/**
 * Joins an array of local paths with an OS-specific path delimiter into a single string.
 * Useful for constructing env variables such as PATH
 *
 * Since remote URI might contain the delimiter, only local paths are allowed.
 */
function joinPathList(paths) {
  if (paths.length === 0) {
    return '';
  }

  (0, (_assert2 || _assert()).default)(paths.every(function (path) {
    return !isRemote(path);
  }), 'Joining of remote URIs is not supported');

  var uriPathModule = _pathModuleFor(paths[0]);
  return paths.join(uriPathModule.delimiter);
}

/**
 * This function prepends the given relative path with a "current-folder" prefix
 * which is `./` on *nix and .\ on Windows
 */
function ensureLocalPrefix(uri) {
  var uriPathModule = _pathModuleFor(uri);

  (0, (_assert2 || _assert()).default)(!isRemote(uri), 'Local prefix can not be added to a remote path');
  (0, (_assert2 || _assert()).default)(!isAbsolute(uri), 'Local prefix can not be added to an absolute path');

  var localPrefix = '.' + uriPathModule.sep;
  if (uri.startsWith(localPrefix)) {
    return uri;
  }

  return localPrefix + uri;
}

function isRoot(uri) {
  return dirname(uri) === uri;
}

function parsePath(uri) {
  var uriPathModule = _pathModuleFor(uri);
  return uriPathModule.parse(getPath(uri));
}

function split(uri) {
  var parts = [];
  var current = uri;
  var parent = dirname(current);

  while (current !== parent) {
    parts.push(basename(current));

    current = parent;
    parent = dirname(current);
  }

  if (isAbsolute(uri)) {
    parts.push(parent);
  }
  parts.reverse();
  return parts;
}

function _pathModuleFor(uri) {
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

/**
 * The backslash character (\) is unfortunately a valid symbol to be used in POSIX paths.
 * It, however, is being automatically "corrected" by node's `url.parse()` method if not escaped
 * properly.
 */
function _escapeBackslashes(uri) {
  return uri.replace(/\\/g, '%5C');
}

exports.default = {
  basename: basename,
  dirname: dirname,
  extname: extname,
  stripExtension: stripExtension,
  isRemote: isRemote,
  isLocal: isLocal,
  createRemoteUri: createRemoteUri,
  parse: parse,
  parseRemoteUri: parseRemoteUri,
  getPath: getPath,
  getHostname: getHostname,
  getHostnameOpt: getHostnameOpt,
  join: join,
  relative: relative,
  normalize: normalize,
  normalizeDir: normalizeDir,
  getParent: getParent,
  uriToNuclideUri: uriToNuclideUri,
  nuclideUriToUri: nuclideUriToUri,
  contains: contains,
  collapse: collapse,
  nuclideUriToDisplayString: nuclideUriToDisplayString,
  registerHostnameFormatter: registerHostnameFormatter,
  ensureTrailingSeparator: ensureTrailingSeparator,
  trimTrailingSeparator: trimTrailingSeparator,
  endsWithSeparator: endsWithSeparator,
  isAbsolute: isAbsolute,
  resolve: resolve,
  expandHomeDir: expandHomeDir,
  splitPathList: splitPathList,
  joinPathList: joinPathList,
  ensureLocalPrefix: ensureLocalPrefix,
  isRoot: isRoot,
  parsePath: parsePath,
  split: split,
  _pathModuleFor: _pathModuleFor };
// Exported for tests only