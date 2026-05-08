// import { isClerkAPIResponseError } from '@clerk/nextjs/errors'
import { toast } from 'sonner'
import * as z from 'zod'

import { unknownError } from '@/lib/constants'

export function getErrorMessage(err: unknown) {
  if (err instanceof z.ZodError) {
    return err.errors[0]?.message ?? unknownError
  }
  else if (
    typeof err === 'object' &&
    err !== null &&
    'errors' in err &&
    Array.isArray((err as { errors?: Array<{ longMessage?: string; message?: string }> }).errors)
  ) {
    const clerkError = (err as { errors: Array<{ longMessage?: string; message?: string }> }).errors[0]
    return clerkError?.longMessage || clerkError?.message || unknownError
  }
  // else if (isClerkAPIResponseError(err)) {
  //   return err.errors[0]?.longMessage ?? unknownError
  // }
  else if (err instanceof Error) {
    return err.message
  } else {
    return unknownError
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err)
  toast.error(errorMessage)
  console.error(err)
}
