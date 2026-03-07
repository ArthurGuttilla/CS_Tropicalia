import { NextResponse } from 'next/server'
import { TropicaliaError } from './tropicalia'

/**
 * Wraps a route handler body in standard error handling.
 * Returns a NextResponse with the appropriate HTTP status on TropicaliaError
 * or a generic 500 for unexpected errors.
 */
export async function handleRoute<T>(
  fn: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | { error: string }>> {
  try {
    return await fn()
  } catch (err) {
    const status = err instanceof TropicaliaError ? err.status : 500
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status }) as NextResponse<{ error: string }>
  }
}
