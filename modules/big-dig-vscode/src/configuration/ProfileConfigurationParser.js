"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createParser = createParser;
exports.getDefaults = getDefaults;
exports.ProfileConfigurationParser = void 0;

var _os = _interopRequireDefault(require("os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
function createParser(profile) {
  const {
    username,
    localHomeDir
  } = getDefaults();
  return new ProfileConfigurationParser(profile, username, localHomeDir);
}

function getDefaults() {
  const localHomeDir = process.env.HOME;

  if (!(localHomeDir != null)) {
    throw new Error("Invariant violation: \"localHomeDir != null\"");
  }

  return {
    username: _os.default.userInfo().username,
    localHomeDir
  };
}

class ProfileConfigurationParser {
  constructor(profile, defaultUsername, localHomeDir) {
    this._profile = profile;
    const {
      address,
      authentication,
      folders,
      hostname,
      username
    } = profile;
    this._username = username != null ? username : defaultUsername;
    this._localHomeDir = localHomeDir;
    this._hostname = hostname != null ? hostname : this.getDefaultHostname();
    this._address = address != null ? address : this._hostname;
    this._folders = folders != null ? folders : this.getDefaultFolders();
    this._authMethod = this.parseAuthMethod(authentication);
  }

  parse() {
    return {
      hostname: this.getHostname(),
      address: this.getAddress(),
      ports: this.getPorts(),
      folders: this.getFolders(),
      deployServer: this.getDeployServer(),
      username: this.getUsername(),
      authMethod: this.getAuthMethod(),
      privateKey: this.getPrivateKey()
    };
  }

  getUsername() {
    return this._username;
  }

  getLocalHomeDir() {
    return this._localHomeDir;
  }

  getHostname() {
    return this._hostname;
  }

  getDefaultHostname() {
    return 'localhost';
  }

  getAddress() {
    return this._address;
  }

  getPorts() {
    const {
      ports
    } = this._profile;

    if (ports != null) {
      return ports;
    } else {
      return this.getDefaultPortsDescriptor();
    }
  }

  getDefaultPortsDescriptor() {
    return '0';
  }
  /** The return value should be treated as read-only. */


  getFolders() {
    return this._folders;
  }

  getDefaultFolders() {
    return ['~'];
  }

  async getPrivateKey() {
    let {
      privateKey
    } = this._profile;

    if (privateKey == null) {
      privateKey = await this.getDefaultPrivateKey();
    }

    if (privateKey.startsWith('~')) {
      privateKey = privateKey.replace('~', this._localHomeDir);
    }

    return privateKey;
  }

  getDefaultPrivateKey() {
    return Promise.resolve('~/.ssh/id_rsa');
  }

  getAuthMethod() {
    return this._authMethod;
  }
  /** @param authMethod The raw value for password taken from settings.json. */


  parseAuthMethod(authMethod) {
    return Promise.resolve(authMethod != null ? authMethod : 'password');
  }

  getDeployServer() {
    let {
      deployServer
    } = this._profile;

    if (deployServer == null) {
      deployServer = {};
    }

    let {
      node,
      installationPath
    } = deployServer;

    if (node == null) {
      node = this.getPathToNode();
    }

    if (installationPath == null) {
      installationPath = this.getInstallationPath();
    }

    const {
      autoUpdate,
      extractFileCommand
    } = deployServer;
    return {
      node,
      installationPath,
      extractFileCommand,
      autoUpdate: autoUpdate !== false
    };
  }

  getPathToNode() {
    return 'node';
  }

  getInstallationPath() {
    return `/home/${this.getUsername()}/.big-dig/big-dig-vscode`;
  }

}

exports.ProfileConfigurationParser = ProfileConfigurationParser;