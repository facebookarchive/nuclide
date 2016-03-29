'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {OutlineProvider} from '../../nuclide-outline-view';

const PYTHON_GRAMMARS = ['source.python'];

module.exports = {
  activate() {
  },

  provideOutlines(): OutlineProvider {
    const {PythonOutlineProvider} = require('./PythonOutlineProvider');
    const provider = new PythonOutlineProvider();
    return {
      grammarScopes: PYTHON_GRAMMARS,
      priority: 1,
      name: 'Python',
      getOutline: provider.getOutline.bind(provider),
    };
  },

  deactivate() {
  },
};
