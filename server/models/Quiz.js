import { Schema, model } from 'mongoose';
import { optionSchema } from './optionSchema.js';

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [optionSchema],
  },
  correctOption: {
    type: Number,
    required: true,
    min: 0,
  },
});

const quizSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [questionSchema],
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
});

const Quiz = model('Quiz', quizSchema);
export default Quiz;

