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

const router = express.Router();

router.get("/daily-plan/:id/exercises", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const dailyPlanId = parseInt(req.params.id);
        const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
        const dailyPlan = await dailyPlanRepository.findOne({ where : { id: dailyPlanId }});

        if (!dailyPlan) {
            return res.status(404).json({ error: 'Daily plan not found' });
        }

        const dailyPlanExerciseRepository = myDataSource.getRepository(DailyPlanExercise);
        const dailyPlanExercises = await dailyPlanExerciseRepository
            .createQueryBuilder("dailyPlanExercise")
            .leftJoinAndSelect("dailyPlanExercise.exercise", "exercise")
            .where("dailyPlanExercise.dailyPlanId = :dailyPlanId", { dailyPlanId: dailyPlan.id })
            .getMany();

        return res.status(200).json(dailyPlanExercises);
    } catch (error) {
        console.error('Error retrieving daily plan exercises:', error);
        return res.status(500).json({error: 'Failed to retrieve daily plan exercises'});
    }
});

export {
    router as dailyPlanRouter
};
