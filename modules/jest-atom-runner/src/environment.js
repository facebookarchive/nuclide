'use strict';var _jestEnvironmentJsdom;













function _load_jestEnvironmentJsdom() {return _jestEnvironmentJsdom = _interopRequireDefault(require('jest-environment-jsdom'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class Atom extends (_jestEnvironmentJsdom || _load_jestEnvironmentJsdom()).default {
  constructor(...args) {
    super(...args);
    this.global.atom = global.atom;
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      * 
      * @format
      */ /* eslint-disable nuclide-internal/no-commonjs */module.exports = Atom;