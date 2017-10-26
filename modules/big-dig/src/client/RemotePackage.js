'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InstallError = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let runPackage = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (command, cwd, options, ssh) {
    const cmd = cwd == null ? `${command}` : `cd ${cwd} && ${command}`;

    const { stdout, result } = yield ssh.exec(cmd, options);
    // Collect any stdout in case there is an error.
    let output = '';
    stdout.subscribe(function (data) {
      return output += data;
    });
    // Wait for the bootstrapper to finish
    const { code } = yield result;

    return { stdout: output, code };
  });

  return function runPackage(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * An unmanaged, preexisting package. We know nothing about what the package looks like, except how
 * to invoke it. The user is responsible for installing the package on the remote machine and
 * providing a valid command for invocation.
 */


exports.getPackage = getPackage;

var _fs = _interopRequireDefault(require('fs'));

var _path = _interopRequireDefault(require('path'));

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _Manifest;

function _load_Manifest() {
  return _Manifest = require('./Manifest');
}

var _SftpClient;

function _load_SftpClient() {
  return _SftpClient = require('./SftpClient');
}

var _SshClient;

function _load_SshClient() {
  return _SshClient = require('./SshClient');
}

var _events;

function _load_events() {
  return _events = require('../common/events');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Install the package as-needed. Big-dig saves a remote manifest, which includes the version and
 * the `stat` for each file. This is used to determine whether the package needs to be
 * (re)installed. */


/** Assume the package is already installed and not managed by Big-dig. */
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

function okay() {
  (0, (_log4js || _load_log4js()).getLogger)().info('Verify installation: OKAY.');
  return { status: 'okay' };
}

function needsUpdate(expected, current) {
  const message = `Found remote server version ${current}, but expected version ${expected}.`;
  (0, (_log4js || _load_log4js()).getLogger)().info(`Verify installation: ${message}`);
  return {
    status: 'needs-update',
    message,
    expected,
    current
  };
}

function corrupt(message, reason) {
  (0, (_log4js || _load_log4js()).getLogger)().info(`Verify installation: CORRUPT - ${message}`);
  return { status: 'corrupt', reason, message };
}

function needsInstall(message) {
  (0, (_log4js || _load_log4js()).getLogger)().info(`Verify installation: NEEDS INSTALL - ${message}`);
  return { status: 'needs-install', message };
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

class UnmanagedPackage {

  constructor(params) {
    this._package = params;
  }

  run(args, options = {}, ssh) {
    const { cwd, command } = this._package;
    const cmd = `${command} ${(0, (_string || _load_string()).shellQuote)(args)}`;
    return runPackage(cmd, cwd, Object.assign({}, options), ssh);
  }

  verifyInstallation(ssh) {
    return (0, _asyncToGenerator.default)(function* () {
      return okay();
    })();
  }

  install(ssh, options) {
    return (0, _asyncToGenerator.default)(function* () {
      throw new InstallError('An unmanaged remote server cannot be installed.');
    })();
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

  constructor(params) {
    this._currentVersion = null;

    this._package = params;
  }
  /** We record the version when verifying an installation, and later use it when requesting an
   * updated package to install (allowing the packager to provide a delta). If the installation
   * cannot be verified or we are pursuing a fresh install, then this will be `null`.
   */


  run(args, options = {}, ssh) {
    const { installationPath, command } = this._package;
    const cmd = command(installationPath, (0, (_string || _load_string()).shellQuote)(args));
    return runPackage(cmd, installationPath, Object.assign({}, options), ssh);
  }

  verifyInstallation(ssh) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pkg = _this._package;
      const sftp = yield ssh.sftp();
      const manifestFile = _this._manifestPath();
      (0, (_log4js || _load_log4js()).getLogger)().info('Verifying installation...');

      try {
        if (!(yield sftp.exists(pkg.installationPath))) {
          return needsInstall('Installation path does not exist');
        }
        const installPathStats = yield sftp.lstat(pkg.installationPath);
        if (!installPathStats.isDirectory()) {
          return corrupt('Installation path already exists as a file', 'install-path-is-file');
        } else if ((yield sftp.readdir(pkg.installationPath)).length === 0) {
          return needsInstall('Installation path is empty');
        } else if (!(yield sftp.exists(manifestFile))) {
          return corrupt(`Manifest does not exist at ${manifestFile}`, 'missing-manifest');
        }

        // The installation state we expect to see:
        const manifest = (0, (_Manifest || _load_Manifest()).deserializeManifest)((yield sftp.readFile(manifestFile)));
        _this._currentVersion = manifest.version;
        // The actual state:
        const currentFileTree = yield sftp.filetree(pkg.installationPath);
        const current = (0, (_Manifest || _load_Manifest()).createManifest)(manifest.version /** Assume current version = manifest version */
        , manifestFile, pkg.installationPath, currentFileTree);

        // Is the manifest correct?
        const check = (0, (_Manifest || _load_Manifest()).compareManifests)(manifest, current);

        if (
        // Should be equivalent to `check.status !== 'okay'`, but Flow is not smart enough :(
        check.status === 'changed-files' || check.status === 'diff-versions' // This case should not happen
        ) {
            return corrupt(check.message, check.status);
          }
        // The manifest is correct!

        // Do we need to upgrade the package?
        const expectedVersion = yield pkg.expectedVersion(manifest.version);
        if (expectedVersion !== manifest.version) {
          return needsUpdate(expectedVersion, manifest.version);
        }

        return okay();
      } finally {
        yield sftp.end();
      }
    })();
  }

  install(ssh, options) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pkg = _this2._package;
      let sftp = yield ssh.sftp();
      const opts = Object.assign({}, options);
      opts.name = opts.name !== undefined ? opts.name : 'package';
      opts.tempDir = opts.tempDir != null ? opts.tempDir : '/tmp/';
      opts.force = opts.force || false;

      try {
        (0, (_log4js || _load_log4js()).getLogger)().info(`Installing ${opts.name}...`);
        const archive = yield pkg.package(_this2._currentVersion);
        const cleanFirst = archive.isDelta !== true;

        // If we're not installing a delta and we believe there are existing files that need to be
        // removed (e.g. we're updating the installation), then first remove the existing files.
        if (cleanFirst && opts.force) {
          yield _this2._uninstall(sftp);
          _this2._currentVersion = null;
        }

        yield _this2._initInstallationPath(sftp, { assertEmpty: cleanFirst });

        if (pkg.extract) {
          const extract = pkg.extract;
          // Transfer the archive to a file first? Otherwise, it will be streamed to the extractor.
          if (extract.fromFileCommand) {
            const tmp = _path.default.join(opts.tempDir, `big-dig-package.${Math.random()}`);
            (0, (_log4js || _load_log4js()).getLogger)().info(`Install: transferring package to temporary file (${tmp})...`);
            yield _this2._transferToFile(archive, tmp, sftp);
            yield sftp.end();
            try {
              (0, (_log4js || _load_log4js()).getLogger)().info('Install: extracting package...');
              yield _this2._extractFromFile(extract, tmp, ssh);
            } finally {
              try {
                sftp = yield ssh.sftp();
                yield sftp.unlink(tmp);
                yield sftp.end();
              } catch (error) {
                (0, (_log4js || _load_log4js()).getLogger)().warn(`Install: could not remove temporary file ${tmp}.`);
              }
            }
          } else {
            yield sftp.end();
            (0, (_log4js || _load_log4js()).getLogger)().info('Install: transferring and extracting package...');
            yield _this2._extractFromStdin(archive, extract, ssh);
          }
          sftp = yield ssh.sftp();
        } else {
          (0, (_log4js || _load_log4js()).getLogger)().info('Install: transferring package...');
          yield _this2._transferToFile(archive, pkg.installationPath, sftp);
        }
        (0, (_log4js || _load_log4js()).getLogger)().info('Install: saving manifest...');
        yield _this2._saveManifest(archive.version, sftp);
        _this2._currentVersion = archive.version;
        (0, (_log4js || _load_log4js()).getLogger)().info('Install: complete.');
      } catch (error) {
        (0, (_log4js || _load_log4js()).getLogger)().info(`Install: FAILURE (${error.message || error.toString()})`);
        throw error;
      } finally {
        yield sftp.end();
      }
    })();
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
  _saveManifest(version, sftp) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const installPath = _this3._package.installationPath;
      const currentFileTree = yield sftp.filetree(installPath);
      const current = (0, (_Manifest || _load_Manifest()).createManifest)(version, _this3._manifestPath(), installPath, currentFileTree);
      const data = (0, (_Manifest || _load_Manifest()).serializeManifest)(current);
      yield sftp.writeFile(_this3._manifestPath(), data);
    })();
  }

  /**
   * Removes all (preexisting) files from the installation path.
   */
  _uninstall(sftp) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (0, (_log4js || _load_log4js()).getLogger)().info('Removing previous package (if present)...');
      yield sftp.rmtree(_this4._package.installationPath, true);
    })();
  }

  /**
   * Ensure that the installation path exists and is empty (if `clean`).
   */
  _initInstallationPath(sftp, params) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const assertEmpty = params.assertEmpty;
      const pkg = _this5._package;
      const installPathIsNonEmpty = function () {
        return sftp.readdir(pkg.installationPath).then(function (files) {
          return files.length !== 0;
        }, function (error) {
          return false;
        });
      };

      if (assertEmpty && (
      // We should have checked the manifest to prevent this from happening, but just in case...
      // (Also note that we do not have transactional access to the server filesystem, so
      // this can happen and we might not even catch it here.)
      yield installPathIsNonEmpty())) {
        throw new InstallError(`Installation path is not empty (${pkg.installationPath})`);
      }

      let dir;
      if (pkg.extract) {
        dir = pkg.installationPath;
      } else {
        dir = _path.default.dirname(pkg.installationPath);
      }
      yield sftp.mkdir(dir, { createIntermediateDirectories: true });
    })();
  }

  /**
   * Extract a local file/buffer to the remote install path via stdin.
   */
  _extractFromStdin(archive, extract, ssh) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pkg = _this6._package;
      const extractCmd = extract.fromStdinCommand(pkg.installationPath);
      const { stdout, stdio, result } = yield ssh.exec(extractCmd);
      let output = '';
      stdout.subscribe(function (data) {
        return output += data;
      });
      const [, { code }] = yield Promise.all([_this6._transferViaStream(archive, stdio), result]);
      if (code !== 0) {
        const codeStr = code == null ? '<null>' : code;
        throw new InstallError(`Extraction command exited with code ${codeStr}: ${extractCmd}`, output);
      }
    })();
  }

  /**
   *  Extract a remote file to a remote directory.
   */
  _extractFromFile(extract, archiveFile, ssh) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pkg = _this7._package;
      const extractCmd = extract.fromFileCommand(archiveFile, pkg.installationPath);
      const { stdout, result } = yield ssh.exec(extractCmd);
      let output = '';
      stdout.subscribe(function (data) {
        return output += data;
      });
      const { code } = yield result;
      if (code !== 0) {
        const codeStr = code == null ? '<null>' : code;
        throw new InstallError(`Extraction command exited with code ${codeStr}: ${extractCmd}`, output);
      }
    })();
  }

  /**
   * Transfer the local file/buffer to a remote file.
   */
  _transferToFile(archive, archiveFile, sftp) {
    return (0, _asyncToGenerator.default)(function* () {
      if (archive.data) {
        yield sftp.writeFile(archiveFile, archive.data, { flag: 'wx' });
      } else {
        yield sftp.fastPut(archive.filename, archiveFile);
      }
    })();
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
    return (0, (_events || _load_events()).onceEvent)(stream, 'end');
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