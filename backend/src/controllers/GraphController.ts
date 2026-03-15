import { Request, Response } from 'express';
import { ITopicRepository } from '../repositories/interfaces/ITopicRepository';

export class GraphController {
    constructor(private topicRepo: ITopicRepository) {}

    getGraph = async (req: Request, res: Response): Promise<void> => {
        try {
            const { planId } = req.params;
            if (!planId) {
                res.status(400).json({ error: 'planId is required' });
                return;
            }

            const graphData = await this.topicRepo.getTopicGraphForPlan(planId as string);
            res.status(200).json({ graphData });
        } catch (error: any) {
            console.error('Error fetching graph:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }
}
