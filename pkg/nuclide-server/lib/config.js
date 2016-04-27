

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
  * Currently we have two different ways to config a service in service-config.json:
  *   1. `{"useServiceFramework": false, "path": "path/to/service/file"}`, a old fashioned way
  *      to config a service and it is deprecated.
  *   2. `{"useServiceFramework": true,
  *        "definition": "path/to/service/defintion",
  *        "implementation": "path/to/local/implementation"}, use service framework to config
  *      a service definition and a local implementation.
  */

var HEARTBEAT_CHANNEL = 'heartbeat';
var SERVICE_FRAMEWORK3_CHANNEL = 'service_framework3_rpc';
var SERVICE_FRAMEWORK_RPC_TIMEOUT_MS = 60 * 1000;

module.exports = {
  HEARTBEAT_CHANNEL: HEARTBEAT_CHANNEL,
  SERVICE_FRAMEWORK_RPC_TIMEOUT_MS: SERVICE_FRAMEWORK_RPC_TIMEOUT_MS,
  SERVICE_FRAMEWORK3_CHANNEL: SERVICE_FRAMEWORK3_CHANNEL
};