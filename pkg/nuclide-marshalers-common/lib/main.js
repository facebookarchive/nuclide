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
import {Range as AtomRange, Point as AtomPoint} from 'atom';
import {Range as ServerRange, Point as ServerPoint} from 'simple-text-buffer';

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
    marshaller: uri => {
      nuclideUri.validate(uri, false);
      return uri;
    },
    unmarshaller: remotePath => {
      nuclideUri.validate(remotePath, false);
      return remotePath;
    },
  };

const jsonToAtomPoint = json => new AtomPoint(json.row, json.column);
const jsonToAtomRange = json =>
  new AtomRange(jsonToAtomPoint(json.start), jsonToAtomPoint(json.end));

export function getAtomSideMarshalers(hostname: string): Array<PredefinedTransformer> {
  return [
    getRemoteNuclideUriMarshalers(hostname),
    {
      typeName: 'atom$Point',
      marshaller: point => point,
      unmarshaller: jsonToAtomPoint,
    },
    {
      typeName: 'atom$Range',
      marshaller: range => range,
      unmarshaller: jsonToAtomRange,
    },
  ];
}

export const getAtomSideLoopbackMarshalers: Array<PredefinedTransformer> = [
  localNuclideUriMarshalers,
  {
    typeName: 'atom$Point',
    marshaller: point => point,
    unmarshaller: jsonToAtomPoint,
  },
  {
    typeName: 'atom$Range',
    marshaller: range => range,
    unmarshaller: jsonToAtomRange,
  },
];

const jsonToServerPoint = json => new ServerPoint(json.row, json.column);
const jsonToServerRange = json =>
  new ServerRange(jsonToServerPoint(json.start), jsonToServerPoint(json.end));

export const getServerSideMarshalers: Array<PredefinedTransformer> = [
  localNuclideUriMarshalers,
  {
    typeName: 'atom$Point',
    marshaller: point => point,
    unmarshaller: jsonToServerPoint,
  },
  {
    typeName: 'atom$Range',
    marshaller: range => range,
    unmarshaller: jsonToServerRange,
  },
];
