import { d as defineEventHandler, s as setResponseHeaders, a as setResponseStatus } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const mcp_options = defineEventHandler((event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, mcp-protocol-version",
    "Access-Control-Max-Age": "86400"
  });
  setResponseStatus(event, 204);
  return null;
});

export { mcp_options as default };
//# sourceMappingURL=mcp.options.mjs.map
