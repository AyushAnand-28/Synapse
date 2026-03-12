import { Model, Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { ITopic } from '../models/Topic';
import { GraphNode, ITopicRepository } from './interfaces/ITopicRepository';

export class TopicRepository extends BaseRepository<ITopic> implements ITopicRepository {
  constructor(topicModel: Model<ITopic>) {
    super(topicModel);
  }

  /**
   * Retrieves the entire graph of topics for a specific study plan.
   * Uses $graphLookup to resolve deep dependencies if needed, 
   * or simple populated fetch depending on structure.
   */
  async getTopicGraphForPlan(planId: string): Promise<GraphNode[]> {
    // If the graph is shallow, we can just fetch all nodes for the plan
    // and let the service build the DAG logic in memory.
    // For large graphs, we can use MongoDB aggregate. Here we fetch all.
    const topics = await this.model.find({ plan_id: new Types.ObjectId(planId) }).lean().exec();
    
    return topics.map((t: any) => ({
      _id: t._id.toString(),
      title: t.title,
      dependencies: t.dependencies.map((d: any) => d.toString()),
    }));
  }
}
