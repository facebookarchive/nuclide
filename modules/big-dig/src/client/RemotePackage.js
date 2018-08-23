"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPackage = getPackage;
exports.InstallError = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _string() {
  const data = require("../../../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _Manifest() {
  const data = require("./Manifest");

  _Manifest = function () {
    return data;
  };

  return data;
}

function _SftpClient() {
  const data = require("./SftpClient");

  _SftpClient = function () {
    return data;
  };

  return data;
}

function _SshClient() {
  const data = require("./SshClient");

  _SshClient = function () {
    return data;
  };

  return data;
}

function _events() {
  const data = require("../common/events");

  _events = function () {
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
 *  strict-local
 * @format
 */
function okay() {
  (0, _log4js().getLogger)().info('Verify installation: OKAY.');
  return {
    status: 'okay'
  };
}

function needsUpdate(expected, current) {
  const message = `Found remote server version ${current}, but expected version ${expected}.`;
  (0, _log4js().getLogger)().info(`Verify installation: ${message}`);
  return {
    status: 'needs-update',
    message,
    expected,
    current
  };
}

function corrupt(message, reason) {
  (0, _log4js().getLogger)().info(`Verify installation: CORRUPT - ${message}`);
  return {
    status: 'corrupt',
    reason,
    message
  };
}

function needsInstall(message) {
  (0, _log4js().getLogger)().info(`Verify installation: NEEDS INSTALL - ${message}`);
  return {
    status: 'needs-install',
    message
  };
}

class InstallError extends Error {
  constructor(message, stdout) {
    super(message + '\n' + (stdout || ''));
    this.message = message;
    this.stdout = stdout;
  }

}

exports.InstallError = InstallError;

/**
 * Creates an abstraction for the remote package, which may be an unmanaged (preexisting)
 * installation, or a managed installation by big-dig (which may need installation).
 * @param pkg
 */
function getPackage(pkg) {
  if (pkg.package) {
    return new ManagedPackage(pkg);
  } else {
    return new UnmanagedPackage(pkg);
  }
}

async function runPackage(command, cwd, options, ssh) {
  const cmd = cwd == null ? `${command}` : `cd ${cwd} && ${command}`;
  const {
    stdout,
    result
  } = await ssh.exec(cmd, options); // Collect any stdout in case there is an error.

  let output = '';
  stdout.subscribe(data => output += data); // Wait for the bootstrapper to finish

  const {
    code
  } = await result;
  return {
    stdout: output,
    code
  };
}
/**
 * An unmanaged, preexisting package. We know nothing about what the package looks like, except how
 * to invoke it. The user is responsible for installing the package on the remote machine and
 * providing a valid command for invocation.
 */


class UnmanagedPackage {
  constructor(params) {
    this._package = params;
  }

  run(args, options = {}, ssh) {
    const {
      cwd,
      command
    } = this._package;
    const cmd = `${command} ${(0, _string().shellQuote)(args)}`;
    return runPackage(cmd, cwd, Object.assign({}, options), ssh);
  }

  async verifyInstallation(ssh) {
    return okay();
  }

  async install(ssh, options) {
    throw new InstallError('An unmanaged remote server cannot be installed.');
  }

  getInstallationPath() {
    throw new Error('Cannot determine the installation path of an unmanaged remote server.');
  }

}
/**
 * A managed package. It's our responsibility to verify that it is installed correctly. Implements
 * `install` and `getInstallationPath`.
 */


class ManagedPackage {
  /** We record the version when verifying an installation, and later use it when requesting an
   * updated package to install (allowing the packager to provide a delta). If the installation
   * cannot be verified or we are pursuing a fresh install, then this will be `null`.
   */
  constructor(params) {
    this._currentVersion = null;
    this._package = params;
  }

  run(args, options = {}, ssh) {
    const {
      installationPath,
      command
    } = this._package;
    const cmd = command(installationPath, (0, _string().shellQuote)(args));
    return runPackage(cmd, installationPath, Object.assign({}, options), ssh);
  }

  async verifyInstallation(ssh) {
    const pkg = this._package;
    const sftp = await ssh.sftp();

    const manifestFile = this._manifestPath();

    (0, _log4js().getLogger)().info('Verifying installation...');

    try {
      if (!(await sftp.exists(pkg.installationPath))) {
        return needsInstall('Installation path does not exist');
      }

      const installPathStats = await sftp.lstat(pkg.installationPath);

      if (!installPathStats.isDirectory()) {
        return corrupt('Installation path already exists as a file', 'install-path-is-file');
      } else if ((await sftp.readdir(pkg.installationPath)).length === 0) {
        return needsInstall('Installation path is empty');
      } else if (!(await sftp.exists(manifestFile))) {
        return corrupt(`Manifest does not exist at ${manifestFile}`, 'missing-manifest');
      } // The installation state we expect to see:


      const manifest = (0, _Manifest().deserializeManifest)((await sftp.readFile(manifestFile)));
      this._currentVersion = manifest.version; // The actual state:

      const currentFileTree = await sftp.filetree(pkg.installationPath);
      const current = (0, _Manifest().createManifest)(manifest.version
      /** Assume current version = manifest version */
      , manifestFile, pkg.installationPath, currentFileTree); // Is the manifest correct?

      const check = (0, _Manifest().compareManifests)(manifest, current);

      if ( // Should be equivalent to `check.status !== 'okay'`, but Flow is not smart enough :(
      check.status === 'changed-files' || check.status === 'diff-versions' // This case should not happen
      ) {
          return corrupt(check.message, check.status);
        } // The manifest is correct!
      // Do we need to upgrade the package?


      const expectedVersion = await pkg.expectedVersion(manifest.version);

      if (expectedVersion !== manifest.version) {
        return needsUpdate(expectedVersion, manifest.version);
      }

      return okay();
    } finally {
      await sftp.end();
    }
  }

  async install(ssh, options) {
    const pkg = this._package;
    let sftp = await ssh.sftp();
    const opts = Object.assign({}, options);
    opts.name = opts.name !== undefined ? opts.name : 'package';
    opts.tempDir = opts.tempDir != null ? opts.tempDir : '/tmp/';
    opts.force = opts.force || false;

    try {
      (0, _log4js().getLogger)().info(`Installing ${opts.name}...`);
      const archive = await pkg.package(this._currentVersion);
      const cleanFirst = archive.isDelta !== true; // If we're not installing a delta and we believe there are existing files that need to be
      // removed (e.g. we're updating the installation), then first remove the existing files.

      if (cleanFirst && opts.force) {
        await this._uninstall(sftp);
        this._currentVersion = null;
      }

      await this._initInstallationPath(sftp, {
        assertEmpty: cleanFirst
      });

      if (pkg.extract) {
        const extract = pkg.extract; // Transfer the archive to a file first? Otherwise, it will be streamed to the extractor.

        if (extract.fromFileCommand) {
          const tmp = _path.default.join(opts.tempDir, `big-dig-package.${Math.random()}`);

          (0, _log4js().getLogger)().info(`Install: transferring package to temporary file (${tmp})...`);
          await this._transferToFile(archive, tmp, sftp);
          await sftp.end();

          try {
            (0, _log4js().getLogger)().info('Install: extracting package...');
            await this._extractFromFile(extract, tmp, ssh);
          } finally {
            try {
              sftp = await ssh.sftp();
              await sftp.unlink(tmp);
              await sftp.end();
            } catch (error) {
              (0, _log4js().getLogger)().warn(`Install: could not remove temporary file ${tmp}.`);
            }
          }
        } else {
          await sftp.end();
          (0, _log4js().getLogger)().info('Install: transferring and extracting package...');
          await this._extractFromStdin(archive, extract, ssh);
        }

        sftp = await ssh.sftp();
      } else {
        (0, _log4js().getLogger)().info('Install: transferring package...');
        await this._transferToFile(archive, pkg.installationPath, sftp);
      }

      (0, _log4js().getLogger)().info('Install: saving manifest...');
      await this._saveManifest(archive.version, sftp);
      this._currentVersion = archive.version;
      (0, _log4js().getLogger)().info('Install: complete.');
    } catch (error) {
      (0, _log4js().getLogger)().info(`Install: FAILURE (${error.message || error.toString()})`);
      throw error;
    } finally {
      await sftp.end();
    }
  }
  /**
   * Returns the remote path of the package.
   */


  getInstallationPath() {
    return this._package.installationPath;
  }
  /**
   * Assuming that the package files have all been installed, this creates and saves a manifest of
   * the state of the installation.
   */


  async _saveManifest(version, sftp) {
    const installPath = this._package.installationPath;
    const currentFileTree = await sftp.filetree(installPath);
    const current = (0, _Manifest().createManifest)(version, this._manifestPath(), installPath, currentFileTree);
    const data = (0, _Manifest().serializeManifest)(current);
    await sftp.writeFile(this._manifestPath(), data);
  }
  /**
   * Removes all (preexisting) files from the installation path.
   */


  async _uninstall(sftp) {
    (0, _log4js().getLogger)().info('Removing previous package (if present)...');
    await sftp.rmtree(this._package.installationPath, true);
  }
  /**
   * Ensure that the installation path exists and is empty (if `clean`).
   */


  async _initInstallationPath(sftp, params) {
    const assertEmpty = params.assertEmpty;
    const pkg = this._package;

    const installPathIsNonEmpty = () => sftp.readdir(pkg.installationPath).then(files => files.length !== 0, error => false);

    if (assertEmpty && ( // We should have checked the manifest to prevent this from happening, but just in case...
    // (Also note that we do not have transactional access to the server filesystem, so
    // this can happen and we might not even catch it here.)
    await installPathIsNonEmpty())) {
      throw new InstallError(`Installation path is not empty (${pkg.installationPath})`);
    }

    let dir;

    if (pkg.extract) {
      dir = pkg.installationPath;
    } else {
      dir = _path.default.dirname(pkg.installationPath);
    }

    await sftp.mkdir(dir, {
      createIntermediateDirectories: true
    });
  }
  /**
   * Extract a local file/buffer to the remote install path via stdin.
   */


  async _extractFromStdin(archive, extract, ssh) {
    const pkg = this._package;
    const extractCmd = extract.fromStdinCommand(pkg.installationPath);
    const {
      stdout,
      stdio,
      result
    } = await ssh.exec(extractCmd);
    let output = '';
    stdout.subscribe(data => output += data);
    const [, {
      code
    }] = await Promise.all([this._transferViaStream(archive, stdio), result]);

    if (code !== 0) {
      const codeStr = code == null ? '<null>' : code;
      throw new InstallError(`Extraction command exited with code ${codeStr}: ${extractCmd}`, output);
    }
  }
  /**
   *  Extract a remote file to a remote directory.
   */


  async _extractFromFile(extract, archiveFile, ssh) {
    const pkg = this._package;
    const extractCmd = extract.fromFileCommand(archiveFile, pkg.installationPath);
    const {
      stdout,
      result
    } = await ssh.exec(extractCmd);
    let output = '';
    stdout.subscribe(data => output += data);
    const {
      code
    } = await result;

    if (code !== 0) {
      const codeStr = code == null ? '<null>' : code;
      throw new InstallError(`Extraction command exited with code ${codeStr}: ${extractCmd}`, output);
    }
  }
  /**
   * Transfer the local file/buffer to a remote file.
   */


  async _transferToFile(archive, archiveFile, sftp) {
    if (archive.data) {
      await sftp.writeFile(archiveFile, archive.data, {
        flag: 'wx'
      });
    } else {
      await sftp.fastPut(archive.filename, archiveFile);
    }
  }
  /**
   * Transfer the local file/buffer to a stream (e.g. combined with `_extractFromStdin`).
   */


  _transferViaStream(archive, stream) {
    if (archive.data) {
      stream.write(archive.data);
    } else {
      _fs.default.createReadStream(archive.filename).pipe(stream);
    }

    return (0, _events().onceEvent)(stream, 'end');
  }
  /**
   * Remote filename for the manifest.
   */


  _manifestPath() {
    const pkg = this._package;

    if (pkg.extract) {
      // Store the manifest within the installation directory
      return _path.default.join(this._package.installationPath, '.big-dig-manifest');
    } else {
      // Store the manifest as a sibling of the installed file
      return _path.default.join(_path.default.dirname(this._package.installationPath), _path.default.basename('.big-dig-manifest' + pkg.installationPath));
    }
  }

}