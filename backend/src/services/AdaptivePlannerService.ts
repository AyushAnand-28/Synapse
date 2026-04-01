import { IBaseRepository } from '../repositories/interfaces/IBaseRepository';
import { ITask } from '../models/Task';
import { Types } from 'mongoose';

export class AdaptivePlannerService {
    constructor(private taskRepo: IBaseRepository<ITask>) {}

    /**
     * Finds all overdue TODO/IN_PROGRESS tasks for a plan's topics and
     * redistributes them sequentially starting from tomorrow, 1 day apart.
     */
    async recalculateSchedule(planId: string): Promise<void> {
        console.log(`[AdaptivePlanner] Recalculating for plan ${planId}`);

        // Fetch all tasks whose topic_id belongs to this plan
        // We filter on scheduled_at < now and status not COMPLETED
        const now = new Date();
        const overdueTasks = await this.taskRepo.findAll({
            scheduled_at: { $lt: now },
            status: { $in: ['TODO', 'IN_PROGRESS', 'MISSED'] },
        });

        if (overdueTasks.length === 0) {
            console.log('[AdaptivePlanner] No overdue tasks found.');
            return;
        }

        // Redistribute: start from tomorrow, push one day per task
        let cursor = new Date(now);
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(9, 0, 0, 0); // reset to 09:00 next day

        for (const task of overdueTasks) {
            await this.taskRepo.update((task._id as Types.ObjectId).toString(), {
                scheduled_at: new Date(cursor),
                status: 'TODO',
            } as any);
            cursor.setDate(cursor.getDate() + 1);
        }

        console.log(`[AdaptivePlanner] Redistributed ${overdueTasks.length} tasks.`);
    }
}
