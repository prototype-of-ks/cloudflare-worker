export function onRequest(context) {
  return new Response(JSON.stringify(context.request), {
    headers: {
        'content-type': 'application/json;charset=UTF-8'
    }
  });
}
