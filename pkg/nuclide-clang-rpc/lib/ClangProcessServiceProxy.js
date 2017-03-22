"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.compile = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 22
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("compile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 22
        },
        kind: "named",
        name: "ClangCompileResult"
      });
    });
  };

  remoteModule.get_completions = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 27
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 28
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 29
        },
        kind: "number"
      }
    }, {
      name: "tokenStartColumn",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 30
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 31
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_completions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 32
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 32
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 32
            },
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
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 37
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 38
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 39
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_declaration", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 40
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 40
          },
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
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 45
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 46
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 47
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_declaration_info", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 48
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 48
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 48
            },
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
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 53
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_outline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 54
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 54
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 54
            },
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
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 59
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 60
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 61
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_local_references", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 62
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 62
          },
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
    compile: {
      kind: "function",
      name: "compile",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 22
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 22
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 22
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 22
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 22
            },
            kind: "named",
            name: "ClangCompileResult"
          }
        }
      }
    },
    get_completions: {
      kind: "function",
      name: "get_completions",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 26
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 26
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 27
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 28
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 29
            },
            kind: "number"
          }
        }, {
          name: "tokenStartColumn",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 30
            },
            kind: "number"
          }
        }, {
          name: "prefix",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 31
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 32
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 32
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangProcessService.js",
                line: 32
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangProcessService.js",
                  line: 32
                },
                kind: "named",
                name: "ClangCompletion"
              }
            }
          }
        }
      }
    },
    get_declaration: {
      kind: "function",
      name: "get_declaration",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 36
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 36
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 37
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 38
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 39
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 40
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 40
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangProcessService.js",
                line: 40
              },
              kind: "named",
              name: "ClangDeclaration"
            }
          }
        }
      }
    },
    get_declaration_info: {
      kind: "function",
      name: "get_declaration_info",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 44
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 44
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 45
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 46
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 47
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 48
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 48
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangProcessService.js",
                line: 48
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangProcessService.js",
                  line: 48
                },
                kind: "named",
                name: "ClangCursor"
              }
            }
          }
        }
      }
    },
    get_outline: {
      kind: "function",
      name: "get_outline",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 52
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 52
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 53
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 54
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 54
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangProcessService.js",
                line: 54
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangProcessService.js",
                  line: 54
                },
                kind: "named",
                name: "ClangOutlineTree"
              }
            }
          }
        }
      }
    },
    get_local_references: {
      kind: "function",
      name: "get_local_references",
      location: {
        type: "source",
        fileName: "ClangProcessService.js",
        line: 58
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 58
        },
        kind: "function",
        argumentTypes: [{
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 59
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 60
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 61
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 62
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 62
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangProcessService.js",
                line: 62
              },
              kind: "named",
              name: "ClangLocalReferences"
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 19
        },
        kind: "string"
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
              },
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "point",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
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
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 27
              },
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 31
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          name: "diagnostics",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 32
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 32
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 33
                },
                name: "spelling",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 33
                  },
                  kind: "string"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 34
                },
                name: "severity",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 34
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 35
                },
                name: "location",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 35
                  },
                  kind: "named",
                  name: "ClangLocation"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 36
                },
                name: "ranges",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 36
                  },
                  kind: "nullable",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 36
                    },
                    kind: "array",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 36
                      },
                      kind: "named",
                      name: "ClangSourceRange"
                    }
                  }
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 37
                },
                name: "fixits",
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
                    kind: "object",
                    fields: [{
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 38
                      },
                      name: "range",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 38
                        },
                        kind: "named",
                        name: "ClangSourceRange"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 39
                      },
                      name: "value",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 39
                        },
                        kind: "string"
                      },
                      optional: false
                    }]
                  }
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 49
                },
                name: "children",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 49
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 49
                    },
                    kind: "object",
                    fields: [{
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 50
                      },
                      name: "spelling",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 50
                        },
                        kind: "string"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 51
                      },
                      name: "location",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 51
                        },
                        kind: "named",
                        name: "ClangLocation"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 52
                      },
                      name: "ranges",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 52
                        },
                        kind: "array",
                        type: {
                          location: {
                            type: "source",
                            fileName: "rpc-types.js",
                            line: 52
                          },
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
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 57
          },
          name: "accurateFlags",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 57
            },
            kind: "boolean"
          },
          optional: true
        }]
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 60
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 61
          },
          name: "chunks",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 61
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 61
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 62
                },
                name: "spelling",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 62
                  },
                  kind: "string"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 63
                },
                name: "isPlaceHolder",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 63
                  },
                  kind: "boolean"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 64
                },
                name: "isOptional",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 64
                  },
                  kind: "boolean"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 65
                },
                name: "kind",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 65
                  },
                  kind: "string"
                },
                optional: true
              }]
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 67
          },
          name: "result_type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 67
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 68
          },
          name: "spelling",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 68
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 69
          },
          name: "cursor_kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 69
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 70
          },
          name: "brief_comment",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 70
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 70
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ClangDeclaration: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 73
      },
      name: "ClangDeclaration",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 73
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 74
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 74
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 75
          },
          name: "point",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 75
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 76
          },
          name: "spelling",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 76
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 76
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 77
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 77
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 77
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 78
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 78
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    ClangCursor: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 81
      },
      name: "ClangCursor",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 81
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 82
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 82
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 83
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 83
            },
            kind: "named",
            name: "ClangCursorType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 84
          },
          name: "cursor_usr",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 84
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 85
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 85
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 85
              },
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 86
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 86
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 87
          },
          name: "is_definition",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 87
            },
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    ClangOutlineTree: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 90
      },
      name: "ClangOutlineTree",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 90
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 91
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 91
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 92
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 92
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 93
          },
          name: "cursor_kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 93
            },
            kind: "named",
            name: "ClangCursorType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 95
          },
          name: "cursor_type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 95
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 98
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 98
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 98
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 100
          },
          name: "tparams",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 100
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 100
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 102
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 102
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 102
              },
              kind: "named",
              name: "ClangOutlineTree"
            }
          },
          optional: true
        }]
      }
    },
    ClangLocalReferences: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 105
      },
      name: "ClangLocalReferences",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 105
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 106
          },
          name: "cursor_name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 106
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 107
          },
          name: "cursor_kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 107
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 108
          },
          name: "references",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 108
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 108
              },
              kind: "named",
              name: "atom$Range"
            }
          },
          optional: false
        }]
      }
    }
  }
});