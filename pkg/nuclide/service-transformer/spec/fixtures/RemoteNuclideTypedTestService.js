'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NuclideTypedTestService = require('REQUIRE_PLACE_HOLDER');

/* Auto-generated: DO NOT MODIFY.*/
class RemoteNuclideTypedTestService extends NuclideTypedTestService {
  constructor(connection, options) {
    super();
    this._connection = connection;
    this._options = options;
  }
  foo(arg0: NuclideUri, arg1: string) {
    arg0 = this._connection.getPathOfUri(arg0);
    return this._connection.makeRpc('NuclideTypedTestService/foo', [arg0, arg1], this._options);
  }
  bar(arg0: string) {
    return this._connection.makeRpc('NuclideTypedTestService/bar', [arg0], this._options).then(result => {
      result = this._connection.getUriOfRemotePath(result);
      return result;
    });
  }
  baz(arg0: NuclideUri, arg1: number) {
    arg0 = this._connection.getPathOfUri(arg0);
    return this._connection.makeRpc('NuclideTypedTestService/baz', [arg0, arg1], this._options).then(result => {
      result = this._connection.getUriOfRemotePath(result);
      return result;
    });
  }
  onNorf(callback: (payload: NuclideUri) => void) {
    var _callback = payload => {
      payload = this._connection.getUriOfRemotePath(payload);
      return callback(payload);
    };

    return this._connection.registerEventListener('NuclideTypedTestService/onNorf', _callback, this._options);
  }
}

module.exports = RemoteNuclideTypedTestService;
