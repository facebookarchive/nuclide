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

import * as React from 'react';
import {capitalize} from 'nuclide-commons/string';
import classnames from 'classnames';

const TYPE_TO_CLASSNAME_SUFFIX = {
  array: 'type-array',
  boolean: 'type-boolean',
  class: 'type-class',
  constant: 'type-constant',
  constructor: 'type-constructor',
  enum: 'type-enum',
  field: 'type-field',
  file: 'type-file',
  function: 'type-function',
  interface: 'type-interface',
  method: 'type-method',
  module: 'type-module',
  namespace: 'type-namespace',
  number: 'type-number',
  package: 'type-package',
  property: 'type-property',
  string: 'type-string',
  variable: 'type-variable',
};

type AtomiconName = $Keys<typeof TYPE_TO_CLASSNAME_SUFFIX>;

export default function Atomicon({type}: {type: AtomiconName}) {
  const displayName = capitalize(type);
  return (
    <span
      aria-label={displayName}
      className={classnames('icon', 'icon-' + TYPE_TO_CLASSNAME_SUFFIX[type])}
      role="presentation"
      title={displayName}
    />
  );
}
