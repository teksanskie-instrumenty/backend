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
import {FinishedExercise} from "../entities/FinishedExercise";

const router = express.Router();

router.get("/api/daily-plan", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
        const dailyPlans = await dailyPlanRepository.find({ order: { id: 'ASC' } });

        return res.status(200).json(dailyPlans);
    } catch (error) {
        console.error('Error retrieving daily plans:', error);
        return res.status(500).json({error: 'Failed to retrieve daily plans'});
    }
});

router.get("/api/daily-plan/:id", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        // const date = new Date();
        const daily_plan_id = parseInt(req.params.id);
        const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
        const dailyPlan = await dailyPlanRepository.findOne({ where : { id: daily_plan_id }});

        if (!dailyPlan) {
            return res.status(404).json({ error: 'Daily plan not found' });
        }

        const dailyPlanExerciseRepository = myDataSource.getRepository(DailyPlanExercise);
        const finishedExerciseRepository = myDataSource.getRepository(FinishedExercise);
        const dailyPlanExercises = await dailyPlanExerciseRepository
            .createQueryBuilder("daily_plan_exercise")
            .leftJoinAndSelect("daily_plan_exercise.exercise", "exercise")
            .leftJoinAndSelect("exercise.station", "station")
            .where("daily_plan_exercise.daily_plan_id = :daily_plan_id", { daily_plan_id: dailyPlan?.id })
            .orderBy("daily_plan_exercise.id", "ASC")
            .getMany();

        const dailyPlanExercisesWithFinished = await Promise.all(dailyPlanExercises.map(async (dailyPlanExercise) => {
            const finishedExercise = await finishedExerciseRepository.findOne({ where : { exercise: { id: dailyPlanExercise.exercise.id } }});

            let is_finished;
            let when_finished_formatted;
            if (finishedExercise && Array.isArray(finishedExercise.when_finished)) {
                is_finished = finishedExercise.when_finished.map(date => String(date) !== "null");
                // Format dates to ISO format
                when_finished_formatted = finishedExercise.when_finished.map(date => {
                    return (date && String(date) !== "null") ? new Date(date).toISOString() : null;
                });
            } else {
                is_finished = Array(7).fill(false);
                when_finished_formatted = Array(7).fill(null);
            }

            return {
                ...dailyPlanExercise,
                exercise: {
                    ...dailyPlanExercise.exercise,
                    station: {
                        id: dailyPlanExercise.exercise.station.id,
                        name: dailyPlanExercise.exercise.station.name,
                        color: dailyPlanExercise.exercise.station.color,
                    },
                },
                when_finished: when_finished_formatted,
                is_finished: is_finished
            };
        }));

        return res.status(200).json({ dailyPlan, dailyPlanExercises: dailyPlanExercisesWithFinished });
    } catch (error) {
        console.error('Error retrieving daily plan and its exercises:', error);
        return res.status(500).json({error: 'Failed to retrieve daily plan and its exercises'});
    }
});

router.post("/api/daily-plan", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const { name, description, image } = req.body;

        const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
        const newDailyPlan = new DailyPlan();
        newDailyPlan.name = name;
        newDailyPlan.description = description;
        newDailyPlan.image = image;
        const savedDailyPlan = await dailyPlanRepository.save(newDailyPlan);

        return res.status(201).json(savedDailyPlan);
    } catch (error) {
        console.error('Error creating daily plan:', error);
        return res.status(500).json({error: 'Failed to create daily plan'});
    }
});

export {
    router as dailyPlanRouter
};
