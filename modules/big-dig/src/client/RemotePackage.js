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

import {shellQuote} from 'nuclide-commons/string';
import {SshClient} from './SshClient';

import type {ExecOptions} from './SshClient';

/** Assume the package is already installed and not managed by Big-dig. */
export type UnmanagedPackageParams = {|
  command: string,
  cwd?: string,
|};

export type PackageParams = UnmanagedPackageParams;

type PackageOkay = {|
  /** The package is present, has a valid manifest, and is a compatible version. */
  status: 'okay',
|};

type PackageNeedsInstall = {|
  /** The package is not installed; `installationPath` does not exist or is empty. */
  status: 'needs-install',
  message: string,
|};

type PackageNeedsUpdate = {|
  /** A package is present and has a valid manifest, but its version is incompatible. */
  status: 'needs-update',
  message: string,
  /** The version that we need to install. */
  expected: string,
  /** The version that is currently installed. */
  current: string,
|};

type CorruptionReason =
  /** Cannot find a file that verifies the installation status. */
  | 'missing-manifest'
  /** Files are missing from the installation. */
  | 'missing-files'
  /** Files have been added to the installation that are not tracked; could be user data. */
  | 'new-files'
  /** The `stats` of at least one file has changed; e.g. its modified-time or size. */
  | 'changed-stats'
  /** The install path was expected to be a directory but is an existing file. */
  | 'install-path-is-file'
  /** The installed version is different than the manifest version. */
  | 'diff-versions';

type PackageCorrupt = {|
  /**
   * `installationPath` points to a non-empty directory, but its contents are not a valid
   * installation. Files may have been removed or their stats changed. *User data may be present,
   * so installing the package here may cause data loss.*
   */
  status: 'corrupt',
  reason: CorruptionReason,
  message: string,
|};

export type PackageInstallStatus =
  | PackageOkay
  | PackageNeedsInstall
  | PackageNeedsUpdate
  | PackageCorrupt;

export type InstallOptions = {
  /** Directory to store temporary files. */
  tempDir?: string,
  /** Name of the package. */
  name?: string,
  /** If true, then remove any files within the installation path before installing. */
  force?: boolean,
};

function okay(): PackageOkay {
  return {status: 'okay'};
}

export interface RemotePackage {
  /** Runs the package. */
  run(
    args: Array<string>,
    options: ExecOptions,
    ssh: SshClient,
  ): Promise<{stdout: string, code: number | null}>,

  /**
   * Determines the installation status of the package. If unmanaged, this always returns 'okay'.
   * If managed, then this will check the manifest to verify that it is the correct version and not
   * corrupt. Refer to `Manifest` for what kinds of corruption can be detected.
   */
  verifyInstallation(ssh: SshClient): Promise<PackageInstallStatus>,

  /** Throws if installation is not supported. */
  install(ssh: SshClient, options?: InstallOptions): Promise<void>,

  /** Throws if installation is not supported. */
  getInstallationPath(): string,
}

/**
 * Creates an abstraction for the remote package, which may be an unmanaged (preexisting)
 * installation, or a managed installation by big-dig (which may need installation).
 * @param pkg
 */
export function getPackage(pkg: PackageParams): RemotePackage {
  return new UnmanagedPackage(pkg);
}

async function runPackage(
  command: string,
  args: Array<string>,
  cwd?: string,
  options: ExecOptions,
  ssh: SshClient,
): Promise<{stdout: string, code: number | null}> {
  const cmd =
    cwd == null
      ? `${command} ${shellQuote(args)}`
      : `cd ${cwd} && ${command} ${shellQuote(args)}`;

  const {stdout, result} = await ssh.exec(cmd, options);
  // Collect any stdout in case there is an error.
  let output = '';
  stdout.subscribe(data => (output += data));
  // Wait for the bootstrapper to finish
  const {code} = await result;

  return {stdout: output, code};
}

/**
 * An unmanaged, preexisting package. We know nothing about what the package looks like, except how
 * to invoke it. The user is responsible for installing the package on the remote machine and
 * providing a valid command for invocation.
 */
class UnmanagedPackage implements RemotePackage {
  _package: UnmanagedPackageParams;
  constructor(params: UnmanagedPackageParams) {
    this._package = params;
  }

  run(
    args: Array<string>,
    options: ExecOptions = {},
    ssh: SshClient,
  ): Promise<{stdout: string, code: number | null}> {
    const {cwd, command} = this._package;
    return runPackage(command, args, cwd, {...options}, ssh);
  }

  async verifyInstallation(ssh: SshClient): Promise<PackageInstallStatus> {
    return okay();
  }

  async install(ssh: SshClient, options?: InstallOptions): Promise<void> {
    throw new Error('An unmanaged remote server cannot be installed.');
  }

  getInstallationPath(): string {
    throw new Error(
      'Cannot determine the installation path of an unmanaged remote server.',
    );
  }
}
