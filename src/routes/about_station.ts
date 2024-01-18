import express from "express";
import { myDataSource } from "../app-data-source";
import supertokens, {deleteUser} from 'supertokens-node';
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import Session from "supertokens-node/recipe/session";
import { SessionRequest } from "supertokens-node/framework/express";
import {EmailPassword_Users} from "../entities/EmailPassword_Users";
import { DailyPlanExercise } from "../entities/DailyPlanExercise";
import {DailyPlan} from "../entities/DailyPlan";
import {Station} from "../entities/Station";

const router = express.Router();

router.get("/stations", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const stationRepository = myDataSource.getRepository(Station);
        const stations = await stationRepository.find();

        return res.status(200).json(stations);
    } catch (error) {
        console.error('Error retrieving stations:', error);
        return res.status(500).json({error: 'Failed to retrieve stations'});
    }
});

router.post("/station", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const { name, color } = req.body;
        const stationRepository = myDataSource.getRepository(Station);
        const newStation = new Station();

        newStation.name = name;
        newStation.color = color;

        const savedStation = await stationRepository.save(newStation);

        return res.status(201).json(savedStation);
    } catch (error) {
        console.error('Error creating station:', error);
        return res.status(500).json({error: 'Failed to create station'});
    }
});

export {
    router as stationRouter
};
