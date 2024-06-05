export function onRequest(context) {
  return new Response(JSON.parse(context), {
    headers: {
        'content-type': 'application/json;charset=UTF-8'
    }
  });
}
