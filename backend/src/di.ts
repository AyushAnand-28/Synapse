import { StudyPlan } from './models/StudyPlan';
import { Topic, ITopic } from './models/Topic';
import { Task } from './models/Task';
import { BaseRepository } from './repositories/BaseRepository';
import { TopicRepository } from './repositories/TopicRepository';
import { SyllabusParserService } from './services/SyllabusParserService';
import { AIEngineService } from './services/AIEngineService';
import { StudyPlannerService } from './services/StudyPlannerService';
import { StudyPlanController } from './controllers/StudyPlanController';
import { GraphController } from './controllers/GraphController';
import { PerformanceLogController } from './controllers/PerformanceLogController';
import { ITopicRepository } from './repositories/interfaces/ITopicRepository';
import { AdaptivePlannerService } from './services/AdaptivePlannerService';
import { PerformanceLog } from './models/PerformanceLog';

// 1. Instantiate Repositories
const studyPlanRepo = new BaseRepository(StudyPlan);
const topicRepo: ITopicRepository = new TopicRepository(Topic);
const taskRepo = new BaseRepository(Task);
const performanceLogRepo = new BaseRepository(PerformanceLog);

// 2. Instantiate Services
const syllabusParserService = new SyllabusParserService();
const aiEngineService = new AIEngineService();

const studyPlannerService = new StudyPlannerService(
    syllabusParserService,
    aiEngineService,
    studyPlanRepo,
    topicRepo,
    taskRepo
);

const adaptivePlannerService = new AdaptivePlannerService(taskRepo);

// 3. Instantiate Controllers
export const studyPlanController = new StudyPlanController(studyPlannerService, adaptivePlannerService);
export const graphController = new GraphController(topicRepo);
export const performanceLogController = new PerformanceLogController(performanceLogRepo);
