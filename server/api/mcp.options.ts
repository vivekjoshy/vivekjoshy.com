/**
 * CORS preflight.
 *
 * A cross-origin fetch with content-type: application/json triggers a
 * preflight. Without this route it 404'd with no allow headers, so the
 * permissive headers on the POST never served the case they exist for and no
 * browser-based MCP client could connect.
 */
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, mcp-protocol-version',
    'Access-Control-Max-Age': '86400'
  })
  setResponseStatus(event, 204)
  return null
})
