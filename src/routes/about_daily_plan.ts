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

router.get("/api/daily-plan/:id", verifySession(), async(req: SessionRequest, res: express.Response) => {
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

        return res.status(200).json({ dailyPlan, dailyPlanExercises });
    } catch (error) {
        console.error('Error retrieving daily plan and its exercises:', error);
        return res.status(500).json({error: 'Failed to retrieve daily plan and its exercises'});
    }
});

router.post("/api/daily-plan", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const { name, desc, img } = req.body;

        const dailyPlanRepository = myDataSource.getRepository(DailyPlan);
        const newDailyPlan = new DailyPlan();
        newDailyPlan.name = name;
        newDailyPlan.description = desc;
        newDailyPlan.image = img;
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
