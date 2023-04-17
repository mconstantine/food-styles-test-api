import { Response } from "express";
import { SafeParseReturnType } from "zod";
import { ServerError } from "../ServerError";

/**
 * It sends the appropriate response back to the network. It handles input validation errors responding
 * 422, any known error (i.e.: thrown `ServerError`s) with their specific code and any other error with
 * the generic 500 code.
 *
 * ### Example
 *
 * ```
 * declare function handleResponse(input: Input): Promise<Output>
 *
 * app.use('/path', (req, res) => {
 *   const validation = myZodValidator.parseSafe(req.body); // or query, or params, or whatever
 *   return makeEndpoint(validation, res, handleResponse);
 * })
 * ```
 *
 * @param parseResult the result of parsing the input (whether it comes from params, query, body) with Zod
 * @param res the response of the network call
 * @param handler a function that takes the validated input and returns the response body. Throw a `ServerError` for known errors and just do nothing in case of unknown errors
 * @returns a Promise containing nothing
 */
export async function makeEndpoint<T, R>(
  parseResult: SafeParseReturnType<unknown, T>,
  res: Response,
  handler: (validData: T) => Promise<R>
): Promise<void> {
  if (parseResult.success) {
    try {
      const result = await handler(parseResult.data);
      res.json(result);
      return;
    } catch (e) {
      console.log(e);

      if (e instanceof ServerError) {
        res.status(e.code).end();
        return;
      } else {
        res.status(500).end();
        return;
      }
    }
  } else {
    res.status(422).json(parseResult.error);
    return;
  }
}
