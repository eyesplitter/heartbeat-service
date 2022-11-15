import { Request, Response, NextFunction } from 'express'
import { CustomError } from './customError'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() })
  }

  console.error(err)
  res.status(400).json({
    errors: [{ message: 'Something went wrong' }],
  })
}
