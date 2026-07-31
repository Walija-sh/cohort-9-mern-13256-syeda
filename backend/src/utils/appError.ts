// custom error class for handling operational errors
class AppError extends Error {
  public statusCode: number;
  public status: string;
    public isOperational: boolean;
  constructor(message:string, statusCode:number) {
    // as error class takes message
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "fail" : "error";
    // this is for operational error
    this.isOperational = true;
    // this is for not showing error to client
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
