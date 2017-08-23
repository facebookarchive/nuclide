'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/* eslint-disable no-console */

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args) {
    const argv = yield new Promise(function (resolve, reject) {
      resolve((_yargs || _load_yargs()).default.usage(`Usage: atom-script ${__dirname}/markdown.js -o <output file> <input file>`).help('h').alias('h', 'help').option('out', {
        alias: 'o',
        demand: false,
        describe: 'Must specify a path to an output file.',
        type: 'string'
      }).demand(1, 'Must specify a path to a Markdown file.').exitProcess(false).fail(reject) // This will bubble up and cause runCommand() to reject.
      .parse(args));
    });

    // When this happens, the help text has already been printed to stdout.
    if (argv.help) {
      return 1;
    }

    const markdownFile = resolvePath(argv._[0]);

    // don't want to pull in too many Nuclide dependencies here
    // eslint-disable-next-line nuclide-internal/atom-apis
    const textEditor = yield atom.workspace.open(markdownFile);
    yield atom.packages.activatePackage('markdown-preview');

    // Use markdown-preview to generate the HTML.
    const markdownPreviewPackage = atom.packages.getActivePackage('markdown-preview');

    if (!markdownPreviewPackage) {
      throw new Error('Invariant violation: "markdownPreviewPackage"');
    }
    // Apparently copyHtml() is exposed as an export of markdown-preview.


    markdownPreviewPackage.mainModule.copyHtml();
    // Note it should be possible to get the HTML via MarkdownPreviewView.getHTML(),
    // but that was causing this script to lock up, for some reason.
    const htmlBody = atom.clipboard.read();

    // Attempt to try to load themes so that getMarkdownPreviewCSS() loads the right CSS.
    yield atom.themes.activateThemes();

    // We create a MarkdownPreviewView to call its getMarkdownPreviewCSS() method.
    // $FlowIssue: Need to dynamically load a path.
    const MarkdownPreviewView = require((_nuclideUri || _load_nuclideUri()).default.join(markdownPreviewPackage.path, 'lib/markdown-preview-view.js'));
    const view = new MarkdownPreviewView({
      editorId: textEditor.id,
      filePath: markdownFile
    });
    const styles = view.getMarkdownPreviewCSS();

    const title = `${markdownFile}.html`;
    // It is not obvious from markdown-preview/lib/markdown-preview-view.coffee#saveAs
    // that the data-use-github-style attribute is key to this working.
    // https://github.com/atom/markdown-preview/pull/335 drew my attention to it.
    //
    // That said, although this attribute improves things, the resulting styles still do not match
    // exactly what you see in Atom. I think this is due to the translation of <atom-text-editor>
    // to <pre> elements, which seems a little off.
    const html = `\
<!DOCTYPE html>
<html>
  <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>${styles}</style>
  </head>
  <body class="markdown-preview" data-use-github-style>${htmlBody}</body>
</html>`;

    if (argv.out == null) {
      console.log(html);
    } else {
      const outputFile = resolvePath(argv.out);
      _fs.default.writeFileSync(outputFile, html);
    }

    return 0;
  });

  function runCommand(_x) {
    return _ref.apply(this, arguments);
  }

  return runCommand;
})();

// TODO(mbolin): Consider using fs-plus to ensure this handles ~ in fileName correctly.


function resolvePath(fileName) {
  if (!(_nuclideUri || _load_nuclideUri()).default.isAbsolute(fileName)) {
    const pwd = process.env.PWD;
    // flowlint-next-line sketchy-null-string:off

    if (!pwd) {
      throw new Error('Invariant violation: "pwd"');
    }

    return (_nuclideUri || _load_nuclideUri()).default.join(pwd, fileName);
  } else {
    return fileName;
  }
}