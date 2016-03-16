/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-env worker */
/* eslint-disable no-var */
/* global hh_add_dep */

var worker = self;

/**
 * Not used locally, but globally needed for hh_ide.js
 */
function caml_sys_getenv() { //eslint-disable-line no-unused-vars
  return '';
}

// This is a Hack :(
// Needed because some asserts added in D1606308 require this in the environment to do typing.
// Should come up with a better/more generic solution for hhi builtins in js_of_ocaml hack.
hh_add_dep(
  '/idx.hhi',
  '<?hh // decl\n function idx<Tk, Tv>(?Indexish<Tk, Tv> $collection, $index, $default = null) { }'
);

worker.addEventListener('message', function(e) {
  var data = e.data;
  var result = worker[data.cmd].apply(worker, data.args);
  worker.postMessage(result);
}, false);
