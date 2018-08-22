/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import invariant from 'assert';
import os from 'os';

/**
 * Acceptable values for the `authentication` field of a connection profile in
 * settings.json.
 */
export type AuthenticationMethod = 'private-key' | 'password';

/** This reflects the raw value that the user entered in settings.json. */
export interface ConnectionProfileConfiguration {
  hostname?: string;
  address?: string;
  username?: string;
  folders?: Array<string>;
  ports?: string;
  privateKey?: string;
  authentication?: AuthenticationMethod;
  deployServer?: DeployServer;
}

/** This reflects the normalized version of a ConnectionProfileConfiguration. */
export interface IConnectionProfile {
  hostname: string;
  address: string;
  username: string;
  ports: string;
  folders: Array<string>;
  privateKey: Promise<string>;
  authMethod: Promise<AuthenticationMethod>;
  deployServer: DeployServer;
}

export type DeployServer = {
  /** Command to run node */
  node: string,
  installationPath: string,
  extractFileCommand?: string,
  autoUpdate: boolean,
  validateServerVersion?: boolean,
};

export function createParser(
  profile: ConnectionProfileConfiguration,
): ProfileConfigurationParser {
  const {username, localHomeDir} = getDefaults();
  return new ProfileConfigurationParser(profile, username, localHomeDir);
}

export function getDefaults(): {
  username: string,
  localHomeDir: string,
} {
  const localHomeDir = process.env.HOME;
  invariant(localHomeDir != null);
  return {
    username: os.userInfo().username,
    localHomeDir,
  };
}

export class ProfileConfigurationParser {
  _profile: ConnectionProfileConfiguration;
  _username: string;
  _localHomeDir: string;
  _hostname: string;
  _address: string;
  _folders: Array<string>;
  _authMethod: Promise<AuthenticationMethod>;

  constructor(
    profile: ConnectionProfileConfiguration,
    defaultUsername: string,
    localHomeDir: string,
  ) {
    this._profile = profile;
    const {address, authentication, folders, hostname, username} = profile;
    this._username = username != null ? username : defaultUsername;
    this._localHomeDir = localHomeDir;
    this._hostname = hostname != null ? hostname : this.getDefaultHostname();
    this._address = address != null ? address : this._hostname;
    this._folders = folders != null ? folders : this.getDefaultFolders();
    this._authMethod = this.parseAuthMethod(authentication);
  }

  parse(): IConnectionProfile {
    return {
      hostname: this.getHostname(),
      address: this.getAddress(),
      ports: this.getPorts(),
      folders: this.getFolders(),
      deployServer: this.getDeployServer(),
      username: this.getUsername(),
      authMethod: this.getAuthMethod(),
      privateKey: this.getPrivateKey(),
    };
  }

  getUsername(): string {
    return this._username;
  }

  getLocalHomeDir(): string {
    return this._localHomeDir;
  }

  getHostname(): string {
    return this._hostname;
  }

  getDefaultHostname(): string {
    return 'localhost';
  }

  getAddress(): string {
    return this._address;
  }

  getPorts(): string {
    const {ports} = this._profile;

    if (ports != null) {
      return ports;
    } else {
      return this.getDefaultPortsDescriptor();
    }
  }

  getDefaultPortsDescriptor(): string {
    return '0';
  }

  /** The return value should be treated as read-only. */
  getFolders(): Array<string> {
    return this._folders;
  }

  getDefaultFolders(): Array<string> {
    return ['~'];
  }

  async getPrivateKey(): Promise<string> {
    let {privateKey} = this._profile;
    if (privateKey == null) {
      privateKey = await this.getDefaultPrivateKey();
    }

    if (privateKey.startsWith('~')) {
      privateKey = privateKey.replace('~', this._localHomeDir);
    }

    return privateKey;
  }

  getDefaultPrivateKey(): Promise<string> {
    return Promise.resolve('~/.ssh/id_rsa');
  }

  getAuthMethod(): Promise<AuthenticationMethod> {
    return this._authMethod;
  }

  /** @param authMethod The raw value for password taken from settings.json. */
  parseAuthMethod(
    authMethod: ?AuthenticationMethod,
  ): Promise<AuthenticationMethod> {
    return Promise.resolve(authMethod != null ? authMethod : 'password');
  }

  getDeployServer(): DeployServer {
    let {deployServer} = this._profile;
    if (deployServer == null) {
      deployServer = {};
    }

    let {node, installationPath} = deployServer;
    if (node == null) {
      node = this.getPathToNode();
    }
    if (installationPath == null) {
      installationPath = this.getInstallationPath();
    }

    const {autoUpdate, extractFileCommand} = deployServer;
    return {
      node,
      installationPath,
      extractFileCommand,
      autoUpdate: autoUpdate !== false,
    };
  }

  getPathToNode(): string {
    return 'node';
  }

  getInstallationPath(): string {
    return `/home/${this.getUsername()}/.big-dig/big-dig-vscode`;
  }
}
