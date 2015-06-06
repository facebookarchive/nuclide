'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type NuclideUri = string;

var NUCLIDE_URI_FLOW_TYPE_NAME = 'NuclideUri';

function isGenericFlowTypeAnnotation(typeAnnotation: ?any, annotationName: string): boolean {
   return !!typeAnnotation &&
      typeAnnotation.type === 'GenericTypeAnnotation' &&
      !!typeAnnotation.id &&
      typeAnnotation.id.type === 'Identifier' &&
      typeAnnotation.id.name === annotationName;
}

module.exports = {
  isGenericFlowTypeAnnotation,

  isNuclideUriFlowTypeAnnotation(typeAnnotation: ?any): boolean {
    return isGenericFlowTypeAnnotation(typeAnnotation, NUCLIDE_URI_FLOW_TYPE_NAME);
  },
};
