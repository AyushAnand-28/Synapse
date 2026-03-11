import { Schema, model, Document, Types } from 'mongoose';

export interface IStudyPlan extends Document {
  user_id: Types.ObjectId;
  title: string;
  start_date: Date;
  target_date: Date;
  daily_hour_commitment: number;
}

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    start_date: { type: Date, required: true },
    target_date: { type: Date, required: true },
    daily_hour_commitment: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

export const StudyPlan = model<IStudyPlan>('StudyPlan', studyPlanSchema);
