export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Contact form submission
      if (path === '/api/contact' && request.method === 'POST') {
        const { name, email, message } = await request.json();

        // Basic validation
        if (!name || !email || !message) {
          return new Response(
            JSON.stringify({ error: 'All fields are required' }),
            { 
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }

        const newMessage = {
          id: crypto.randomUUID(),
          name,
          email,
          message,
          date: new Date().toISOString()
        };

        // Store message in KV
        await env.MESSAGES_KV.put(newMessage.id, JSON.stringify(newMessage));

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Message sent successfully!'
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }

      // Get all messages
      if (path === '/api/messages' && request.method === 'GET') {
        const messages = [];
        const list = await env.MESSAGES_KV.list();
        
        for (const key of list.keys) {
          const message = await env.MESSAGES_KV.get(key.name, 'json');
          messages.push(message);
        }

        return new Response(
          JSON.stringify(messages),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }

      // Serve static files
      return env.ASSETS.fetch(request);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Server error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  },
}; 