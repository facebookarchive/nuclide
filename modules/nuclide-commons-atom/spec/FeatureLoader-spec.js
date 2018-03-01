/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import idx from 'idx';
import fs from 'fs';
// eslint-disable-next-line rulesdir/prefer-nuclide-uri
import path from 'path';

import FeatureLoader from '../FeatureLoader';

const FEATURE_PACKAGE_PATH = path.join(
  __dirname,
  'fixtures',
  'feature-package',
);

const ALWAYS_ENABLED = 'always';
const NEVER_ENABLED = 'never';
const DEFAULT = 'default';

const featurePkg = JSON.parse(
  fs.readFileSync(path.join(FEATURE_PACKAGE_PATH, 'package.json')).toString(),
);
const featureName = path.basename(FEATURE_PACKAGE_PATH);

const ROOT_PACKAGE_DIRNAME = 'root-package';
const ROOT_PACKAGE_PATH = path.join(
  __dirname,
  'fixtures',
  ROOT_PACKAGE_DIRNAME,
);
const rootName = path.basename(ROOT_PACKAGE_PATH);

describe('FeatureLoader', () => {
  let loader;
  beforeEach(() => {
    loader = new FeatureLoader({
      path: ROOT_PACKAGE_PATH,
      pkgName: rootName,
      features: [
        {
          path: FEATURE_PACKAGE_PATH,
          pkg: featurePkg,
        },
      ],
    });
    atom.packages.loadPackage(ROOT_PACKAGE_PATH);
  });

  describe('load', () => {
    beforeEach(() => {
      spyOn(atom.packages, 'loadPackage');
      atom.config.set(`${rootName}.use.${featureName}`, ALWAYS_ENABLED);
      loader.load();
      atom.packages.emitter.emit('did-load-package', {
        name: ROOT_PACKAGE_DIRNAME,
      });
    });

    it('sets a description including provided and consumed services', () => {
      expect(
        idx(loader.getConfig(), _ => _.use.properties[featureName].description),
      ).toEqual(
        'Hyperclick UI<br/>**Provides:** _hyperclick.observeTextEditor_<br/>**Consumes:** _hyperclick_',
      );
    });

    it("merges the feature config into the passed config's feature properties", () => {
      expect(idx(loader.getConfig(), _ => _[featureName].properties)).toEqual(
        featurePkg.atomConfig,
      );
    });

    it('loads the feature package when the root package loads', () => {
      runs(() => {
        expect(atom.packages.loadPackage).toHaveBeenCalledWith(
          FEATURE_PACKAGE_PATH,
        );
      });
    });
  });

  describe('enum migration', () => {
    let samplefeature;
    let normalfeature;

    beforeEach(() => {
      samplefeature = {
        path: 'bar/sample-feature',
        pkg: featurePkg,
      };

      normalfeature = {
        path: 'bar/normal-feature',
        pkg: featurePkg,
      };
    });
    it("handles when sample- feature' current state is undefined", () => {
      const newValue = loader.getValueForFeatureToEnumMigration(
        undefined,
        samplefeature,
      );
      expect(newValue).toBe(NEVER_ENABLED);
    });
    it("handles when sample- feature's current state is true", () => {
      const newValue = loader.getValueForFeatureToEnumMigration(
        true,
        samplefeature,
      );
      expect(newValue).toBe(ALWAYS_ENABLED);
    });
    it("handles when sample- feature's current state is false", () => {
      const newValue = loader.getValueForFeatureToEnumMigration(
        false,
        samplefeature,
      );
      expect(newValue).toBe(DEFAULT);
    });
    it("handles when normal feature's current state is undefined", () => {
      const newValue = loader.getValueForFeatureToEnumMigration(
        undefined,
        normalfeature,
      );
      expect(newValue).toBe(DEFAULT);
    });
    it("handles when normal feature's current state is true", () => {
      const newValue = loader.getValueForFeatureToEnumMigration(
        true,
        normalfeature,
      );
      expect(newValue).toBe(DEFAULT);
    });
    it("handles when normal feature's current state is false", () => {
      const newValue = loader.getValueForFeatureToEnumMigration(
        false,
        normalfeature,
      );
      expect(newValue).toBe(NEVER_ENABLED);
    });
  });

  describe('activate', () => {
    it('activates the feature package right away if enabled', () => {
      spyOn(atom.packages, 'activatePackage');

      loader.load();
      atom.config.set(`${rootName}.use.${featureName}`, ALWAYS_ENABLED);
      atom.packages.emitter.emit('did-load-package', {
        name: ROOT_PACKAGE_DIRNAME,
      });
      loader.activate();

      runs(() => {
        expect(atom.packages.activatePackage).toHaveBeenCalledWith(
          FEATURE_PACKAGE_PATH,
        );
      });
    });
  });

  describe('activating, deactivating, then activating again', () => {
    it('actives, deactivates, then activates feature packages', () => {
      spyOn(atom.packages, 'activatePackage');
      spyOn(atom.packages, 'deactivatePackage');

      loader.load();
      atom.config.set(`${rootName}.use.${featureName}`, ALWAYS_ENABLED);
      atom.packages.emitter.emit('did-load-package', {
        name: ROOT_PACKAGE_DIRNAME,
      });
      loader.activate();

      expect(atom.packages.activatePackage).toHaveBeenCalledWith(
        FEATURE_PACKAGE_PATH,
      );

      loader.deactivate();
      expect(atom.packages.deactivatePackage).toHaveBeenCalledWith(
        featureName,
        true,
      );

      loader.activate();
      expect(atom.packages.activatePackage).toHaveBeenCalledWith(
        FEATURE_PACKAGE_PATH,
      );
    });
  });
});
