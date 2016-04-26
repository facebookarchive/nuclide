'use babel';
/* @flow */

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

export type NuclideUri = string;

type ParsedUrl = {
  auth: ?string;
  href: string;
  host: ?string;
  hostname: ?string;
  path: string;
  pathname: string;
  port: ?string;
  protocol: ?string;
  query: ?any;
  search: ?string;
  slashes: ?boolean;
};

type ParsedRemoteUrl = {
  auth: ?string;
  href: string;
  host: ?string;
  hostname: string;
  path: string;
  pathname: string;
  port: string;
  protocol: ?string;
  query: ?any;
  search: ?string;
  slashes: ?boolean;
};

import invariant from 'assert';
import pathModule from 'path';

import url from 'url';

const REMOTE_PATH_URI_PREFIX = 'nuclide://';

function isRemote(uri: NuclideUri): boolean {
  return uri.startsWith(REMOTE_PATH_URI_PREFIX);
}

function isLocal(uri: NuclideUri): boolean {
  return !isRemote(uri);
}

function createRemoteUri(hostname: string, remotePort: number, remotePath: string): string {
  return `nuclide://${hostname}:${remotePort}${remotePath}`;
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
function parse(uri: NuclideUri): ParsedUrl {
  const parsedUri = url.parse(uri);

  invariant(
    parsedUri.path,
    `Nuclide URIs must contain paths, '${parsedUri.path}' found while parsing '${uri}'`
  );
  let path = parsedUri.path;
  // `url.parse` treates the first '#' character as the beginning of the `hash` attribute. That
  // feature is not used in Nuclide and is instead treated as part of the path.
  if (parsedUri.hash != null) {
    path += parsedUri.hash;
  }

  invariant(
    parsedUri.pathname,
    `Nuclide URIs must contain pathnamess, '${parsedUri.pathname}' found while parsing '${uri}'`
  );
  let pathname = parsedUri.pathname;
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
    slashes: parsedUri.slashes,
  };
}

function parseRemoteUri(remoteUri: NuclideUri): ParsedRemoteUrl {
  if (!isRemote(remoteUri)) {
    throw new Error('Expected remote uri. Got ' + remoteUri);
  }
  const parsedUri = parse(remoteUri);
  invariant(
    parsedUri.hostname,
    `Remote Nuclide URIs must contain hostnames, '${parsedUri.hostname}' found ` +
    `while parsing '${remoteUri}'`
  );
  invariant(
    parsedUri.port,
    `Remote Nuclide URIs must have port numbers, '${parsedUri.port}' found ` +
    `while parsing '${remoteUri}'`
  );

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
    slashes: parsedUri.slashes,
  };
}

function getPath(uri: NuclideUri): string {
  return parse(uri).path;
}

function getHostname(remoteUri: NuclideUri): string {
  return parseRemoteUri(remoteUri).hostname;
}

function getPort(remoteUri: NuclideUri): number {
  return Number(parseRemoteUri(remoteUri).port);
}

function join(uri: NuclideUri, ...relativePath: Array<string>): NuclideUri {
  const uriPathModule = pathModuleFor(uri);
  if (isRemote(uri)) {
    const {hostname, port, path} = parseRemoteUri(uri);
    relativePath.splice(0, 0, path);
    return createRemoteUri(
      hostname,
      Number(port),
      uriPathModule.join.apply(null, relativePath));
  } else {
    relativePath.splice(0, 0, uri);
    return uriPathModule.join.apply(null, relativePath);
  }
}

function normalize(uri: NuclideUri): NuclideUri {
  const uriPathModule = pathModuleFor(uri);
  if (isRemote(uri)) {
    const {hostname, port, path} = parseRemoteUri(uri);
    return createRemoteUri(
      hostname,
      Number(port),
      uriPathModule.normalize(path)
    );
  } else {
    return uriPathModule.normalize(uri);
  }
}

function getParent(uri: NuclideUri): NuclideUri {
  // TODO: Is this different than dirname?
  return normalize(join(uri, '..'));
}

function relative(uri: NuclideUri, other: NuclideUri): string {
  const uriPathModule = pathModuleFor(uri);
  const remote = isRemote(uri);
  if (remote !== isRemote(other) ||
      (remote && getHostname(uri) !== getHostname(other))) {
    throw new Error(`Cannot relative urls on different hosts: ${uri} and ${other}`);
  }
  if (remote) {
    return uriPathModule.relative(getPath(uri), getPath(other));
  } else {
    return uriPathModule.relative(uri, other);
  }
}

// TODO: Add optional ext parameter
function basename(uri: NuclideUri): NuclideUri {
  const uriPathModule = pathModuleFor(uri);
  if (isRemote(uri)) {
    return uriPathModule.basename(getPath(uri));
  } else {
    return uriPathModule.basename(uri);
  }
}

function dirname(uri: NuclideUri): NuclideUri {
  const uriPathModule = pathModuleFor(uri);
  if (isRemote(uri)) {
    const {hostname, port, path} = parseRemoteUri(uri);
    return createRemoteUri(
      hostname,
      Number(port),
      uriPathModule.dirname(path)
    );
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
function uriToNuclideUri(uri: string): ?string {
  const urlParts = url.parse(uri, false);
  if (urlParts.protocol === 'file:' && urlParts.path) { // only handle real files for now.
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
function nuclideUriToUri(uri: NuclideUri): string {
  if (isRemote(uri)) {
    return uri;
  } else {
    return 'file://' + uri;
  }
}

/**
 * Returns true if child is equal to, or is a proper child of parent.
 */
function contains(parent: NuclideUri, child: NuclideUri): boolean {
  parent = parent.replace(/\/$/, '');
  child = child.replace(/\/$/, '');
  return child.startsWith(parent)
    && (child.length === parent.length || child[parent.length] === '/');
}

const hostFormatters = [];

// A formatter which may shorten hostnames.
// Returns null if the formatter won't shorten the hostname.
export type HostnameFormatter = (uri: NuclideUri) => ?string;

// Registers a host formatter for nuclideUriToDisplayString
function registerHostnameFormatter(formatter: HostnameFormatter):
    {dispose: () => void} {
  hostFormatters.push(formatter);
  return {
    dispose: () => {
      const index = hostFormatters.indexOf(formatter);
      if (index >= 0) {
        hostFormatters.splice(index, 1);
      }
    },
  };
}

/**
 * NuclideUris should never be shown to humans.
 * This function returns a human usable string.
 */
function nuclideUriToDisplayString(uri: NuclideUri): string {
  if (isRemote(uri)) {
    let hostname = getHostname(uri);
    for (const formatter of hostFormatters) {
      const formattedHostname = formatter(hostname);
      if (formattedHostname) {
        hostname = formattedHostname;
        break;
      }
    }
    return `${hostname}/${getPath(uri)}`;
  } else {
    return uri;
  }
}

function pathModuleFor(uri: NuclideUri): any {
  const posixPath = pathModule.posix;
  const win32Path = pathModule.win32;

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
  basename,
  dirname,
  isRemote,
  isLocal,
  createRemoteUri,
  parse,
  parseRemoteUri,
  getPath,
  getHostname,
  getPort,
  join,
  relative,
  normalize,
  getParent,
  uriToNuclideUri,
  nuclideUriToUri,
  contains,
  nuclideUriToDisplayString,
  registerHostnameFormatter,
  pathModuleFor,
};
