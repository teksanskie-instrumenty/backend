import express from "express";
import { myDataSource } from "../app-data-source";
import supertokens, {deleteUser} from 'supertokens-node';
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import Session from "supertokens-node/recipe/session";
import { SessionRequest } from "supertokens-node/framework/express";
import {FinishedExercise} from "../entities/FinishedExercise";
import {DailyPlanExercise} from "../entities/DailyPlanExercise";
import {Exercise} from "../entities/Exercise";

const router = express.Router();

router.get("/api/finished-exercises", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const userId = req.session!.getUserId();

        const finishedExerciseRepository = myDataSource.getRepository(FinishedExercise);
        const finishedExercises = await finishedExerciseRepository.find({ where : { user_id: userId }});

        return res.status(200).json(finishedExercises);
    } catch (error) {
        console.error('Error getting finished exercises:', error);
        return res.status(500).json({error: 'Failed to get finished exercises'});
    }
});

router.post("/api/finished-exercise", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const userId = req.session!.getUserId();
        const { exercise_id, when_finished } = req.body;

        const exerciseRepository = myDataSource.getRepository(Exercise);
        const exercise = await exerciseRepository.findOne({ where : { id: exercise_id }});

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        const finishedExerciseRepository = myDataSource.getRepository(FinishedExercise);
        const newFinishedExercise = new FinishedExercise();
        newFinishedExercise.user_id = userId;
        newFinishedExercise.exercise = exercise;
        newFinishedExercise.when_finished = new Date(when_finished);
        const savedFinishedExercise = await finishedExerciseRepository.save(newFinishedExercise);

        return res.status(201).json(savedFinishedExercise);
    } catch (error) {
        console.error('Error adding finished exercise:', error);
        return res.status(500).json({error: 'Failed to add finished exercise'});
    }
});

export {
    router as finishedExercisesRouter
};
