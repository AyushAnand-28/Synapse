import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  topic_id: Types.ObjectId;
  scheduled_at: Date;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  actual_duration_mins: number;
}

const taskSchema = new Schema<ITask>(
  {
    topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    scheduled_at: { type: Date, required: true },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'MISSED'],
      default: 'TODO',
    },
    actual_duration_mins: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Task = model<ITask>('Task', taskSchema);
