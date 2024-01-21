import express from "express";
import { myDataSource } from "../app-data-source";
import supertokens, {deleteUser} from 'supertokens-node';
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import Session from "supertokens-node/recipe/session";
import { SessionRequest } from "supertokens-node/framework/express";
import {EmailPassword_Users} from "../entities/EmailPassword_Users";
import { WeeklyPlan } from "../entities/WeeklyPlan";
import {DailyPlan} from "../entities/DailyPlan";

const router = express.Router();

router.get("/api/weekly-plan", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const userId = req.session!.getUserId();

        const weeklyPlanRepository = myDataSource.getRepository(WeeklyPlan);
        const userWeeklyPlan = await weeklyPlanRepository.findOne({
            where: { user: { id: userId } },
            relations: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        });

        if (!userWeeklyPlan) {
            return res.status(404).json({ error: 'Weekly plan not found' });
        }

        return res.status(200).json(userWeeklyPlan);
    } catch (error) {
        console.error('Error retrieving weekly plan:', error);
        return res.status(500).json({error: 'Failed to retrieve weekly plan'});
    }
});

router.post("/api/weekly-plan", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const userId = req.session!.getUserId();
        const weeklyPlanRepository = myDataSource.getRepository(WeeklyPlan);
        const newWeeklyPlan = weeklyPlanRepository.create({ ...req.body, user: { id: userId } });

        const result = await weeklyPlanRepository.save(newWeeklyPlan);

        return res.status(201).json(result);
    } catch (error) {
        console.error('Error creating weekly plan:', error);
        return res.status(500).json({error: 'Failed to create weekly plan'});
    }
});

router.patch("/api/weekly-plan", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const userId = req.session!.getUserId();
        const weeklyPlanRepository = myDataSource.getRepository(WeeklyPlan);
        const userWeeklyPlan = await weeklyPlanRepository.findOne({ where: { user: { id: userId } } });

        if (!userWeeklyPlan) {
            return res.status(404).json({ error: 'Weekly plan not found' });
        }

        // Merge request body to the existing weekly plan
        const updatedWeeklyPlan = weeklyPlanRepository.merge(userWeeklyPlan, req.body);

        // Save the updated weekly plan
        const result = await weeklyPlanRepository.save(updatedWeeklyPlan);

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updating weekly plan:', error);
        return res.status(500).json({error: 'Failed to update weekly plan'});
    }
});

export {
    router as weeklyPlanRouter
};
