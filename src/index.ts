import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import express from 'express';
import {verifySession} from "supertokens-node/recipe/session/framework/express";
import {errorHandler, middleware} from 'supertokens-node/framework/express';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Dashboard from "supertokens-node/recipe/dashboard";
import {Request, Response, NextFunction} from 'express';
import dotenv from 'dotenv';
import process from 'process';
import {myDataSource} from "./app-data-source";
import {weeklyPlanRouter} from "./routes/about_weekly_plan";
import {userPlanRouter} from "./routes/about_user";
import {dailyPlanRouter} from "./routes/about_daily_plan";
import {exerciseRouter} from "./routes/about_exercise";
import {stationRouter} from "./routes/about_station";
import {dailyPlanExerciseRouter} from "./routes/about_daily_plan_exercise";
import mqtt from 'mqtt';

dotenv.config({path: '.env'});

const PC_IP = process.env.PC_IP;
const API_PORT = process.env.API_PORT;
const APP_PORT = process.env.APP_PORT;
const API_KEY = process.env.API_KEY || '';

const apiDomain = `http://${PC_IP}:${API_PORT}`;

supertokens.init({
    framework: 'express',
    supertokens: {
        connectionURI: `http://${PC_IP}:3567`,
        apiKey: API_KEY,
    },
    appInfo: {
        appName: 'IntelliGYM',
        apiDomain,
        websiteDomain: `http://${PC_IP}:${APP_PORT}`,
        apiBasePath: "/auth",
        websiteBasePath: "/auth",
    },
    recipeList: [
        EmailPassword.init({
            signUpFeature: {
                formFields: [
                    {
                        id: "nick"
                    },
                    {
                        id: "email"
                    },
                    {
                        id: "password"
                    }]
            },
            override: {
                apis: (originalImplementation) => {
                    return {
                        ...originalImplementation,
                        signUpPOST: async function (input) {

                            if (originalImplementation.signUpPOST === undefined) {
                                throw Error("Should never come here");
                            }

                            let response = await originalImplementation.signUpPOST(input);

                            if (response.status === "OK") {

                                let formFields = input.formFields;

                                let userId = response.user.id;
                                let nickValue = formFields.find(field => field.id === 'nick')?.value;
                                if (userId && nickValue) {
                                    await myDataSource.query('INSERT INTO "user"(id, nick) VALUES($1, $2)', [userId, nickValue]);
                                }
                            }
                            return response;
                        }
                    }
                }
            }
        }), // initializes signin, sign up features
        Session.init(), // initializes session features
        Dashboard.init()
    ],
});

const app = express();

myDataSource
    .initialize()
    .then(() => {
        app.use(express.urlencoded({
            extended: true
        }));
        app.use(express.json());
        app.use(
            cors({
                origin: `http://${PC_IP}:${APP_PORT}`,
                allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
                methods: ["GET", "PUT", "POST", "DELETE"],
                credentials: true,
            }),
        );
        app.use(morgan("dev"));
        app.use(
            helmet({
                contentSecurityPolicy: false,
            })
        );
        app.use(middleware());
        app.use(dailyPlanRouter);
        app.use(userPlanRouter);
        app.use(weeklyPlanRouter);
        app.use(exerciseRouter);
        app.use(stationRouter);
        app.use(dailyPlanExerciseRouter);
        app.use(errorHandler());
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            res.status(500).send("Internal error: " + err.message);
        });
        app.listen(API_PORT, () => console.log(`API Server listening on port ${API_PORT}`))
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });

const host = 'localhost';
const port = '1883';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const connectUrl = `mqtt://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: 'iot',
    password: 'G516cD8#rSb£',
    reconnectPeriod: 1000,
});

const topic = '/nodejs/mqtt';

client.on('connect', () => {
    console.log('Connected');

    client.subscribe([topic], (err) => {
        if (err) {
            console.error('Error subscribing to topic:', err);
        } else {
            console.log(`Subscribed to topic '${topic}'`);
        }
    });

    client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error('Error publishing message:', error);
        }
    });
});

client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload.toString());
});

client.on('error', (error) => {
    console.error('MQTT client error:', error);
});

setInterval(() => {
    client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error('Error publishing message:', error);
        }
    });
}, 5000);
