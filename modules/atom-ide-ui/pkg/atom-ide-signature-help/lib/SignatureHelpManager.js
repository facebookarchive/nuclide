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

import type {DatatipService} from '../../atom-ide-datatip/lib/types';
import type {SignatureHelpProvider} from './types';

import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';

export default class SignatureHelpManager {
  _datatipService: ?DatatipService;
  _providerRegistry: ProviderRegistry<SignatureHelpProvider>;

  constructor() {
    this._providerRegistry = new ProviderRegistry();
  }

  dispose() {}

  setDatatipService(service: ?DatatipService) {
    this._datatipService = service;
  }

  consumeSignatureHelp(provider: SignatureHelpProvider) {
    return this._providerRegistry.addProvider(provider);
  }
}
