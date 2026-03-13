export interface ISyllabusParserService {
  parseSyllabusText(rawText: string): Promise<string[]>;
}

export interface IAIEngineService {
  generateDependencies(topics: string[]): Promise<any>;
}

export interface IStudyPlannerService {
  generatePlan(userId: string, syllabusText: string, title: string, targetDate: Date, hoursPerDay: number): Promise<string>;
  getRoadmap(planId: string): Promise<any>;
}
