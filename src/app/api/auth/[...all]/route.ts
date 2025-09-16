import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

const handler = toNextJsHandler(auth)

export const GET = async (req: Request) => {
  try {
    return await handler.GET(req)
  } catch (error) {
    console.error('Auth GET error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const POST = async (req: Request) => {
  try {
    return await handler.POST(req)
  } catch (error) {
    console.error('Auth POST error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}