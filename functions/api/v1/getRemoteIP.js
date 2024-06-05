export async function onRequest(context) {
    const { request } = context;
    
    // Extract method, URL, and headers from the request
    const method = request.method;
    const url = request.url;
    const headers = {};
    
    for (const [key, value] of request.headers.entries()) {
      headers[key] = value;
    }
  
    // Optionally, you can read the request body if needed
    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }
  
    // Construct a JSON response
    const responseData = {
      method,
      url,
      headers,
      body,
    };
  
    return new Response(JSON.stringify(responseData, null, 2), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  }
  