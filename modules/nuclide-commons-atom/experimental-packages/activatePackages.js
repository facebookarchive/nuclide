"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = activateExperimentalPackages;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _PackageRunners() {
  const data = require("./PackageRunners");

  _PackageRunners = function () {
    return data;
  };

  return data;
}

function _MessageRouter() {
  const data = _interopRequireDefault(require("./MessageRouter"));

  _MessageRouter = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// eslint-disable-line nuclide-internal/prefer-nuclide-uri
function activateExperimentalPackages(features) {
  const messageRouter = new (_MessageRouter().default)();
  const experimentalFeatures = getExperimentalFeatures(features);
  const availableServices = aggregateExperimentalServices(experimentalFeatures);
  const packages = [];
  const disposables = new (_UniversalDisposable().default)();
  const atomPackages = []; // TODO: split into multiple processes?

  const processPackages = [];
  experimentalFeatures.forEach(feature => {
    const experimentalSection = feature.pkg.experimental;

    const main = _path.default.join(feature.path, experimentalSection.main);

    const pkgParams = {
      main,
      consumedServices: createObject(),
      providedServices: createObject()
    };
    const consumedServicesRaw = experimentalSection.consumedServices;
    const providedServicesRaw = experimentalSection.providedServices; // Build a map of services consumed by this package.

    if (consumedServicesRaw != null) {
      Object.keys(consumedServicesRaw).forEach(key => {
        var _ref;

        const {
          name,
          version,
          config
        } = consumedServicesRaw[key];
        const availableVersion = (_ref = availableServices) != null ? (_ref = _ref[name]) != null ? _ref[version] : _ref : _ref; // TODO: Handle missing required services.

        if (availableVersion != null) {
          const [inSocket, outSocket] = messageRouter.getSocket();
          pkgParams.consumedServices[key] = {
            socket: inSocket,
            client: availableVersion.client
          };
          availableVersion.rawConsumerConnections.push({
            socket: outSocket,
            config: config || {}
          });
        }
      });
    } // Build a map of services provided by this package.


    if (providedServicesRaw != null) {
      Object.keys(providedServicesRaw).forEach(key => {
        var _ref2;

        const {
          name,
          version
        } = providedServicesRaw[key];
        const availableVersion = (_ref2 = availableServices) != null ? (_ref2 = _ref2[name]) != null ? _ref2[version] : _ref2 : _ref2; // TODO: Handle missing required services.

        if (availableVersion != null) {
          pkgParams.providedServices[key] = {
            // NOTE: This only becomes complete after checking all packages.
            rawConnections: availableVersion.rawConsumerConnections
          };
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
    packages.push(new (_PackageRunners().AtomPackageRunner)(atomPackages, messageRouter));
  }

  if (processPackages.length > 0) {
    packages.push(new (_PackageRunners().ProcessPackageRunner)(processPackages, messageRouter));
  } // Activate all the packages.


  packages.forEach(pkg => {
    disposables.add(pkg, pkg.onDidError(err => {
      atom.notifications.addError('Feature Process Crashed', {
        description: 'Please restart Atom to continue.',
        detail: String(err),
        buttons: [{
          className: 'icon icon-zap',
          text: 'Reload Atom',

          onDidClick() {
            atom.reload();
          }

        }]
      });
    }));
    pkg.activate();
  });
  return disposables;
}

function getExperimentalFeatures(features) {
  return features.filter( // $FlowIgnore
  feature => {
    var _ref3;

    return ((_ref3 = feature.pkg) != null ? (_ref3 = _ref3.experimental) != null ? _ref3.main : _ref3 : _ref3) != null;
  });
}

function aggregateExperimentalServices(features) {
  // Build a table of provided services.
  const table = createObject();
  features.forEach(feature => {
    const experimentalSection = feature.pkg.experimental;
    const {
      providedServices
    } = experimentalSection;

    if (providedServices != null) {
      Object.keys(providedServices).forEach(alias => {
        const {
          client,
          name,
          version
        } = providedServices[alias];
        const row = table[name] || (table[name] = {});

        const clientPath = _path.default.join(feature.path, client);

        row[version] = {
          client: clientPath,
          rawConsumerConnections: []
        };
      });
    }
  });
  return table;
} // An object that may safely be used as a map.


function createObject() {
  return Object.create(null);
}