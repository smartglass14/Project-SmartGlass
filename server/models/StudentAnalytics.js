import { Schema, model } from 'mongoose';

const studentAnalyticsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  guestId :{ type: String },
  guestName: { type: String },
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  incorrectAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  accuracy: {
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  rank: {
    type: Number,
    default: 1
  },
  rankFactors: {
    scoreWeight: {
      type: Number,
      default: 0.7 
    },
    timeWeight: {
      type: Number,
      default: 0.3 
    },
    normalizedScore: {
      type: Number,
      default: 0
    },
    normalizedTime: {
      type: Number,
      default: 0
    },
    finalRankScore: {
      type: Number,
      default: 0
    }
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedOption: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    timeSpent: {
      type: Number, 
      required: true
    }
  }]
}, { 
  timestamps: true 
});

studentAnalyticsSchema.index({ sessionId: 1, rank: 1 });
studentAnalyticsSchema.index(
  { sessionId: 1, userId: 1, guestId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      $or: [
        { userId: { $type: 'objectId' } },
        { guestId: { $type: 'string' } }
      ]
    }
  }
);
studentAnalyticsSchema.index({ sessionId: 1, finalRankScore: -1 });

const StudentAnalytics = model('StudentAnalytics', studentAnalyticsSchema);
export default StudentAnalytics; 