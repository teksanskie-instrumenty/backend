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

router.get("/api/daily-plan/exercise/:id", verifySession(), async(req: SessionRequest, res: express.Response) => {
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

router.post("/api/daily-plan/exercise", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const { order, repetitions, sets, interval, daily_plan_id } = req.body;

        const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
        const dailyPlan = await dailyPlanRepository.findOne({ where : { id: daily_plan_id }});

        if (!dailyPlan) {
            return res.status(404).json({ error: 'Daily plan not found' });
        }

        const dailyPlanExerciseRepository = myDataSource.getRepository(DailyPlanExercise);
        const newDailyPlanExercise = new DailyPlanExercise();
        newDailyPlanExercise.order = order;
        newDailyPlanExercise.repetitions = repetitions;
        newDailyPlanExercise.sets = sets;
        newDailyPlanExercise.interval = interval;
        newDailyPlanExercise.dailyPlan = dailyPlan;

        const savedDailyPlanExercise = await dailyPlanExerciseRepository.save(newDailyPlanExercise);

        return res.status(201).json(savedDailyPlanExercise);
    } catch (error) {
        console.error('Error creating daily plan exercise:', error);
        return res.status(500).json({error: 'Failed to create daily plan exercise'});
    }
});

router.patch("/api/daily-plan/exercise/:id", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const dailyPlanExerciseId = parseInt(req.params.id);
        const { daily_plan_id } = req.body;

        const dailyPlanExerciseRepository = myDataSource.getRepository(DailyPlanExercise);
        const dailyPlanExercise = await dailyPlanExerciseRepository.findOne({ where : { id: dailyPlanExerciseId }});

        if (!dailyPlanExercise) {
            return res.status(404).json({ error: 'Daily plan exercise not found' });
        }

        const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
        const dailyPlan = await dailyPlanRepository.findOne({ where : { id: daily_plan_id }});

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
