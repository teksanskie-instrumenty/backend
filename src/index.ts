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
import {finishedExercisesRouter} from "./routes/about_finished_exercise";
import {User} from "./entities/User";
import {DailyPlanExercise} from "./entities/DailyPlanExercise";
import {FinishedExercise} from "./entities/FinishedExercise";
import {DailyPlan} from "./entities/DailyPlan";
import {WeeklyPlan} from "./entities/WeeklyPlan";

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
        app.use(finishedExercisesRouter);
        app.use(errorHandler());
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            res.status(500).send("Internal error: " + err.message);
        });
        app.listen(API_PORT, () => console.log(`API Server listening on port ${API_PORT}`))
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });

const host = 'iot-proj.swisz.cz';
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

const topics = ['get/task', 'confirm/task'];

client.on('connect', () => {
    console.log('Connected');

    client.subscribe(topics, (err) => {
        if (err) {
            console.error('Error subscribing to topic:', err);
        } else {
            console.log(`Subscribed to topic '${topics}'`);
        }
    });
});

client.on('message', async (topic, payload) => {
    if (topic === 'get/task') {
        const cardId = payload.toString(); // Extract the card ID from the payload

        const userCardRepository = myDataSource.getRepository(User);
        const userCard = await userCardRepository.findOne({where: {card_id: cardId}});

        if (userCard) {
            const userId = userCard.id;

            const weeklyPlanRepository = myDataSource.getRepository(WeeklyPlan);
            const userWeeklyPlan = await weeklyPlanRepository.findOne({
                where: { user: { id: userId } },
                relations: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            });

            if (!userWeeklyPlan) {
                // publish: Weekly plan not found
            }
            const date = new Date();
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayToday =  days[date.getDay()]  as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

            const dailyPlanId = userWeeklyPlan![dayToday].id;
            const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
            const dailyPlan = await dailyPlanRepository.findOne({ where : { id: dailyPlanId }});

            if (!dailyPlan) {
                // publish: Daily plan not found
            }

            const dailyPlanExerciseRepository = myDataSource.getRepository(DailyPlanExercise);
            const finishedExerciseRepository = myDataSource.getRepository(FinishedExercise);
            const dailyPlanExercises = await dailyPlanExerciseRepository
                .createQueryBuilder("dailyPlanExercise")
                .leftJoinAndSelect("dailyPlanExercise.exercise", "exercise")
                .where("dailyPlanExercise.dailyPlanId = :dailyPlanId", { dailyPlanId: dailyPlan?.id })
                .getMany();

            const dailyPlanExercisesWithFinished = await Promise.all(dailyPlanExercises.map(async (dailyPlanExercise) => {
                const finishedExercise = await finishedExerciseRepository.findOne({ where : { id: dailyPlanExercise.id }});
                return {
                    ...dailyPlanExercise,
                    when_finished: finishedExercise ? finishedExercise.when_finished : null,
                    is_finished: !!finishedExercise
                };
            }));

            const message = { dailyPlan, dailyPlanExercises: dailyPlanExercisesWithFinished } ? JSON.stringify({ dailyPlan, dailyPlanExercises: dailyPlanExercisesWithFinished }) : 'No daily plan found';
            client.publish('get/task/resp', message, {qos: 0, retain: false}, (error) => {
                if (error) {
                    console.error('Error publishing message:', error);
                }
            });
        }
        else {
            client.publish('get/task/resp', 'Card not assigned to user', {qos: 0, retain: false}, (error) => {
                if (error) {
                    console.error('Error publishing message:', error);
                }
            });
        }
    }
    console.log('Received Message:', topic, payload.toString());
});

client.on('error', (error) => {
    console.error('MQTT client error:', error);
});
