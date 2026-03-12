import { ITopic } from '../../models/Topic';
import { IBaseRepository } from './IBaseRepository';

export interface GraphNode {
  _id: string;
  title: string;
  dependencies: string[]; // ObjectIds pointing to parents/prerequisites
  allDependencies?: GraphNode[]; // Populated by graph lookup
}

export interface ITopicRepository extends IBaseRepository<ITopic> {
  getTopicGraphForPlan(planId: string): Promise<GraphNode[]>;
}
