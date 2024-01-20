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
import {Exercise} from "../entities/Exercise";

const router = express.Router();

router.get("/api/exercises", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const exerciseRepository = myDataSource.getRepository(Exercise);
        const exercises = await exerciseRepository.find();

        return res.status(200).json(exercises);
    } catch (error) {
        console.error('Error retrieving exercises:', error);
        return res.status(500).json({error: 'Failed to retrieve exercises'});
    }
});

router.post("/api/exercise", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const { station_id, name, pace } = req.body;
        const exerciseRepository = myDataSource.getRepository(Exercise);
        const newExercise = new Exercise();

        newExercise.station_id = station_id;
        newExercise.name = name;
        newExercise.pace = pace;

        const savedExercise = await exerciseRepository.save(newExercise);

        return res.status(201).json(savedExercise);
    } catch (error) {
        console.error('Error creating exercise:', error);
        return res.status(500).json({error: 'Failed to create exercise'});
    }
});

export {
    router as exerciseRouter
};
