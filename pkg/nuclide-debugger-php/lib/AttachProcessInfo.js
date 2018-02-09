/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {PhpDebuggerService as PhpDebuggerServiceType} from '../../nuclide-debugger-php-rpc/lib/PhpDebuggerService';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  ControlButtonSpecification,
  DebuggerCapabilities,
  DebuggerProperties,
} from 'nuclide-debugger-common';

import {DebuggerProcessInfo} from 'nuclide-debugger-common';
import {PhpDebuggerInstance} from './PhpDebuggerInstance';
import {
  getPhpDebuggerServiceByNuclideUri,
  getHhvmDebuggerServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import nuclideUri from 'nuclide-commons/nuclideUri';

import logger from './utils';
import {getSessionConfig} from './utils';
import passesGK from '../../commons-node/passesGK';

export class AttachProcessInfo extends DebuggerProcessInfo {
  _debugPort: ?number;

  constructor(targetUri: NuclideUri, debugPort: ?number) {
    super('hhvm', targetUri);
    this._debugPort = debugPort;
  }

  clone(): AttachProcessInfo {
    return new AttachProcessInfo(this._targetUri);
  }

  getDebuggerCapabilities(): DebuggerCapabilities {
    return {
      ...super.getDebuggerCapabilities(),
      completionsRequest: true,
      conditionalBreakpoints: true,
      continueToLocation: true,
      setVariable: true,
      threads: true,
    };
  }

  getDebuggerProps(): DebuggerProperties {
    return {
      ...super.getDebuggerProps(),
      customControlButtons: this._getCustomControlButtons(),
      threadsComponentTitle: 'Requests',
    };
  }

  preAttachActions(): void {
    try {
      // $FlowFB
      const services = require('./fb/services');
      services.startSlog();
    } catch (_) {}
  }

  async _hhvmDebug(): Promise<PhpDebuggerInstance> {
    const service = getHhvmDebuggerServiceByNuclideUri(this.getTargetUri());
    const hhvmDebuggerService = new service.HhvmDebuggerService();

    // Note: not specifying startup document or debug port here, the backend
    // will use the default parameters. We can surface these options in the
    // Attach Dialog if users need to be able to customize them in the future.
    const config: Object = {
      targetUri: nuclideUri.getPath(this.getTargetUri()),
      action: 'attach',
    };

    let debugPort = this._debugPort;
    if (debugPort == null) {
      try {
        // $FlowFB
        const fetch = require('../../commons-node/fb-sitevar').fetchSitevarOnce;
        debugPort = await fetch('NUCLIDE_HHVM_DEBUG_PORT');
      } catch (e) {}
    }

    if (debugPort != null) {
      config.debugPort = debugPort;
    }

    logger.info(`Connection session config: ${JSON.stringify(config)}`);
    const result = await hhvmDebuggerService.debug(config);
    logger.info(`Attach process result: ${result}`);
    return new PhpDebuggerInstance(this, hhvmDebuggerService);
  }

  async debug(): Promise<PhpDebuggerInstance> {
    const useNewDebugger = await passesGK('nuclide_hhvm_debugger_vscode');
    if (useNewDebugger) {
      // TODO: Ericblue - this will be cleaned up when the old debugger
      // is removed. For now we need to leave both in place until the new
      // one is ready.
      return this._hhvmDebug();
    }

    logger.info('Connecting to: ' + this.getTargetUri());
    this.preAttachActions();

    const rpcService = this._getRpcService();
    const sessionConfig = getSessionConfig(
      nuclideUri.getPath(this.getTargetUri()),
      false,
    );
    logger.info(`Connection session config: ${JSON.stringify(sessionConfig)}`);
    const result = await rpcService.debug(sessionConfig);
    logger.info(`Attach process result: ${result}`);

    return new PhpDebuggerInstance(this, rpcService);
  }

  _getRpcService(): PhpDebuggerServiceType {
    const service = getPhpDebuggerServiceByNuclideUri(this.getTargetUri());
    return new service.PhpDebuggerService();
  }

  _getCustomControlButtons(): Array<ControlButtonSpecification> {
    const customControlButtons = [
      {
        icon: 'link-external',
        title: 'Toggle HTTP Request Sender',
        onClick: () =>
          atom.commands.dispatch(
            atom.views.getView(atom.workspace),
            'nuclide-http-request-sender:toggle-http-request-edit-dialog',
          ),
      },
    ];
    try {
      return customControlButtons.concat(
        // $FlowFB
        require('./fb/services').customControlButtons,
      );
    } catch (_) {
      return customControlButtons;
    }
  }
}
