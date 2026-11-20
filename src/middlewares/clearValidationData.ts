import type { NextFunction, Request, Response } from 'express'
import { clearValidationData } from '../handlers/validators/validationData'
import { debugLog } from '../utils/debugLog'

// Writes below these API paths change cards, printings, packs or formats. '/cards' also
// covers '/cards-in-packs'.
const CARD_DATA_PATHS = ['/cards', '/packs', '/cycles', '/formats']

/**
 * Clears the data deck validation caches after a successful write that can change it, so a
 * new ban list or a rotated pack applies to the next validation right away.
 */
export function clearValidationDataAfterWrites(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.method !== 'GET' && CARD_DATA_PATHS.some((path) => req.path.startsWith(path))) {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        clearValidationData()
        debugLog(`[validate] cache cleared after ${req.method} ${req.originalUrl}`)
      }
    })
  }
  next()
}
