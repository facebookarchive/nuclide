'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NestedNuclideTypedTestService = require('REQUIRE_PLACE_HOLDER');

/* Auto-generated: DO NOT MODIFY.*/
class RemoteNestedNuclideTypedTestService extends NestedNuclideTypedTestService {
  constructor(connection, options) {
    super();
    this._connection = connection;
    this._options = options;
  }
  foo(a: ?NuclideUri, b: ?Array<NuclideUri>, c: { a: ?NuclideUri }, d: ?{ a: ?NuclideUri }) {
    if (a !== null) {
      a = this._connection.getPathOfUri(a);
    }

    if (b !== null) {
      b = b.map(item => {
        item = this._connection.getPathOfUri(item);
        return item;
      });
    }

    c = obj => {
      if (obj.a !== null) {
        obj.a = this._connection.getPathOfUri(obj.a);
      }

      return obj;
    }(c);

    if (d !== null) {
      d = obj => {
        if (obj.a !== null) {
          obj.a = this._connection.getPathOfUri(obj.a);
        }

        return obj;
      }(d);
    }

    return this._connection.makeRpc('NestedNuclideTypedTestService/foo', [a, b, c, d], this._options).then(result => {
      if (result !== null) {
        result = this._connection.getUriOfRemotePath(result);
      }

      return result;
    });
  }
  baz(a: { a: NuclideUri }, b: Array<NuclideUri>, c: number) {
    a = obj => {
      obj.a = this._connection.getPathOfUri(obj.a);
      return obj;
    }(a);

    b = b.map(item => {
      item = this._connection.getPathOfUri(item);
      return item;
    });
    return this._connection.makeRpc('NestedNuclideTypedTestService/baz', [a, b, c], this._options).then(result => {
      result = result.map(item => {
        item = this._connection.getUriOfRemotePath(item);
        return item;
      });
      return result;
    });
  }
  onNorf(callback: (payload: { file: NuclideUri }) => void) {
    var _callback = payload => {
      payload = obj => {
        obj.file = this._connection.getUriOfRemotePath(obj.file);
        return obj;
      }(payload);

      return callback(payload);
    };

    return this._connection.registerEventListener('NestedNuclideTypedTestService/onNorf', _callback, this._options);
  }
  onOops(callback: (payload: { file: NuclideUri }, wat: number) => void) {
    var _callback = (payload, wat) => {
      payload = obj => {
        obj.file = this._connection.getUriOfRemotePath(obj.file);
        return obj;
      }(payload);

      return callback(payload, wat);
    };

    return this._connection.registerEventListener('NestedNuclideTypedTestService/onOops', _callback, this._options);
  }
  onWoot(callback: (payload: { file: NuclideUri }, woot: NuclideUri) => void) {
    var _callback = (payload, woot) => {
      payload = obj => {
        obj.file = this._connection.getUriOfRemotePath(obj.file);
        return obj;
      }(payload);

      woot = this._connection.getUriOfRemotePath(woot);
      return callback(payload, woot);
    };

    return this._connection.registerEventListener('NestedNuclideTypedTestService/onWoot', _callback, this._options);
  }
}

module.exports = RemoteNestedNuclideTypedTestService;
