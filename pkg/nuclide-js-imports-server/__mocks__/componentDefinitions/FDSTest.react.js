/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
'use strict';
/* eslint-disable nuclide-internal/no-unresolved */

/* eslint-disable nuclide-internal/no-commonjs */

/* eslint-disable dependencies/case-sensitive */

/* eslint-disable react/no-unused-prop-types */

const React = require('React');

/**
 * @explorer-desc
 *
 * Test!
 */
class FDSTest extends React.PureComponent {} // eslint-disable-next-line


FDSTest.defaultProps = {
  type: 'regular',
  optionalValue: 50
};
module.exports = FDSTest;