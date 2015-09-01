'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import invariant from 'assert';

type ParsedUrl = {
  auth: ?string;
  hash: ?string;
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

module.exports = {
  parse(uri: string): ParsedUrl {
    // url.parse seems to apply encodeURI to the uri. We typically don't want this behavior.
    var parsedUri = require('url').parse(uri);
    parsedUri.href = decodeURI(parsedUri.href);

    invariant(parsedUri.path);
    parsedUri.path = decodeURI(parsedUri.path);

    invariant(parsedUri.pathname);
    parsedUri.pathname = decodeURI(parsedUri.pathname);

    return parsedUri;
  },
};
