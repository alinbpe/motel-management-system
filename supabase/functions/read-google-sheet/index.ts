
// Follow this setup guide to integrate the Deno runtime into your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs in Supabase Edge Functions.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { JWT } from "https://esm.sh/google-auth-library@9"

// Declare Deno global to avoid TypeScript errors in non-Deno environments
declare const Deno: any;

const SHEET_ID = '1yBDeTWnDwBDJecD4ub3NDOJRxci5-DOvYQrjQ3oHqLw';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    } })
  }

  try {
    // 1. Retrieve Service Account Credentials from Supabase Secrets
    const serviceAccountStr = Deno.env.get('GOOGLE_SERVICE_ACCOUNT')
    
    // Explicit check for missing secret to return a specific error code
    if (!serviceAccountStr) {
      console.error('Missing GOOGLE_SERVICE_ACCOUNT environment variable');
      return new Response(JSON.stringify({ 
        error: 'MISSING_SECRET', 
        message: 'The GOOGLE_SERVICE_ACCOUNT secret is not set in Supabase.' 
      }), {
        status: 500, // Internal Server Error
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      })
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountStr);
    } catch (e) {
        return new Response(JSON.stringify({ 
            error: 'INVALID_JSON', 
            message: 'The GOOGLE_SERVICE_ACCOUNT secret is not valid JSON.' 
        }), {
            status: 500,
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        })
    }

    // 2. Authenticate using Service Account
    const client = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    // 3. Request Data from Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:Z`
    
    try {
        const res = await client.request({ url })
        // 4. Return data to client
        return new Response(JSON.stringify(res.data), {
            headers: {
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (apiError: any) {
        // Handle Google API specific errors (like 403 Forbidden if sheet is not shared)
        console.error('Google API Error:', apiError.message);
        
        const status = apiError.response?.status || 500;
        const isPermissionError = status === 403 || status === 401;
        
        return new Response(JSON.stringify({ 
            error: isPermissionError ? 'PERMISSION_DENIED' : 'GOOGLE_API_ERROR', 
            message: apiError.message,
            client_email: serviceAccount.client_email // Return email to help user share the sheet
        }), {
            status: status,
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        })
    }

  } catch (error: any) {
    console.error('General Error:', error.message)
    return new Response(JSON.stringify({ error: 'INTERNAL_ERROR', message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
    })
  }
})
