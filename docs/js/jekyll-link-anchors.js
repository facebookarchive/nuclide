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

  // This also allows us to have uniquely named links even with headings of the same name.
  // e.g.,
  //   h2: Mac  (#mac)
  //     h3: prerequisites (#mac__prerequisites)
  //   h2: Linux (#linux)
  //     h3: prerequisites (#linux__prerequisites)

  var headingNodes = [];
  var results;
  var tags = ['h2', 'h3']; // Avoid having 4+ levels of headings, linkable at least

  tags.forEach(function(tag) {
    results = document.getElementsByTagName(tag);
    Array.prototype.push.apply(headingNodes, results);
  });

  headingNodes.forEach(function(node) {
    var link;
    var id;
    var psib;
    link = document.createElement('a');
    link.className = 'header-link';
    link.textContent = '#';
    id = '';
    // Avoid duplicate anchor links
    // If we are at an h3, go through the previous element siblings of this node, and find its
    // h2 parent and append it to the href text.
    if (node.localName === 'h3') {
      psib = node.previousElementSibling;
      while (psib) {
        // this should be an h2 99.9% of the time, but if not, we can still create the link.
        if (headingNodes.indexOf(psib) !== -1) {
          id += psib.getAttribute('id') + '__';
          break;
        }
        psib = psib.previousElementSibling;
      }
    }
    link.id = id + node.getAttribute('id');
    link.href = "#" + link.id;
    node.appendChild(link);
  });

})();
