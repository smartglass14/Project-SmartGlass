import { Schema, model } from 'mongoose';
import { optionSchema } from './optionSchema.js';

const pollSchema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [optionSchema],
    validate: [arr => arr.length >= 2, "At least 2 options are required"]
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
});

const Poll = model('Poll', pollSchema);
export default Poll; 
