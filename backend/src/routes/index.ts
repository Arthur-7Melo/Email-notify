import { Router } from "express";
import { getEmailById, receiveEmail } from "../controllers/emailController";

const router = Router()

router.post('/email', receiveEmail);
router.get('/emails/:id', getEmailById);
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Email service is running' });
});

export default router;