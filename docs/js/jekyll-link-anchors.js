/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Taken and modified from https://gist.github.com/SimplGy/a229d25cdb19d7f21231
(function() {
  'use strict';

  // Create intra-page links
  // Requires that your headings already have an `id` attribute set (because that's what jekyll
  // does). For every heading in your page, this adds a little anchor link `#` that you can click
  // to get a permalink to the heading. Ignores `h1`, because you should only have one per page.
  // The text content of the tag is used to generate the link, so it will fail "gracefully-ish" if
  //you have duplicate heading text.

  var headingNodes = [];
  var results;
  var link;
  var tags = ['h2', 'h3', 'h4', 'h5', 'h6'];

  tags.forEach(function(tag) {
    results = document.getElementsByTagName(tag);
    Array.prototype.push.apply(headingNodes, results);
  });

  headingNodes.forEach(function(node) {
    link = document.createElement('a');
    link.className = 'header-link';
    link.textContent = '#';
    link.href = '#' + node.getAttribute('id');
    node.appendChild(link);
  });

})();
