'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Non-published Facebook packages begin with 'fb-'.
const PACKAGE_PREFIX_REGEXP = /^fb-/;
const OUTDATED_PACKAGE_NAMES = new Set([
  'hyperclick',
  'nuclide-arcanist',
  'nuclide-blame',
  'nuclide-blame-provider-hg',
  'nuclide-blame-ui',
  'nuclide-buck-files',
  'nuclide-busy-signal',
  'nuclide-clang-atom',
  'nuclide-clipboard-path',
  'nuclide-code-format',
  'nuclide-code-highlight',
  'nuclide-debugger-atom',
  'nuclide-debugger-hhvm',
  'nuclide-debugger-lldb',
  'nuclide-diagnostics-store',
  'nuclide-diagnostics-ui',
  'nuclide-diff-view',
  'nuclide-file-tree',
  'nuclide-file-watcher',
  'nuclide-find-references',
  'nuclide-flow',
  'nuclide-format-js',
  'nuclide-fuzzy-filename-provider',
  'nuclide-hack',
  'nuclide-hack-symbol-provider',
  'nuclide-health',
  'nuclide-hg-repository',
  'nuclide-home',
  'nuclide-installer',
  'nuclide-language-hack',
  'nuclide-move-pane',
  'nuclide-objc',
  'nuclide-ocaml',
  'nuclide-open-filenames-provider',
  'nuclide-quick-open',
  'nuclide-react-native-inspector',
  'nuclide-recent-files-provider',
  'nuclide-recent-files-service',
  'nuclide-remote-projects',
  'nuclide-service-monitor',
  'nuclide-test-runner',
  'nuclide-toolbar',
  'nuclide-type-hint',
  'nuclide-url-hyperclick',
]);

function isOutdatedPackageName(packageName: string): boolean {
  return OUTDATED_PACKAGE_NAMES.has(packageName) || PACKAGE_PREFIX_REGEXP.test(packageName);
}

function getOutdatedAvailablePackageNames(): Array<string> {
  return atom.packages.getAvailablePackageNames().filter(isOutdatedPackageName);
}

function disableOutdatedPackages(): void {
  const outdatedAvailablePackages = getOutdatedAvailablePackageNames();
  if (outdatedAvailablePackages.length > 0) {
    outdatedAvailablePackages.forEach(name => {
      // Disabling a package while it's already disabled adds a duplicate entry to the
      // `disabledPackages` setting. Ensure it's not added multiple times.
      if (!atom.packages.isPackageDisabled(name)) {
        atom.packages.disablePackage(name);
      }
    });

    const uninstallCommand = `apm uninstall \\\n${outdatedAvailablePackages.join(' \\\n')}`;
    atom.notifications.addWarning('Outdated Nuclide Packages', {
      buttons: [
        {
          className: 'icon icon-clippy',
          onDidClick() { atom.clipboard.write(uninstallCommand); },
          text: 'Copy Uninstall Command',
        },
      ],
      description: 'Outdated Nuclide packages have been disabled, and it is recommended you'
        + ' uninstall them before using Atom+Nuclide. Run the command below from the command line'
        + ` to uninstall them and then restart Atom. <pre>${uninstallCommand}</pre>`,
      dismissable: true,
    });
  }
}

module.exports = {
  disableOutdatedPackages,
};
