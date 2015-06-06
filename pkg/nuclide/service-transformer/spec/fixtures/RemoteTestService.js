'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var TestService = require('REQUIRE_PLACE_HOLDER');

/* Auto-generated: DO NOT MODIFY.*/
class RemoteTestService extends TestService {
  constructor(connection, options) {
    super();
    this._connection = connection;
    this._options = options;
  }
  foo() {
    return this._connection.makeRpc('TestService/foo', [], this._options);
  }
  bar(arg0: string) {
    return this._connection.makeRpc('TestService/bar', [arg0], this._options);
  }
  qux(arg0: string, arg1: number) {
    return this._connection.makeRpc('TestService/qux', [arg0, arg1], this._options);
  }
  onNorf(callback: (payload: any) => void) {
    return this._connection.registerEventListener('TestService/onNorf', callback, this._options);
  }
  onetimeRegistration(arg0: string) {
    return this._connection.makeRpc('TestService/onetimeRegistration', [arg0], this._options);
  }
}

module.exports = RemoteTestService;
