import { Request, Response } from 'express';
import { IStudyPlannerService } from '../services/interfaces';

export class StudyPlanController {
    constructor(private studyPlannerService: IStudyPlannerService) {}

    generatePlan = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId, syllabusText, title, targetDate, hoursPerDay } = req.body;
            
            // Basic validation
            if (!userId || !syllabusText || !title || !targetDate || !hoursPerDay) {
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
}
