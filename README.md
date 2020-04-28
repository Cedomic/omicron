# Omicron - Simple HTTP servers

[![coverage report](https://gitlab.com/Cedomic/omicron/badges/master/coverage.svg)](https://gitlab.com/Cedomic/omicron/-/commits/master) [![pipeline status](https://gitlab.com/Cedomic/omicron/badges/master/pipeline.svg)](https://gitlab.com/Cedomic/omicron/-/commits/master)

Omicron is a small library to build HTTP servers in Node.js.

Omicron uses a more functional approach compared to other solutions, e.g. the functions to create route handlers are curried by default which can be useful for function composition.

Omicron is written in TypeScript and has pretty good typing, which should help you to be more productive.

Please see `/example/example.ts` for an example setup.

## Usage

    npm i --save @zaetrik/omicron

For some features, like middlewares, you also need the [fp-ts](https://github.com/gcanti/fp-ts) library.

    npm i --save fp-ts

## Documentation

Start a server that handles a `GET` request to `/` =>

    import * as omicron from "@zaetrik/omicron";

    const indexHandler = r
        ("/")
        ("GET")
        ((req) => "Hello 👋")
        ((res, error) => `Oops! An error occured => ${error.message}`);

    const listener = omicron.httpListener({
        // Here you can add all your routes that should be exposed
        routes: [
            indexHandler
        ],
    });

    const PORT = 3000; // Otherwise the default PORT is 7777

    // Create our server instance
    const server = omicron.createServer({ port: PORT, listener: listener });

    // await our server setup with await server
    const main: IO<void> = async () => await (await server)();

    // Call main() to start the server
    main();

    console.log(`Listening on https://localhost:${PORT || 7777}`)

### Route Handlers 🛤️

Route handlers can be created like this =>

    import * as omicron from "@zaetrik/omicron";

    const handler = omicron.r
        ("/") // Your path
        ("*") // HTTP method // * => Catch-all handler
        ((req) => "My Handler") // Handler function
        ((req, err) => err.message) // Error handler function

    const getHandler = omicron.get
        ("/get")
        ((req) => "My GET Handler")
        ((req, err) => err.message)

    const postHandler = omicron.post
        ("/post")
        ((req) => "My POST Handler")
        ((req, err) => err.message)

    // To return a response with custom options you have to return something of type RouteResponse
    interface RouteResponse {
        response: any;
        status: number;
        headers: RouteResponseHeaders;
    }
    // If you would like to just return the default headers set headers to {}

    const handlerWithCustomOptions = omicron.r
        ("/custom")
        ("GET")
        ((req) =>
            ({
                response: "My Handler Response", // Data that should be returned as a response
                status: 200, // Custom status code
                headers: { "Set-Cookie": ["cookie=true"] } // Pass in all your custom headers
            })
        ((req, err) => err.message)

For the other HTTP methods there are also handlers available.

In order for your route to work you have to define two handlers. One normal handler & one error handler. This forces you to handle the possible error scenario on every route.

### Middleware 🖖

This will probably change in the future, but currently you can implement middleware like this =>

    import * as omicron from "@zaetrik/omicron";
    import * as E from "fp-ts/lib/Either";
    import { flow } from "fp-ts/lib/function";

    // This is how you can create middleware
    const authenticated: omicron.Middleware = (req: omicron.HttpRequest) =>
        req.query.number > 10 ? E.right(req) : E.left(new Error("Number is not > 10"));

    const isBob: omicron.Middleware = (req: omicron.HttpRequest) =>
        req.query.name === "Bob" ? E.right(req) : E.left(new Error("User is not Bob"));

    const handlerWithMiddleware = omicron.r
        ("/middleware")
        ("GET")
        (omicron.useMiddleware
                (authenticated)
                ((req) => "User is authenticated"))
        ((req, err) => err.message);


    const handlerWithMultipleMiddlewares = omicron.r
        ("/multiple-middlewares")
        ("GET")
        (omicron.useMiddleware
            // You can use multiple middlewares by composing them
            (flow(authenticated, E.chain(isBob)))
            ((req) => "User is authenticated and his name is Bob"))
        ((req, err) => err.message);

As you can see we use the `useMiddleware(middleware)(handler)(errorHandler?)` function instead of a basic handler function we use normally. Any middleware function has to return something of type `Either<Error, HttpRequest | unknown>` (Either is a type from [fp-ts](https://github.com/gcanti/fp-ts)).

The default behaviour of the middleware is to throw the error in the handler and then you should handle it in your error handler like you always do.
Another option is to pass an additional error handler to useMiddleware()()(errorHandler) which will handle any error from the middleware.

The value returned from the middleware is used as the first parameter of your handler function, which is normally the `req: HttpRequest` object, but it could be whatever you like.
