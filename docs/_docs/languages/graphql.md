---
pageid: language-graphql
title: GraphQL
layout: docs
permalink: /docs/languages/graphql/
---

Nuclide has built-in support for [GraphQL](http://graphql.org/) using the [GraphQL Language Service](https://github.com/graphql/graphql-language-service).

* TOC
{:toc}

## Installing GraphQL

Several [server libraries](http://graphql.org/code/) are provided for GraphQL implementation in a wide range of languages.

The GraphQL Language Service needs to know some information about your GraphQL development environment to provide its full feature set.  A GraphQL configuration file (`.graphqlrc`) contains this information. The `.graphqlrc` file can define multiple configurations for each GraphQL environment, should you have more than one.

Make sure the `.graphqlrc` file is configured and saved in your project's top-level directory. For more information on how to configure your `.graphqlrc` file, refer to the [GraphQL Language Service documentation](https://github.com/graphql/graphql-language-service#graphql-configuration-file-graphqlrc).

Opening a `.graphql` file in Nuclide will trigger the GraphQL support.

## Features

GraphQL's integration into Nuclide provides you with productivity features such as:

- [Autocomplete](#features__autocomplete)
- [Go to Definition](#features__go-to-definition)
- [Outline View](#features__outline-view)
- [Context View](#features__context-view)
- [Code Diagnostics](#features__code-diagnostics)

### Autocomplete

Nuclide has access to the schema type information in your project when the GraphQL configuration file (`.graphqlrc`) is defined, so autocomplete just works.

![](/static/images/docs/language-graphql-autocomplete.png)

### Go to Definition

Nuclide provides a **Go to Definition** feature for fragments in `.graphql` files.

For example, if you want to go to the definition of `pilotFragment`, hover over `...pilotFragment` and either press `Cmd-<click>` or `Cmd-Option-Enter`.  You can also *right-click* on the fragment, and select **Go to Declaration** from the pop-up menu.

![](/static/images/docs/language-graphql-gotodefinition.png)

The cursor will jump to the definition even if it's in another file.

![](/static/images/docs/language-graphql-definitionjump.png)

### Outline View

Nuclide's [Outline View](/docs/features/outline-view) allows you to see an outline of a `.graphql` file's queries, fragments, fields, etc. at-a-glance so you can navigate quickly.

![](/static/images/docs/language-graphql-outline-view.png)

### Context View

Nuclide's [Context View](/docs/features/context-view) allows you to quickly see and navigate between fragments and their definitions.

![](/static/images/docs/language-graphql-context-view.png)

### Code Diagnostics

Nuclide has code diagnostics that will show lint and validation errors in your `.graphql` file.  You can see the errors in two places, inline within the [Editing Area](/docs/editor/basics/#editing-area) and in the [Code Diagnostics](/docs/editor/basics/#status-bar__code-diagnostics) pane below.

![](/static/images/docs/language-graphql-diagnostics-pane.png)

Hover over the sideways red triangle in the [gutter](/docs/editor/basics/#gutter) to see the error inline.

<img src="/static/images/docs/language-graphql-inline-error.png" style="width:800px" />
