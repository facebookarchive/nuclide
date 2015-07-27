'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type ParsedUrl = {
  href: string;
  protocol: string;
  slashes: boolean;
  host?: string;
  auth?: string;
  hostname?: string;
  port?: string;
  pathname: string;
  search?: string;
  path: string;
  query?: string;
  hash?: string;
};

module.exports = {
  parse(uri: string): ParsedUrl {
    // url.parse seems to apply encodeURI to the uri. We typically don't want this behavior.
    var parsedUri = require('url').parse(uri);
    parsedUri.href = decodeURI(parsedUri.href);
    parsedUri.path = decodeURI(parsedUri.path);
    parsedUri.pathname = decodeURI(parsedUri.pathname);
    return parsedUri;
  }
};
