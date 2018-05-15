'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =

































activateExperimentalPackages;var _idx;function _load_idx() {return _idx = _interopRequireDefault(require('idx'));}var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../nuclide-commons/UniversalDisposable'));}var _path = _interopRequireDefault(require('path'));var _PackageRunners;function _load_PackageRunners() {return _PackageRunners = require('./PackageRunners');}var _MessageRouter;function _load_MessageRouter() {return _MessageRouter = _interopRequireDefault(require('./MessageRouter'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // eslint-disable-line nuclide-internal/prefer-nuclide-uri
function activateExperimentalPackages(features)
{
  const messageRouter = new (_MessageRouter || _load_MessageRouter()).default();
  const experimentalFeatures = getExperimentalFeatures(features);
  const availableServices = aggregateExperimentalServices(experimentalFeatures);

  const packages = [];
  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

  const atomPackages = [];
  // TODO: split into multiple processes?
  const processPackages = [];

  experimentalFeatures.forEach(feature => {
    const experimentalSection = feature.pkg.
    experimental;
    const main = _path.default.join(feature.path, experimentalSection.main);
    const pkgParams = {
      main,
      consumedServices: createObject(),
      providedServices: createObject() };


    const consumedServicesRaw = experimentalSection.consumedServices;
    const providedServicesRaw = experimentalSection.providedServices;

    // Build a map of services consumed by this package.
    if (consumedServicesRaw != null) {
      Object.keys(consumedServicesRaw).forEach(key => {var _ref, _ref2;
        const { name, version, config } = consumedServicesRaw[key];
        const availableVersion = (_ref = availableServices) != null ? (_ref2 = _ref[name]) != null ? _ref2[version] : _ref2 : _ref;
        // TODO: Handle missing required services.
        if (availableVersion != null) {
          const [inSocket, outSocket] = messageRouter.getSocket();
          pkgParams.consumedServices[key] = {
            socket: inSocket,
            client: availableVersion.client };

          availableVersion.rawConsumerConnections.push({
            socket: outSocket,
            config: config || {} });

        }
      });
    }

    // Build a map of services provided by this package.
    if (providedServicesRaw != null) {
      Object.keys(providedServicesRaw).forEach(key => {var _ref3, _ref4;
        const { name, version } = providedServicesRaw[key];
        const availableVersion = (_ref3 = availableServices) != null ? (_ref4 = _ref3[name]) != null ? _ref4[version] : _ref4 : _ref3;
        // TODO: Handle missing required services.
        if (availableVersion != null) {
          pkgParams.providedServices[key] = {
            // NOTE: This only becomes complete after checking all packages.
            rawConnections: availableVersion.rawConsumerConnections };

        }
      });
    }

    if (experimentalSection.runInAtom_UNSAFE) {
      atomPackages.push(pkgParams);
    } else {
      processPackages.push(pkgParams);
    }
  });

  if (atomPackages.length > 0) {
    packages.push(new (_PackageRunners || _load_PackageRunners()).AtomPackageRunner(atomPackages, messageRouter));
  }

  if (processPackages.length > 0) {
    packages.push(new (_PackageRunners || _load_PackageRunners()).ProcessPackageRunner(processPackages, messageRouter));
  }

  // Activate all the packages.
  packages.forEach(pkg => {
    disposables.add(
    pkg,
    pkg.onDidError(err => {
      atom.notifications.addError('Feature Process Crashed', {
        description: 'Please restart Atom to continue.',
        detail: String(err),
        buttons: [
        {
          className: 'icon icon-zap',
          text: 'Reload Atom',
          onDidClick() {
            atom.reload();
          } }] });



    }));

    pkg.activate();
  });

  return disposables;
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */function getExperimentalFeatures(features) {return features.filter( // $FlowIgnore
  feature => {var _ref5, _ref6;return ((_ref5 = feature.pkg) != null ? (_ref6 = _ref5.experimental) != null ? _ref6.main : _ref6 : _ref5) != null;});}function aggregateExperimentalServices(features) {
  // Build a table of provided services.
  const table = createObject();
  features.forEach(feature => {
    const experimentalSection = feature.pkg.
    experimental;
    const { providedServices } = experimentalSection;
    if (providedServices != null) {
      Object.keys(providedServices).forEach(alias => {
        const { client, name, version } = providedServices[alias];
        const row = table[name] || (table[name] = {});
        const clientPath = _path.default.join(feature.path, client);
        row[version] = { client: clientPath, rawConsumerConnections: [] };
      });
    }
  });
  return table;
}

// An object that may safely be used as a map.
function createObject() {
  return Object.create(null);
}