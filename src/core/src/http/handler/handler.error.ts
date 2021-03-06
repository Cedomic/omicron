import { ContentType, HttpRequest } from "../../http.interface";
import { RouteHandlerFn, RouteResponse } from "../router/router.interface";
import { createRouteHandlerFn } from "./handler.util";
import { flow } from "fp-ts/lib/function";

export const errorHandler = (err: string): RouteHandlerFn =>
  flow(
    () => createRouteHandlerFn(defaultErrorHandlerRouteResponse(err)),
    () => createRouteHandlerFn(defaultErrorHandlerRouteResponse(err))
  )();

export const defaultErrorHandlerRouteResponse = (err: string) => (req: HttpRequest): RouteResponse => ({
  status: 500,
  response: `<h1>${err}</h1>`,
  headers: { "Content-Type": ContentType.TEXT_HTML },
});
