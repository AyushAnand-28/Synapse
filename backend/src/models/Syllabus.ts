import { Schema, model, Document, Types } from 'mongoose';

export interface ISyllabus extends Document {
  user_id: Types.ObjectId;
  file_url?: string;
  raw_text?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

const syllabusSchema = new Schema<ISyllabus>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    file_url: { type: String },
    raw_text: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Syllabus = model<ISyllabus>('Syllabus', syllabusSchema);
