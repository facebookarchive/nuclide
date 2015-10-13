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
  hash: ?string;
  href: string;
  host: ?string;
  // $FlowFixMe
  hostname: ?string;
  path: string;
  pathname: string;
  // $FlowFixMe
  port: ?string;
  protocol: ?string;
  query: ?any;
  search: ?string;
  slashes: ?boolean;
};

import invariant from 'assert';
import pathPackage from 'path';

var REMOTE_PATH_URI_PREFIX = 'nuclide://';

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
 * `url.parse` seems to apply encodeURI to the URL, and we typically don't want this behavior.
 */
function parse(uri: NuclideUri): ParsedUrl {
  // $FlowFixMe
  var parsedUri = require('url').parse(uri);
  parsedUri.href = decodeURI(parsedUri.href);

  invariant(parsedUri.path);
  parsedUri.path = decodeURI(parsedUri.path);

  invariant(parsedUri.pathname);
  parsedUri.pathname = decodeURI(parsedUri.pathname);

  return parsedUri;
}

function parseRemoteUri(remoteUri: NuclideUri): { hostname: string; port: string; path: string; } {
  if (!isRemote(remoteUri)) {
    throw new Error('Expected remote uri. Got ' + remoteUri);
  }
  return parse(remoteUri);
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

function join(uri: NuclideUri, ...relativePath: Array<string>) {
  if (isRemote(uri)) {
    var {hostname, port, path} = parseRemoteUri(uri);
    relativePath.splice(0, 0, path);
    return createRemoteUri(
      hostname,
      Number(port),
      pathPackage.join.apply(null, relativePath));
  } else {
    relativePath.splice(0, 0, uri);
    return pathPackage.join.apply(null, relativePath);
  }
}

function normalize(uri: NuclideUri): NuclideUri {
  if (isRemote(uri)) {
    var {hostname, port, path} = parseRemoteUri(uri);
    return createRemoteUri(
      hostname,
      Number(port),
      pathPackage.normalize(path));
  } else {
    return pathPackage.normalize(uri);
  }
}

function getParent(uri: NuclideUri): NuclideUri {
  // TODO: Is this different than dirname?
  return normalize(join(uri, '..'));
}

function relative(uri: NuclideUri, other: NuclideUri): string {
  var remote = isRemote(uri);
  if (remote !== isRemote(other) ||
      (remote && getHostname(uri) !== getHostname(other))) {
    throw new Error('Cannot relative urls on different hosts.');
  }
  if (remote) {
    return pathPackage.relative(getPath(uri), getPath(other));
  } else {
    return pathPackage.relative(uri, other);
  }
}

// TODO: Add optional ext parameter
function basename(uri: NuclideUri): NuclideUri {
  if (isRemote(uri)) {
    return pathPackage.basename(getPath(uri));
  } else {
    return pathPackage.basename(uri);
  }
}

function dirname(uri: NuclideUri): NuclideUri {
  if (isRemote(uri)) {
    var {hostname, port, path} = parseRemoteUri(uri);
    return createRemoteUri(
      hostname,
      Number(port),
      pathPackage.dirname(path));
  } else {
    return pathPackage.dirname(uri);
  }
}

/**
 * uri is either a file: uri, or a nuclide: uri.
 * must convert file: uri's to just a path for atom.
 *
 * Returns null if not a valid file: URI.
 */
function uriToNuclideUri(uri: string): ?string {
  var urlParts = require('url').parse(uri, false);
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
};
