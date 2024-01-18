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

router.get("/daily-plan/exercise/:id", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const dailyPlanExerciseId = parseInt(req.params.id);
        const dailyPlanExerciseRepository = myDataSource.getRepository(DailyPlanExercise);
        const dailyPlanExercise = await dailyPlanExerciseRepository.findOne({ where : { id: dailyPlanExerciseId }});

        if (!dailyPlanExercise) {
            return res.status(404).json({ error: 'Daily plan exercise not found' });
        }

        return res.status(200).json(dailyPlanExercise);
    } catch (error) {
        console.error('Error retrieving daily plan exercise:', error);
        return res.status(500).json({error: 'Failed to retrieve daily plan exercise'});
    }
});

router.post("/daily-plan/exercise", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const { exercise_id, order, repetitions, sets, interval } = req.body;

        const exerciseRepository = myDataSource.getRepository(Exercise);
        const exercise = await exerciseRepository.findOne({ where : { id: exercise_id }});

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        const dailyPlanExerciseRepository = myDataSource.getRepository(DailyPlanExercise);
        const newDailyPlanExercise = new DailyPlanExercise();

        newDailyPlanExercise.exercise = exercise;
        newDailyPlanExercise.order = order;
        newDailyPlanExercise.repetitions = repetitions;
        newDailyPlanExercise.sets = sets;
        newDailyPlanExercise.interval = interval;

        const savedDailyPlanExercise = await dailyPlanExerciseRepository.save(newDailyPlanExercise);

        return res.status(201).json(savedDailyPlanExercise);
    } catch (error) {
        console.error('Error creating daily plan exercise:', error);
        return res.status(500).json({error: 'Failed to create daily plan exercise'});
    }
});

router.patch("/daily-plan/exercise/:id", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const dailyPlanExerciseId = parseInt(req.params.id);
        const { dailyPlanId } = req.body;

        const dailyPlanExerciseRepository = myDataSource.getRepository(DailyPlanExercise);
        const dailyPlanExercise = await dailyPlanExerciseRepository.findOne({ where : { id: dailyPlanExerciseId }});

        if (!dailyPlanExercise) {
            return res.status(404).json({ error: 'Daily plan exercise not found' });
        }

        const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
        const dailyPlan = await dailyPlanRepository.findOne({ where : { id: dailyPlanId }});

        if (!dailyPlan) {
            return res.status(404).json({ error: 'Daily plan not found' });
        }

        dailyPlanExercise.dailyPlan = dailyPlan;

        const updatedDailyPlanExercise = await dailyPlanExerciseRepository.save(dailyPlanExercise);

        return res.status(200).json(updatedDailyPlanExercise);
    } catch (error) {
        console.error('Error updating daily plan exercise:', error);
        return res.status(500).json({error: 'Failed to update daily plan exercise'});
    }
});

export {
    router as dailyPlanExerciseRouter
};
