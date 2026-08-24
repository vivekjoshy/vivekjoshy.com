import { d as defineEventHandler, s as setResponseHeaders } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const mcp_get = defineEventHandler((event) => {
  setResponseHeaders(event, { "Access-Control-Allow-Origin": "*" });
  return {
    name: "openskill",
    transport: "streamable-http",
    endpoint: "https://vivekjoshy.com/api/mcp",
    method: "POST",
    protocolVersion: "2025-06-18",
    tools: ["rate_match", "predict_win", "compare_models", "ordinal"],
    documentation: "https://vivekjoshy.com/mcp"
  };
});

export { mcp_get as default };
//# sourceMappingURL=mcp.get.mjs.map
