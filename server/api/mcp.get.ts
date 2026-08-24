/** Discovery: a GET on the MCP endpoint describes how to connect. */
export default defineEventHandler((event) => {
  setResponseHeaders(event, { 'Access-Control-Allow-Origin': '*' })
  return {
    name: 'openskill',
    transport: 'streamable-http',
    endpoint: 'https://vivekjoshy.com/api/mcp',
    method: 'POST',
    protocolVersion: '2025-06-18',
    tools: ['rate_match', 'predict_win', 'compare_models', 'ordinal'],
    documentation: 'https://vivekjoshy.com/mcp'
  }
})
