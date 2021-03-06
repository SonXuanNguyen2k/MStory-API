import express, { Response, Request, NextFunction, Application } from 'express'
import cors, { CorsOptions } from 'cors'
import cookieParser from 'cookie-parser'
import { createConnection } from 'typeorm';

import routes from '../routes'
import createHttpError from 'http-errors';

export { default as errHandler } from './errHandler';

export const connectDB = async () => {
    return await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [
            __dirname + "/../entity/*.js"
        ],
        migrations: [
            __dirname + "/../migration/*.js"
        ],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.DB_LOGGING === 'true',
        ssl: {
            rejectUnauthorized: false
        },
        cli: {
            entitiesDir: __dirname + "/../entity",
            migrationsDir: __dirname + "/../migration"
        }
    })
}

export const setup = (app: Application) => {
    const whitelist = (process.env.WHITELISTED_DOMAINS as string).split(', ')
    const CORS_OPTIONS: CorsOptions = {
        credentials: true,
        origin: (origin = '', cb) =>
            (whitelist.includes(origin) || !origin) ? // REST tools such as Postman does not have origin
                cb(null, true) :
                cb(new createHttpError.Unauthorized('Not allowed by CORS'))
    }
    app.use(cors(CORS_OPTIONS))
    app.use(cookieParser())
    app.use(express.json());
    app.use((req: Request, res: Response, next: NextFunction) => { // make "/path" and "/path/" to be the same
        const test = /\?[^]*\//.test(req.url);
        if (req.url.substr(-1) === "/" && req.url.length > 1 && !test)
            res.redirect(301, req.url.slice(0, -1));
        else next();
    });
    app.disable('x-powered-by'); // NOT reveal the technology of server (Express.js) to hackers
}

export const initRoutes = (app: Application) => {
    app.use("/", routes);
    app.all("*", (req: Request, _res: Response, next: NextFunction) => {
        next(new createHttpError.NotFound(`There's nothing at ${req.originalUrl}`))
    })
}

export const start = (app: Application) => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`API server is running on port: ${port}`));
}
