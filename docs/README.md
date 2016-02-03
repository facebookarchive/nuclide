# User Documentation for nuclide.io

This directory will contain the user and feature documentation for Nuclide.

### Run the Site Locally

1. Make sure you have Ruby and [RubyGems](https://rubygems.org/) installed
2. Make sure you have [Bundler](http://bundler.io/) installed

    gem install bundler
3. Install the project's dependencies

    bundle install
4. Run Jekyll's server

    bundle exec jekyll serve
5. The site will be served from http://localhost:4000

### Updating the Bundle

The site depends on Github Pages and the installed bundle is based on the `github-pages` gem.
Occasionally that gem might get updated with new or changed functionality. If that is the case,
you can run:

    bundle update

to get the latest packages for the installation.
