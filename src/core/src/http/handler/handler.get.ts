import {
  RouteResponse,
  HttpResponse,
  HttpRequest,
  ContentType,
} from "../../http.interface";
import { RouteHandler } from "../router/router.interface";
import { createRouteHandlerFn } from "./handler.util";

export const get = (path: string) => (
  handler: (req: HttpRequest, res: HttpResponse) => unknown,
  contentType?: ContentType,
  status?: number
) => (
  errorHandler: (req: HttpRequest, res: HttpResponse, error: Error) => unknown,
  errorContentType?: ContentType,
  errorStatus?: number
): RouteHandler => ({
  path: path,
  method: "GET",
  handler: createRouteHandlerFn(
    async (req: HttpRequest, res: HttpResponse): Promise<RouteResponse> => ({
      status: 200,
      response: await handler(req, res),
      contentType: contentType,
    })
  ),
  errorHandler: createRouteHandlerFn(
    async (
      req: HttpRequest,
      res: HttpResponse,
      error: Error
    ): Promise<RouteResponse> => ({
      status: errorStatus || 500,
      response: await errorHandler(req, res, error),
      contentType: errorContentType,
    })
  ),
});
