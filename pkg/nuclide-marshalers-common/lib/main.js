'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {PredefinedTransformer} from '../../nuclide-rpc';

import nuclideUri from '../../commons-node/nuclideUri';

export function getRemoteNuclideUriMarshalers(hostname: string): PredefinedTransformer {
  return {
    typeName: nuclideUri.NUCLIDE_URI_TYPE_NAME,
    marshaller: remoteUri => nuclideUri.getPath(remoteUri),
    unmarshaller: path => nuclideUri.createRemoteUri(hostname, path),
  };
}

export const localNuclideUriMarshalers: PredefinedTransformer =
  {
    typeName: nuclideUri.NUCLIDE_URI_TYPE_NAME,
    marshaller: uri => uri,
    unmarshaller: remotePath => remotePath,
  };
