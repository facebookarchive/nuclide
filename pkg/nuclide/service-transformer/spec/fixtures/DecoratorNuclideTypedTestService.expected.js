'use babel';


/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NuclideTypedTestService = require('REQUIRE_PLACE_HOLDER').NuclideTypedTestService || require('REQUIRE_PLACE_HOLDER');

/* Auto-generated: DO NOT MODIFY.*/
class DecoratorNuclideTypedTestService extends NuclideTypedTestService {
  constructor(delegate, serviceLogger) {
    super();
    this._delegate = delegate;
    this._serviceLogger = serviceLogger;
  }
  foo(arg0, arg1) {
    this._serviceLogger.logServiceCall('NuclideTypedTestService', 'foo', true, arg0, arg1);

    return this._delegate.foo(arg0, arg1);
  }
  bar(arg0) {
    this._serviceLogger.logServiceCall('NuclideTypedTestService', 'bar', true, arg0);

    return this._delegate.bar(arg0);
  }
  baz(arg0, arg1) {
    this._serviceLogger.logServiceCall('NuclideTypedTestService', 'baz', true, arg0, arg1);

    return this._delegate.baz(arg0, arg1);
  }
  onNorf(callback) {
    this._serviceLogger.logServiceCall('NuclideTypedTestService', 'onNorf', true, callback);

    return this._delegate.onNorf(callback);
  }
}

module.exports = DecoratorNuclideTypedTestService;
