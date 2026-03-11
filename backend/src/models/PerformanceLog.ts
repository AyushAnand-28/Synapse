import { Schema, model, Document, Types } from 'mongoose';

export interface IPerformanceLog extends Document {
  topic_id: Types.ObjectId;
  entry_date: Date;
  quiz_score?: number;
  retention_rate?: number;
  adaptive_feedback?: string;
}

const performanceLogSchema = new Schema<IPerformanceLog>(
  {
    topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    entry_date: { type: Date, default: Date.now },
    quiz_score: { type: Number, min: 0, max: 100 },
    retention_rate: { type: Number, min: 0, max: 1 },
    adaptive_feedback: { type: String },
  },
  { timestamps: true }
);

export const PerformanceLog = model<IPerformanceLog>('PerformanceLog', performanceLogSchema);
