import express from "express";
import { myDataSource } from "../app-data-source";
import supertokens, {deleteUser} from 'supertokens-node';
import EmailPassword from "supertokens-node/recipe/emailpassword";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import Session from "supertokens-node/recipe/session";
import { SessionRequest } from "supertokens-node/framework/express";
import {EmailPassword_Users} from "../entities/EmailPassword_Users";
import {User} from "../entities/User";

const router = express.Router();

router.get("/user-info", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const userId = req.session!.getUserId();
        const userRepository = myDataSource.getRepository(User);
        const userInfo = await userRepository.findOne({ where: { id: userId } });

        if (!userInfo) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(userInfo);
    } catch (error) {
        console.error('Error retrieving user information:', error);
        return res.status(500).json({error: 'Failed to retrieve user information'});
    }
});

router.patch("/user-info", verifySession(), async(req: SessionRequest, res: express.Response) => {
    try {
        const userId = req.session!.getUserId();
        const userRepository = myDataSource.getRepository(User);
        const userInfo = await userRepository.findOne({ where: { id: userId } });

        if (!userInfo) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUserInfo = userRepository.merge(userInfo, req.body);
        const result = await userRepository.save(updatedUserInfo);

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updating user information:', error);
        return res.status(500).json({error: 'Failed to update user information'});
    }
});

router.post("/signout", verifySession(), async (req: SessionRequest, res: express.Response) => {
    await req.session!.revokeSession();

    return res.status(200).json({ message: 'Logged out successfully' });
});

export {
    router as userPlanRouter
};
