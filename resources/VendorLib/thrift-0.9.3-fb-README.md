thrift-0.9.3-fb
---------------

This is a fork of https://www.npmjs.com/package/thrift that omits all of the unnecessary files (28M vs 252K) that ship with thrift@0.9.3. It's been [fixed](https://github.com/apache/thrift/pull/672#issuecomment-158733257) upstream, but not (yet) published.

_To not poison the user's npm cache, this fork is versioned as `0.9.3-fb`._

**Please undo this and use the proper npm version when 0.9.4 is published:**
  * Remove `/resources/VendorLib/thrift-0.9.3-fb`.
  * Remove the negation entry `!/resources/VendorLib/thrift-0.9.3-fb*` from `/.npmignore`.
  * Remove it from the VerifyLicenseHeaders check.
  * Change the version for `thrift` in `/package.json` to the published version.
