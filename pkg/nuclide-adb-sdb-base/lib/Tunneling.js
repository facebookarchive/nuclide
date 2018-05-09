'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.
























startTunnelingAdb = startTunnelingAdb;exports.



































stopTunnelingAdb = stopTunnelingAdb;exports.




isAdbTunneled = isAdbTunneled;var _SimpleCache;function _load_SimpleCache() {return _SimpleCache = require('nuclide-commons/SimpleCache');}var _nullthrows;function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));}var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _consumeFirstProvider;function _load_consumeFirstProvider() {return _consumeFirstProvider = _interopRequireDefault(require('nuclide-commons-atom/consumeFirstProvider'));}var _utils;function _load_utils() {return _utils = require('nuclide-adb/lib/utils');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */ /* eslint-disable no-param-reassign */function startTunnelingAdb(uri, retries = 0) {if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {return _rxjsBundlesRxMinJs.Observable.of('ready').concat(_rxjsBundlesRxMinJs.Observable.never());}const { tunnels } = activeTunnels.getOrCreate(uri, (_, serviceUri) => {if (!(typeof serviceUri === 'string')) {throw new Error('Invariant violation: "typeof serviceUri === \'string\'"');}const adbService = (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(serviceUri);const observable = _rxjsBundlesRxMinJs.Observable.defer(() => adbService.killServer()).switchMap(() => openTunnels(serviceUri)).retryWhen(errors => {return errors.do(error => {// $FlowIgnore - ignore retries reassignment
        if (retries-- <= 0) {throw error;}});}).catch(e => {stopTunnelingAdb(uri);throw e;}).publishReplay(1);const subscription = observable.connect();return { tunnels: observable, subscription };});changes.next();return tunnels;}function stopTunnelingAdb(uri) {activeTunnels.delete(uri);changes.next();}function isAdbTunneled(uri) {return changes.startWith(undefined).map(() => activeTunnels.get(uri) != null).distinctUntilChanged();}const activeTunnels = new (_SimpleCache || _load_SimpleCache()).SimpleCache({
  keyFactory: uri =>
  (_nuclideUri || _load_nuclideUri()).default.createRemoteUri((_nuclideUri || _load_nuclideUri()).default.getHostname(uri), '/'),
  dispose: value => value.subscription.unsubscribe() });

const changes = new _rxjsBundlesRxMinJs.Subject();

function openTunnels(host) {
  const tunnels = [
  {
    description: 'adb',
    from: { host, port: 5037, family: 4 },
    to: { host: 'localhost', port: 5037, family: 4 } },

  {
    description: 'emulator console',
    from: { host, port: 5554, family: 4 },
    to: { host: 'localhost', port: 5554, family: 4 } },

  {
    description: 'emulator adb',
    from: { host, port: 5555, family: 4 },
    to: { host: 'localhost', port: 5555, family: 4 } },

  {
    description: 'exopackage',
    from: { host, port: 2829, family: 4 },
    to: { host: 'localhost', port: 2829, family: 4 } }];



  return _rxjsBundlesRxMinJs.Observable.defer(() =>
  (0, (_nullthrows || _load_nullthrows()).default)((0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide.ssh-tunnel'))).
  switchMap(service => service.openTunnels(tunnels));
}