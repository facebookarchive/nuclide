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

  // We don't want anchors for any random h2 or h3; only ones with an
  // id attribute which aren't in h2's and h3's in the sidebar ToC and
  // header bar.
  var possibleNodeNames = ['h2', 'h3', 'h4', 'h5']; // Really try to only have up to h3, please
  var tags = document.querySelectorAll('h2[id], h3[id], h4[id], h5[id]');
  var headingNodes = Array.prototype.slice.call(tags);
  var results;

  headingNodes.forEach(function(node) {
    var nameIdx = possibleNodeNames.indexOf(node.localName); // h2 = 0, h3 = 1, etc.
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
    psib = node.previousElementSibling;
    var idx;
    while (psib) {
      // Find the parent, if it exists.
      idx = possibleNodeNames.indexOf(psib.localName);
      if (idx !== -1 && idx === nameIdx - 1) { // if we are at h3, we want h2. That's why the - 1
        id += psib.getAttribute('id') + '__';
        break;
      }
      psib = psib.previousElementSibling;
    }
    link.id = id + node.getAttribute('id');
    link.href = "#" + link.id;
    node.appendChild(link);
  });

})();
