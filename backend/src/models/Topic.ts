import { Schema, model, Document, Types } from 'mongoose';

export interface ITopic extends Document {
  plan_id: Types.ObjectId;
  title: string;
  description?: string;
  mastery_score: number;
  estimated_minutes: number;
  dependencies: Types.ObjectId[];
}

const topicSchema = new Schema<ITopic>(
  {
    plan_id: { type: Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
    title: { type: String, required: true },
    description: { type: String },
    mastery_score: { type: Number, default: 0, min: 0, max: 100 },
    estimated_minutes: { type: Number, required: true },
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  },
  { timestamps: true }
);

export const Topic = model<ITopic>('Topic', topicSchema);
