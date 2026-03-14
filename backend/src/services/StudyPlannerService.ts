import { Types } from 'mongoose';
import { IStudyPlannerService, ISyllabusParserService, IAIEngineService } from './interfaces';
import { IBaseRepository } from '../repositories/interfaces/IBaseRepository';
import { IStudyPlan } from '../models/StudyPlan';
import { ITopic } from '../models/Topic';
import { ITask } from '../models/Task';

export class StudyPlannerService implements IStudyPlannerService {
  constructor(
    private syllabusParser: ISyllabusParserService,
    private aiEngine: IAIEngineService,
    private studyPlanRepo: IBaseRepository<IStudyPlan>,
    private topicRepo: IBaseRepository<ITopic>,
    private taskRepo: IBaseRepository<ITask>
  ) {}

  async generatePlan(userId: string, syllabusText: string, title: string, targetDate: Date, hoursPerDay: number): Promise<string> {
    // 1. Parse Syllabus
    const parsedTopics = await this.syllabusParser.parseSyllabusText(syllabusText);
    
    // 2. Generate DAG with AI
    const graphNodes = await this.aiEngine.generateDependencies(parsedTopics);
    
    // 3. Create StudyPlan
    const plan = await this.studyPlanRepo.create({
      user_id: new Types.ObjectId(userId) as any,
      title,
      start_date: new Date(),
      target_date: targetDate,
      daily_hour_commitment: hoursPerDay,
    });

    const planId = (plan._id as Types.ObjectId).toString();
    
    // 4. Create Topics in DB, maintain mapping for dependencies
    const topicIdMap: { [index: number]: string } = {};
    
    for (let i = 0; i < graphNodes.length; i++) {
        const node = graphNodes[i];
        const topic = await this.topicRepo.create({
            plan_id: new Types.ObjectId(planId) as any,
            title: node.title,
            estimated_minutes: node.estimated_minutes,
            dependencies: [], // Will link momentarily
        });
        topicIdMap[i] = (topic._id as Types.ObjectId).toString();
    }

    // Link dependencies
    for (let i = 0; i < graphNodes.length; i++) {
        const node = graphNodes[i];
        if (node.depends_on_indices && node.depends_on_indices.length > 0) {
            const deps = node.depends_on_indices.map((idx: number) => new Types.ObjectId(topicIdMap[idx]));
            await this.topicRepo.update(topicIdMap[i], { dependencies: deps as any });
        }
    }

    // 5. Generate basic Tasks (very simple scheduling logic for now)
    let currentDate = new Date();
    for (let i = 0; i < graphNodes.length; i++) {
        // Schedule each topic a day apart
        currentDate.setDate(currentDate.getDate() + 1);
        
        await this.taskRepo.create({
            topic_id: new Types.ObjectId(topicIdMap[i]) as any,
            scheduled_at: new Date(currentDate),
            status: 'TODO',
            actual_duration_mins: 0
        });
    }

    return planId;
  }

  async getRoadmap(planId: string): Promise<any> {
      // In a real scenario, this coordinates fetching graph from topic repo and tasks
      return { planId, status: "Roadmap generated" };
  }
}
