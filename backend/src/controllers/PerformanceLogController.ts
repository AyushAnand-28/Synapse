import { Request, Response } from 'express';
import { IBaseRepository } from '../repositories/interfaces/IBaseRepository';
import { IPerformanceLog, PerformanceLog } from '../models/PerformanceLog';
import { Topic } from '../models/Topic';
import { Types } from 'mongoose';

export class PerformanceLogController {
    constructor(private performanceLogRepo: IBaseRepository<IPerformanceLog>) {}

    logPerformance = async (req: Request, res: Response): Promise<void> => {
        try {
            const { topic_id, quiz_score, retention_rate } = req.body;

            if (!topic_id || quiz_score === undefined) {
                res.status(400).json({ error: 'topic_id and quiz_score are required' });
                return;
            }

            const performanceLog = await this.performanceLogRepo.create({
                topic_id,
                quiz_score,
                retention_rate: retention_rate || 0,
                entry_date: new Date()
            } as any);

            res.status(201).json({ message: 'Performance logged successfully', logId: performanceLog._id });
        } catch (error: any) {
            console.error('Error logging performance:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }

    getSummary = async (req: Request, res: Response): Promise<void> => {
        try {
            const planId = req.params['planId'] as string;

            // Get all topics for this plan
            const topics = await Topic.find({ plan_id: new Types.ObjectId(planId) }).select('_id title mastery_score estimated_minutes');

            if (topics.length === 0) {
                res.status(200).json({ summary: { avg_mastery: 0, avg_quiz_score: 0, avg_retention: 0, subjects: [] } });
                return;
            }

            const topicIds = topics.map(t => t._id as Types.ObjectId);

            // Aggregate performance logs
            const agg = await PerformanceLog.aggregate([
                { $match: { topic_id: { $in: topicIds } } },
                { $group: {
                    _id: '$topic_id',
                    avg_quiz:      { $avg: '$quiz_score' },
                    avg_retention: { $avg: '$retention_rate' },
                    count:         { $sum: 1 },
                }}
            ]);

            const aggMap = new Map(agg.map(a => [a._id.toString(), a]));

            const subjects = topics.map(t => {
                const perf = aggMap.get(t._id.toString());
                return {
                    id:                t._id.toString(),
                    title:             t.title,
                    mastery_score:     t.mastery_score,
                    estimated_minutes: t.estimated_minutes,
                    avg_quiz_score:    perf ? Math.round(perf.avg_quiz) : null,
                    avg_retention:     perf ? Number(perf.avg_retention.toFixed(2)) : null,
                    log_count:         perf?.count ?? 0,
                };
            });

            const withLogs = subjects.filter(s => s.avg_quiz_score !== null);
            const avg_mastery   = topics.reduce((s, t) => s + t.mastery_score, 0) / topics.length;
            const avg_quiz      = withLogs.length ? withLogs.reduce((s, t) => s + (t.avg_quiz_score ?? 0), 0) / withLogs.length : 0;
            const avg_retention = withLogs.length ? withLogs.reduce((s, t) => s + (t.avg_retention ?? 0), 0) / withLogs.length : 0;

            res.status(200).json({
                summary: {
                    plan_id:       planId,
                    topic_count:   topics.length,
                    avg_mastery:   Math.round(avg_mastery),
                    avg_quiz_score: Math.round(avg_quiz),
                    avg_retention:  Number(avg_retention.toFixed(2)),
                    subjects,
                }
            });
        } catch (error: any) {
            console.error('Error fetching performance summary:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }
}

