import { Schema, model } from 'mongoose';
import { optionSchema } from './optionSchema.js';

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'text'],
    required: true,
    default: 'mcq',
  },
  options: {
    type: [optionSchema],
    required: function() { return this.type === 'mcq'; },
  },
  correctOption: {
    type: Number,
    required: function() { return this.type === 'mcq'; },
    min: 0,
  },
  answersGivenBy: [
    { studentName: String, answer: String }
  ],
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

