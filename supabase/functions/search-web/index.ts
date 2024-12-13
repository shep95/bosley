import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log('Processing query:', query);

    // Use OpenAI to generate a response
    console.log('Sending request to OpenAI');
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are Daarp, a helpful and engaging AI assistant. You should be friendly, conversational, and direct in your responses. You can handle a wide range of topics including calculations, general knowledge, and personal advice. Always maintain a helpful and positive tone.'
          },
          {
            role: 'user',
            content: query
          }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    console.log('OpenAI response received');

    if (aiData.error) {
      throw new Error(aiData.error.message);
    }

    return new Response(JSON.stringify({ 
      response: aiData.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-web function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});