import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { IStudyPlannerService } from '../services/interfaces';
import { AdaptivePlannerService } from '../services/AdaptivePlannerService';
import { StudyPlan } from '../models/StudyPlan';
import { Types } from 'mongoose';

export class StudyPlanController {
    constructor(
        private studyPlannerService: IStudyPlannerService,
        private adaptivePlannerService: AdaptivePlannerService
    ) {}

    generatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            // Use authenticated userId from JWT; body userId is ignored for security
            const userId = req.userId!;
            const { syllabusText, title, targetDate, hoursPerDay } = req.body;

            if (!syllabusText || !title || !targetDate || !hoursPerDay) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }

            const planId = await this.studyPlannerService.generatePlan(
                userId, syllabusText, title, new Date(targetDate), hoursPerDay
            );

            res.status(201).json({ message: 'Plan generated successfully', planId });
        } catch (error: any) {
            console.error('Error generating plan:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }

    getPlansForUser = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const plans = await StudyPlan.find({ user_id: new Types.ObjectId(req.userId!) })
                .sort({ createdAt: -1 })
                .select('_id title start_date target_date daily_hour_commitment createdAt');
            res.status(200).json({ plans });
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }

    getRoadmap = async (req: Request, res: Response): Promise<void> => {
        try {
            const { planId } = req.params;
            if (!planId) {
                res.status(400).json({ error: 'planId is required' });
                return;
            }

            const data = await this.studyPlannerService.getRoadmap(planId as string);
            // Spread the data directly so frontend gets { planId, topics, tasks }
            res.status(200).json(data);
        } catch (error: any) {
            console.error('Error fetching roadmap:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }

    recalculateSchedule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { planId } = req.params as { planId: string };
            if (!planId) {
                res.status(400).json({ error: 'planId is required' });
                return;
            }

            await this.adaptivePlannerService.recalculateSchedule(planId as string);
            res.status(200).json({ message: 'Schedule recalculated successfully' });
        } catch (error: any) {
            console.error('Error recalculating schedule:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }
}
