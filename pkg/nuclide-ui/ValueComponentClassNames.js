/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import classnames from 'classnames';

// TODO remove this once Atom 1.13 is the de-factor Atom version
function addSyntaxVariants(classNames: string): string {
  return classnames(classNames, ...classNames.split(' ').map(name => `syntax--${name}`));
}

// A very basic heuristic for coloring the values.
export const ValueComponentClassNames = {
  string: addSyntaxVariants('string quoted double'),
  stringOpeningQuote: addSyntaxVariants('punctuation definition string begin'),
  stringClosingQuote: addSyntaxVariants('punctuation definition string end'),
  number: addSyntaxVariants('constant numeric'),
  nullish: addSyntaxVariants('constant language null'),
  identifier: addSyntaxVariants('variable'),
  boolean: addSyntaxVariants('constant language boolean'),
};
