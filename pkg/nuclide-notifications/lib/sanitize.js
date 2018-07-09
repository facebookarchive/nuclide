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

import createDomPurify from 'dompurify';

const dompurify = createDomPurify();

/**
 * Sanitize a message for display in a notification. This removes HTML but also tries to be smart
 * about whitespace.
 */
export default function sanitize(message: string): string {
  // Add newlines where we see `<p>` and `<br />` tags.
  const withExtraNewlines = message.replace(
    /(<p(?:\s|>)|<\/p>|<br\s*\/?>)/g,
    '\n$1',
  );
  // Remove the HTML.
  const withoutTags = dompurify.sanitize(withExtraNewlines, {ALLOWED_TAGS: []});
  // Compress the whitespace.
  const withMinimalWhitespace = withoutTags
    .replace(/(?:\s*\n\s*)+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  return withMinimalWhitespace;
}
