"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.compile = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("compile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "ClangCompileResult"
      });
    });
  };

  remoteModule.get_completions = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        kind: "number"
      }
    }, {
      name: "tokenStartColumn",
      type: {
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_completions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "ClangCompletion"
          }
        }
      });
    });
  };

  remoteModule.get_declaration = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_declaration", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "ClangDeclaration"
        }
      });
    });
  };

  remoteModule.get_declaration_info = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_declaration_info", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "ClangCursor"
          }
        }
      });
    });
  };

  remoteModule.get_outline = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_outline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "ClangOutlineTree"
          }
        }
      });
    });
  };

  remoteModule.get_local_references = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_local_references", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "ClangLocalReferences"
        }
      });
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
    ClangLocation: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 21
      },
      name: "ClangLocation",
      definition: {
        kind: "object",
        fields: [{
          name: "file",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          name: "point",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }]
      }
    },
    ClangSourceRange: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 26
      },
      name: "ClangSourceRange",
      definition: {
        kind: "object",
        fields: [{
          name: "file",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    ClangCompileResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 31
      },
      name: "ClangCompileResult",
      definition: {
        kind: "object",
        fields: [{
          name: "diagnostics",
          type: {
            kind: "array",
            type: {
              kind: "object",
              fields: [{
                name: "spelling",
                type: {
                  kind: "string"
                },
                optional: false
              }, {
                name: "severity",
                type: {
                  kind: "number"
                },
                optional: false
              }, {
                name: "location",
                type: {
                  kind: "named",
                  name: "ClangLocation"
                },
                optional: false
              }, {
                name: "ranges",
                type: {
                  kind: "nullable",
                  type: {
                    kind: "array",
                    type: {
                      kind: "named",
                      name: "ClangSourceRange"
                    }
                  }
                },
                optional: false
              }, {
                name: "fixits",
                type: {
                  kind: "array",
                  type: {
                    kind: "object",
                    fields: [{
                      name: "range",
                      type: {
                        kind: "named",
                        name: "ClangSourceRange"
                      },
                      optional: false
                    }, {
                      name: "value",
                      type: {
                        kind: "string"
                      },
                      optional: false
                    }]
                  }
                },
                optional: true
              }, {
                name: "children",
                type: {
                  kind: "array",
                  type: {
                    kind: "object",
                    fields: [{
                      name: "spelling",
                      type: {
                        kind: "string"
                      },
                      optional: false
                    }, {
                      name: "location",
                      type: {
                        kind: "named",
                        name: "ClangLocation"
                      },
                      optional: false
                    }, {
                      name: "ranges",
                      type: {
                        kind: "array",
                        type: {
                          kind: "named",
                          name: "ClangSourceRange"
                        }
                      },
                      optional: false
                    }]
                  }
                },
                optional: true
              }]
            }
          },
          optional: false
        }, {
          name: "accurateFlags",
          type: {
            kind: "boolean"
          },
          optional: true
        }]
      }
    },
    compile: {
      kind: "function",
      name: "compile",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 23
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 23
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "ClangCompileResult"
          }
        }
      }
    },
    ClangCompletion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 60
      },
      name: "ClangCompletion",
      definition: {
        kind: "object",
        fields: [{
          name: "chunks",
          type: {
            kind: "array",
            type: {
              kind: "object",
              fields: [{
                name: "spelling",
                type: {
                  kind: "string"
                },
                optional: false
              }, {
                name: "isPlaceHolder",
                type: {
                  kind: "boolean"
                },
                optional: true
              }, {
                name: "isOptional",
                type: {
                  kind: "boolean"
                },
                optional: true
              }, {
                name: "kind",
                type: {
                  kind: "string"
                },
                optional: true
              }]
            }
          },
          optional: false
        }, {
          name: "result_type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "spelling",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "cursor_kind",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "brief_comment",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "typed_name",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    get_completions: {
      kind: "function",
      name: "get_completions",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 27
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 27
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            kind: "number"
          }
        }, {
          name: "tokenStartColumn",
          type: {
            kind: "number"
          }
        }, {
          name: "prefix",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "ClangCompletion"
              }
            }
          }
        }
      }
    },
    ClangDeclaration: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 76
      },
      name: "ClangDeclaration",
      definition: {
        kind: "object",
        fields: [{
          name: "file",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "point",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          name: "spelling",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "extent",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    get_declaration: {
      kind: "function",
      name: "get_declaration",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 37
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 37
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "ClangDeclaration"
            }
          }
        }
      }
    },
    ClangCursorType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 19
      },
      name: "ClangCursorType",
      definition: {
        kind: "string"
      }
    },
    ClangCursor: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 84
      },
      name: "ClangCursor",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "named",
            name: "ClangCursorType"
          },
          optional: false
        }, {
          name: "cursor_usr",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "file",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          name: "extent",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "is_definition",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    get_declaration_info: {
      kind: "function",
      name: "get_declaration_info",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 45
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 45
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "ClangCursor"
              }
            }
          }
        }
      }
    },
    ClangOutlineTree: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 93
      },
      name: "ClangOutlineTree",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "extent",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "cursor_kind",
          type: {
            kind: "named",
            name: "ClangCursorType"
          },
          optional: false
        }, {
          name: "cursor_type",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "params",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "tparams",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "children",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "ClangOutlineTree"
            }
          },
          optional: true
        }]
      }
    },
    get_outline: {
      kind: "function",
      name: "get_outline",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 53
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 53
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "ClangOutlineTree"
              }
            }
          }
        }
      }
    },
    ClangLocalReferences: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 108
      },
      name: "ClangLocalReferences",
      definition: {
        kind: "object",
        fields: [{
          name: "cursor_name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "cursor_kind",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "references",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          },
          optional: false
        }]
      }
    },
    get_local_references: {
      kind: "function",
      name: "get_local_references",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 59
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 59
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "ClangLocalReferences"
            }
          }
        }
      }
    }
  }
});