export class CustomAPIError extends Error {
     constructor(message, statusCode) {
          super(message)
          this.statusCode = statusCode
     }
}

export const createError = (message, statusCode) => {
     return new CustomAPIError(message, statusCode)
}

export const errorHandler = (err, req, res, next) => {
     if (err instanceof CustomAPIError) {
          return res.status(err.statusCode).json({ message: err.message })
     }

     return res.status(500).json({ message: "Something went wrong" })
}
