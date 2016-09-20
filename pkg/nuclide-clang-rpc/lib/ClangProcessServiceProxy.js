"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.compile = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 23
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
          line: 23
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
          line: 28
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 29
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 30
        },
        kind: "number"
      }
    }, {
      name: "tokenStartColumn",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 31
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 32
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
          line: 33
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 33
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 33
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
          line: 38
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 39
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 40
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
          line: 41
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 41
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
          line: 46
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 47
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 48
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
          line: 49
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 49
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 49
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
    trackOperationTiming = arguments[1];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["compile", {
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
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 23
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 23
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 23
          },
          kind: "named",
          name: "ClangCompileResult"
        }
      }
    }
  }], ["get_completions", {
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
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 28
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 29
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 30
          },
          kind: "number"
        }
      }, {
        name: "tokenStartColumn",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 31
          },
          kind: "number"
        }
      }, {
        name: "prefix",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 32
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 33
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 33
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 33
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangProcessService.js",
                line: 33
              },
              kind: "named",
              name: "ClangCompletion"
            }
          }
        }
      }
    }
  }], ["get_declaration", {
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
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 38
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 39
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 40
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 41
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 41
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 41
            },
            kind: "named",
            name: "ClangDeclaration"
          }
        }
      }
    }
  }], ["get_declaration_info", {
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
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 46
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 47
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 48
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangProcessService.js",
          line: 49
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangProcessService.js",
            line: 49
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangProcessService.js",
              line: 49
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangProcessService.js",
                line: 49
              },
              kind: "named",
              name: "ClangCursor"
            }
          }
        }
      }
    }
  }], ["get_outline", {
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
  }], ["get_local_references", {
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
  }], ["ClangCursorType", {
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
  }], ["ClangCursorExtent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 21
    },
    name: "ClangCursorExtent",
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
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
              },
              kind: "number"
            },
            optional: false
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "end",
        type: {
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
              line: 23
            },
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 23
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 23
              },
              kind: "number"
            },
            optional: false
          }]
        },
        optional: false
      }]
    }
  }], ["ClangLocation", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 26
    },
    name: "ClangLocation",
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
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
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
          line: 29
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["ClangSourceRange", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 32
    },
    name: "ClangSourceRange",
    definition: {
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
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 34
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            name: "line",
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
              line: 34
            },
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 34
              },
              kind: "number"
            },
            optional: false
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 35
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 35
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
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 35
              },
              kind: "number"
            },
            optional: false
          }]
        },
        optional: false
      }]
    }
  }], ["ClangCompileResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 38
    },
    name: "ClangCompileResult",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 38
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 39
        },
        name: "diagnostics",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 39
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 39
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 40
              },
              name: "spelling",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 40
                },
                kind: "string"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 41
              },
              name: "severity",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 41
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 42
              },
              name: "location",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 42
                },
                kind: "named",
                name: "ClangLocation"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 43
              },
              name: "ranges",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 43
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 43
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 43
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
                line: 44
              },
              name: "fixits",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 44
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 44
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 45
                    },
                    name: "range",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 45
                      },
                      kind: "named",
                      name: "ClangSourceRange"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 46
                    },
                    name: "value",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 46
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
                line: 56
              },
              name: "children",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 56
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 56
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 57
                    },
                    name: "spelling",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 57
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 58
                    },
                    name: "location",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 58
                      },
                      kind: "named",
                      name: "ClangLocation"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 59
                    },
                    name: "ranges",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 59
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 59
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
          line: 64
        },
        name: "accurateFlags",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 64
          },
          kind: "boolean"
        },
        optional: true
      }]
    }
  }], ["ClangCompletion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 67
    },
    name: "ClangCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 67
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 68
        },
        name: "chunks",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 68
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 68
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 69
              },
              name: "spelling",
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
              name: "isPlaceHolder",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 70
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 71
              },
              name: "isOptional",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 71
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 72
              },
              name: "kind",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 72
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
          line: 74
        },
        name: "result_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 74
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 75
        },
        name: "spelling",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 75
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 76
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 76
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 77
        },
        name: "brief_comment",
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
      }]
    }
  }], ["ClangDeclaration", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 80
    },
    name: "ClangDeclaration",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 80
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 81
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 81
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 82
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 82
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 83
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 83
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 84
        },
        name: "spelling",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 84
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 84
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 85
        },
        name: "type",
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
            kind: "string"
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
          name: "ClangCursorExtent"
        },
        optional: false
      }]
    }
  }], ["ClangCursor", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 89
    },
    name: "ClangCursor",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 89
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 90
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 90
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 91
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 91
          },
          kind: "named",
          name: "ClangCursorType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 92
        },
        name: "cursor_usr",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 92
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 93
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 93
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 93
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
          line: 94
        },
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 94
          },
          kind: "named",
          name: "ClangCursorExtent"
        },
        optional: false
      }]
    }
  }], ["ClangOutlineTree", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 97
    },
    name: "ClangOutlineTree",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 97
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 98
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 98
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 99
        },
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 99
          },
          kind: "named",
          name: "ClangCursorExtent"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 100
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 100
          },
          kind: "named",
          name: "ClangCursorType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 102
        },
        name: "cursor_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 102
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 105
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 105
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 105
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 107
        },
        name: "tparams",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 107
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 107
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 109
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 109
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 109
            },
            kind: "named",
            name: "ClangOutlineTree"
          }
        },
        optional: true
      }]
    }
  }], ["ClangLocalReferences", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 112
    },
    name: "ClangLocalReferences",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 112
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 113
        },
        name: "cursor_name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 113
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 114
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 114
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 115
        },
        name: "references",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 115
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 115
            },
            kind: "named",
            name: "ClangCursorExtent"
          }
        },
        optional: false
      }]
    }
  }]])
});