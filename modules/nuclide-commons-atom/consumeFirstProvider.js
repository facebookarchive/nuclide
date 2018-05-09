'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =
















consumeFirstProvider; /**
                       * Copyright (c) 2017-present, Facebook, Inc.
                       * All rights reserved.
                       *
                       * This source code is licensed under the BSD-style license found in the
                       * LICENSE file in the root directory of this source tree. An additional grant
                       * of patent rights can be found in the PATENTS file in the same directory.
                       *
                       * 
                       * @format
                       */ /**
                           * The module formerly known as "service-hub-plus". Provides a workaround for
                           * https://github.com/atom/service-hub/issues/6
                           */function consumeFirstProvider(keyPath, version = '0.0.0') {return new Promise((resolve, reject) => {const subscription = atom.packages.serviceHub.consume(keyPath, version, provider => {process.nextTick(() => {resolve(provider);subscription.dispose();});});

  });
}