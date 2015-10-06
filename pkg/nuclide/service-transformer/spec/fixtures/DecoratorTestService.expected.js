'use babel';
Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var TestService = require('REQUIRE_PLACE_HOLDER').TestService || require('REQUIRE_PLACE_HOLDER');

/* Auto-generated: DO NOT MODIFY.*/
class DecoratorTestService extends TestService {
  constructor(delegate, serviceLogger) {
    super();
    this._delegate = delegate;
    this._serviceLogger = serviceLogger;
  }
  foo() {
    this._serviceLogger.logServiceCall('TestService', 'foo', true);

    return this._delegate.foo();
  }
  bar(arg0) {
    this._serviceLogger.logServiceCall('TestService', 'bar', true, arg0);

    return this._delegate.bar(arg0);
  }
  qux(arg0, arg1) {
    this._serviceLogger.logServiceCall('TestService', 'qux', true, arg0, arg1);

    return this._delegate.qux(arg0, arg1);
  }
  onNorf(callback) {
    this._serviceLogger.logServiceCall('TestService', 'onNorf', true, callback);

    return this._delegate.onNorf(callback);
  }
  onetimeRegistration(arg0) {
    this._serviceLogger.logServiceCall('TestService', 'onetimeRegistration', true, arg0);

    return this._delegate.onetimeRegistration(arg0);
  }
}

module.exports = DecoratorTestService;

// $FlowIssue t8486988
