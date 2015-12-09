'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {SshHandshake} from '../../remote-connection';
import {extend} from '../../commons';
const {immutableExtend} = extend;
import {validateFormInputs} from '../lib/form-validation-utils';

describe('validateFormInputs', () => {
  let validProfileName;
  let defaultServerCommand;
  let connectionProfileBase;
  let minimumValidParamsWithPrivateKey;
  let minimumValidParamsWithPassword;
  let minimumValidParamsWithSshAgent;

  beforeEach(() => {
    validProfileName = 'MyProfile';
    defaultServerCommand = 'defaultcommand';
    connectionProfileBase = {
      username: 'testuser',
      server: 'test@test.com',
      cwd: '/Test',
      sshPort: '22',
      remoteServerCommand: defaultServerCommand,
    };
    minimumValidParamsWithPrivateKey = immutableExtend(
      connectionProfileBase,
      {
        authMethod: SshHandshake.SupportedMethods.PRIVATE_KEY,
        pathToPrivateKey: '/Test',
      },
    );
    minimumValidParamsWithPassword = immutableExtend(
      connectionProfileBase,
      {
        authMethod: SshHandshake.SupportedMethods.PASSWORD,
      },
    );
    minimumValidParamsWithSshAgent = immutableExtend(
      connectionProfileBase,
      {authMethod: SshHandshake.SupportedMethods.SSL_AGENT},
    );
  });

  /**
   * Section: Valid Profiles
   */
  it(
    'accepts a valid profile with the Private Key authentication method', () => {
      const resultFromProfileWithPrivateKey = validateFormInputs(
        validProfileName,
        minimumValidParamsWithPrivateKey,
        defaultServerCommand,
      );
      expect(resultFromProfileWithPrivateKey.validatedProfile).toBeDefined();
      expect(resultFromProfileWithPrivateKey.warningMessage).not.toBeDefined();
    }
  );

  it(
    'accepts a valid profile with the Password authentication method', () => {
      const resultFromProfileWithPassword = validateFormInputs(
        validProfileName,
        minimumValidParamsWithPassword,
        defaultServerCommand,
      );
      expect(resultFromProfileWithPassword.validatedProfile).toBeDefined();
      expect(resultFromProfileWithPassword.warningMessage).not.toBeDefined();
    }
  );

  it(
    'accepts a valid profile with the SSH Agent authentication method', () => {
      const resultFromProfileWithSshAgent = validateFormInputs(
        validProfileName,
        minimumValidParamsWithSshAgent,
        defaultServerCommand,
      );
      expect(resultFromProfileWithSshAgent.validatedProfile).toBeDefined();
      expect(resultFromProfileWithSshAgent.warningMessage).not.toBeDefined();
    }
  );

  /**
   * Section: Invalid Profiles
   */
  it('rejects a profile if a Profile Name is missing.', () => {
    const resultFromNullProfileName = validateFormInputs(
      null,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromNullProfileName.errorMessage).not.toBeNull();

    const resultFromEmptyProfileName = validateFormInputs(
      '',
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromEmptyProfileName.errorMessage).not.toBeNull();
  });

  it('rejects a profile if a Username is missing.', () => {
    minimumValidParamsWithPrivateKey.username = null;
    const resultFromNullUsername = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromNullUsername.errorMessage).not.toBeNull();

    minimumValidParamsWithPrivateKey.username = '';
    const resultFromEmptyUsername = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromEmptyUsername.errorMessage).not.toBeNull();
  });

  it('rejects a profile if a Server is missing.', () => {
    minimumValidParamsWithPrivateKey.server = null;
    const resultFromNullServer = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromNullServer.errorMessage).not.toBeNull();

    minimumValidParamsWithPrivateKey.server = '';
    const resultFromEmptyServer = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromEmptyServer.errorMessage).not.toBeNull();
  });

  it('rejects a profile if an Initial Directory is missing.', () => {
    minimumValidParamsWithPrivateKey.cwd = null;
    const resultFromNullCwd = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromNullCwd.errorMessage).not.toBeNull();

    minimumValidParamsWithPrivateKey.cwd = '';
    const resultFromEmptyCwd = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromEmptyCwd.errorMessage).not.toBeNull();
  });

  it('rejects a profile if an SSH Port is missing.', () => {
    minimumValidParamsWithPrivateKey.sshPort = null;
    const resultFromNullSshPort = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromNullSshPort.errorMessage).not.toBeNull();

    minimumValidParamsWithPrivateKey.sshPort = '';
    const resultFromEmptySshPort = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromEmptySshPort.errorMessage).not.toBeNull();
  });

  it('rejects a profile if an Authentication Method is missing.', () => {
    minimumValidParamsWithPrivateKey.authMethod = null;
    const resultFromNullAuthMethod = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromNullAuthMethod.errorMessage).not.toBeNull();

    minimumValidParamsWithPrivateKey.authMethod = '';
    const resultFromEmptyAuthMethod = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromEmptyAuthMethod.errorMessage).not.toBeNull();
  });

  it('rejects a profile if the Authentication Method selected is "Private Key", and a Private Key File is missing', () => { //eslint-disable-line max-len
    minimumValidParamsWithPrivateKey.pathToPrivateKey = null;
    const resultFromNullPathToPrivateKey = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromNullPathToPrivateKey.errorMessage).not.toBeNull();

    minimumValidParamsWithPrivateKey.pathToPrivateKey = '';
    const resultFromEmptyPathToPrivateKey = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPrivateKey,
      defaultServerCommand,
    );
    expect(resultFromEmptyPathToPrivateKey.errorMessage).not.toBeNull();
  });

  it('does not reject a profile if the Private Key File is missing, but the Authentication Method selected is not "Private Key"', () => { //eslint-disable-line max-len
    const passwordAuthMethodProfile = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPassword,
      defaultServerCommand,
    );
    expect(passwordAuthMethodProfile.validatedProfile).toBeDefined();

    const sshAgentAuthMethodProfile = validateFormInputs(
      validProfileName,
      minimumValidParamsWithSshAgent,
      defaultServerCommand,
    );
    expect(sshAgentAuthMethodProfile.validatedProfile).toBeDefined();
  });

  /**
   * Section: Special Cases
   */
  it('strips a password, if it is provided and the "Password" Authentication Method is chosen, and provides a warning message.', () => { //eslint-disable-line max-len
    minimumValidParamsWithPassword.password = 'secretpassword';
    const resultFromProfileWithPassword = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPassword,
      defaultServerCommand,
    );
    expect(resultFromProfileWithPassword.validatedProfile).toBeDefined();
    expect(resultFromProfileWithPassword.validatedProfile.params.password).not.toBeDefined();
    expect(resultFromProfileWithPassword.warningMessage).toBeDefined();
  });

  it('only saves the remote server command if it is different than the "default".', () => {
    const resultFromProfileWithDefaultRSC = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPassword,
      defaultServerCommand,
    );
    expect(
      resultFromProfileWithDefaultRSC.validatedProfile.params.remoteServerCommand
    ).toBe('');

    minimumValidParamsWithPassword.remoteServerCommand = 'differentCommand';
    const resultFromProfileWithDifferentRSC = validateFormInputs(
      validProfileName,
      minimumValidParamsWithPassword,
      defaultServerCommand,
    );
    expect(
      resultFromProfileWithDifferentRSC.validatedProfile.params.remoteServerCommand
    ).toBe('differentCommand');
  });
});
