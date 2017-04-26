"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getDefinition = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "query",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 18
        },
        kind: "string"
      }
    }, {
      name: "position",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 19
        },
        kind: "named",
        name: "atom$Point"
      }
    }, {
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 20
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("getDefinition", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 21
        },
        kind: "named",
        name: "DefinitionQueryResult"
      });
    });
  };

  remoteModule.getDiagnostics = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "query",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 34
        },
        kind: "string"
      }
    }, {
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 35
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("getDiagnostics", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 36
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 36
          },
          kind: "named",
          name: "GraphQLDiagnosticMessage"
        }
      });
    });
  };

  remoteModule.getOutline = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "query",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 40
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("getOutline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 40
        },
        kind: "named",
        name: "Outline"
      });
    });
  };

  remoteModule.getAutocompleteSuggestions = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "query",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 51
        },
        kind: "string"
      }
    }, {
      name: "position",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 52
        },
        kind: "named",
        name: "atom$Point"
      }
    }, {
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 53
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("getAutocompleteSuggestions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 54
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 54
          },
          kind: "named",
          name: "GraphQLAutocompleteSuggestionType"
        }
      });
    });
  };

  remoteModule.disconnect = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("disconnect", "void", args);
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    getDefinition: {
      kind: "function",
      name: "getDefinition",
      location: {
        type: "source",
        fileName: "GraphQLServerService.js",
        line: 17
      },
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 17
        },
        kind: "function",
        argumentTypes: [{
          name: "query",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 18
            },
            kind: "string"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 19
            },
            kind: "named",
            name: "atom$Point"
          }
        }, {
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 20
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 21
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 21
            },
            kind: "named",
            name: "DefinitionQueryResult"
          }
        }
      }
    },
    GraphQLDiagnosticMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "GraphQLServerService.js",
        line: 25
      },
      name: "GraphQLDiagnosticMessage",
      definition: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 25
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 26
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 26
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 27
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 27
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 28
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 28
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 29
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 29
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 30
          },
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 30
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getDiagnostics: {
      kind: "function",
      name: "getDiagnostics",
      location: {
        type: "source",
        fileName: "GraphQLServerService.js",
        line: 33
      },
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 33
        },
        kind: "function",
        argumentTypes: [{
          name: "query",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 34
            },
            kind: "string"
          }
        }, {
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 35
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 36
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 36
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "GraphQLServerService.js",
                line: 36
              },
              kind: "named",
              name: "GraphQLDiagnosticMessage"
            }
          }
        }
      }
    },
    getOutline: {
      kind: "function",
      name: "getOutline",
      location: {
        type: "source",
        fileName: "GraphQLServerService.js",
        line: 40
      },
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 40
        },
        kind: "function",
        argumentTypes: [{
          name: "query",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 40
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 40
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 40
            },
            kind: "named",
            name: "Outline"
          }
        }
      }
    },
    GraphQLAutocompleteSuggestionType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "GraphQLServerService.js",
        line: 44
      },
      name: "GraphQLAutocompleteSuggestionType",
      definition: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 44
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 45
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 45
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 46
          },
          name: "typeName",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 46
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "GraphQLServerService.js",
                line: 46
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 47
          },
          name: "description",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 47
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "GraphQLServerService.js",
                line: 47
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    getAutocompleteSuggestions: {
      kind: "function",
      name: "getAutocompleteSuggestions",
      location: {
        type: "source",
        fileName: "GraphQLServerService.js",
        line: 50
      },
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 50
        },
        kind: "function",
        argumentTypes: [{
          name: "query",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 51
            },
            kind: "string"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 52
            },
            kind: "named",
            name: "atom$Point"
          }
        }, {
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 53
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 54
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "GraphQLServerService.js",
              line: 54
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "GraphQLServerService.js",
                line: 54
              },
              kind: "named",
              name: "GraphQLAutocompleteSuggestionType"
            }
          }
        }
      }
    },
    disconnect: {
      kind: "function",
      name: "disconnect",
      location: {
        type: "source",
        fileName: "GraphQLServerService.js",
        line: 59
      },
      type: {
        location: {
          type: "source",
          fileName: "GraphQLServerService.js",
          line: 59
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "GraphQLServerService.js",
            line: 59
          },
          kind: "void"
        }
      }
    },
    OutlineTree: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 13
      },
      name: "OutlineTree",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          name: "icon",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 14
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "plainText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          name: "tokenizedText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 18
            },
            kind: "named",
            name: "TokenizedText"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 19
          },
          name: "representativeName",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 19
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          name: "startPosition",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "endPosition",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 23
              },
              kind: "named",
              name: "OutlineTree"
            }
          },
          optional: false
        }]
      }
    },
    Outline: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 26
      },
      name: "Outline",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 26
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          name: "outlineTrees",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 27
              },
              kind: "named",
              name: "OutlineTree"
            }
          },
          optional: false
        }]
      }
    },
    TokenKind: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 13
      },
      name: "TokenKind",
      definition: {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 13
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 13
          },
          kind: "string-literal",
          value: "keyword"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 14
          },
          kind: "string-literal",
          value: "class-name"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 15
          },
          kind: "string-literal",
          value: "constructor"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 16
          },
          kind: "string-literal",
          value: "method"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 17
          },
          kind: "string-literal",
          value: "param"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 18
          },
          kind: "string-literal",
          value: "string"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 19
          },
          kind: "string-literal",
          value: "whitespace"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 20
          },
          kind: "string-literal",
          value: "plain"
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 21
          },
          kind: "string-literal",
          value: "type"
        }]
      }
    },
    TextToken: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 24
      },
      name: "TextToken",
      definition: {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 24
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 25
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "tokenizedText-rpc-types.js",
              line: 25
            },
            kind: "named",
            name: "TokenKind"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 26
          },
          name: "value",
          type: {
            location: {
              type: "source",
              fileName: "tokenizedText-rpc-types.js",
              line: 26
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    TokenizedText: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 29
      },
      name: "TokenizedText",
      definition: {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 29
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 29
          },
          kind: "named",
          name: "TextToken"
        }
      }
    },
    Definition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 23
      },
      name: "Definition",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 25
          },
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 25
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 26
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 26
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          name: "language",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 30
          },
          name: "projectRoot",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 30
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }]
      }
    },
    DefinitionQueryResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 36
      },
      name: "DefinitionQueryResult",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 36
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          name: "queryRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 37
              },
              kind: "named",
              name: "atom$Range"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 38
          },
          name: "definitions",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 38
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 38
              },
              kind: "named",
              name: "Definition"
            }
          },
          optional: false
        }]
      }
    }
  }
});