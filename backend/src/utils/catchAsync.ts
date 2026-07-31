import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

const catchAsync= (fn:RequestHandler):RequestHandler => {
  // Closure function
  return (req: Request, res: Response, next: NextFunction) => {
    // if error comes it automatically transfer to global error Handler
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
export default catchAsync;
