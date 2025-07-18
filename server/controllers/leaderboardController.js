import StudentAnalytics from '../models/StudentAnalytics.js';
import Session from '../models/Session.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

const calculateRankScore = (accuracy, timeTaken, avgTimeTaken, maxTimeTaken) => {
  // Normalize accuracy (0-100 to 0-1)
  const normalizedAccuracy = accuracy / 100;
  
  // Normalize time (faster = higher score, 0-1 scale)
  let normalizedTime = 0.5; // Default value
  
  if (maxTimeTaken !== avgTimeTaken) {
    normalizedTime = Math.max(0, 1 - (timeTaken - avgTimeTaken) / (maxTimeTaken - avgTimeTaken));
  } else {
    // If all times are the same, give equal score
    normalizedTime = 0.5;
  }
  
  // Weighted combination: 70% accuracy + 30% time efficiency
  const finalScore = (normalizedAccuracy * 0.7) + (normalizedTime * 0.3);
  
  return {
    normalizedAccuracy,
    normalizedTime,
    finalScore
  };
};

const updateRankings = async (sessionId) => {
  try {
    const analytics = await StudentAnalytics.find({ sessionId })
      .populate('userId', 'name email')
      .sort({ score: -1, timeTaken: 1 });

    if (analytics.length === 0) return [];

    // statistics for normalization
    const scores = analytics.map(a => a.score);
    const times = analytics.map(a => a.timeTaken);
    
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    const updatedAnalytics = [];
    
    for (let i = 0; i < analytics.length; i++) {
      const analytic = analytics[i];
      
      const rankFactors = calculateRankScore(
        analytic.accuracy,
        analytic.timeTaken,
        avgTime,
        maxTime
      );

      analytic.rank = i + 1;
      analytic.rankFactors = {
        scoreWeight: 0.7,
        timeWeight: 0.3,
        normalizedScore: rankFactors.normalizedAccuracy,
        normalizedTime: rankFactors.normalizedTime,
        finalRankScore: rankFactors.finalScore
      };

      await analytic.save();
      updatedAnalytics.push(analytic);
    }

    return updatedAnalytics;
  } catch (error) {
    console.error('Error updating rankings:', error);
    throw error;
  }
};

export const submitQuizResult = async (req, res) => {
  try {
    const { sessionCode, answers, startTime, endTime, timeSpentPerQuestion } = req.body;
    const userId = req.userId;

    if (!sessionCode || !answers || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const session = await Session.findOne({ sessionCode });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const quiz = await Quiz.findOne({ session: session._id });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const existingSubmission = await StudentAnalytics.findOne({
      userId,
      sessionId: session._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;
    const timeTaken = (new Date(endTime) - new Date(startTime)) / 1000; 

    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selectedOption === question.correctOption;
      
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: timeSpentPerQuestion[index] || 0
      };
    });

    const score = (correctAnswers / totalQuestions) * 100;
    const accuracy = score;

    const analytics = new StudentAnalytics({
      userId,
      quizId: quiz._id,
      sessionId: session._id,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      timeTaken,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      accuracy,
      answers: processedAnswers
    });

    await analytics.save();

    await updateRankings(session._id);

    res.status(201).json({
      message: "Quiz submitted successfully",
      score,
      accuracy,
      correctAnswers,
      totalQuestions
    });

  } catch (error) {
    console.error('Error submitting quiz result:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Quiz already submitted" });
    }
    
    res.status(500).json({ message: "Failed to submit quiz result" });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const userId = req.userId;

    if (!sessionCode) {
      return res.status(400).json({ message: "Session code required" });
    }

    const session = await Session.findOne({ sessionCode });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const leaderboard = await StudentAnalytics.find({ sessionId: session._id })
      .populate('userId', 'name email')
      .sort({ 'rankFactors.finalRankScore': -1, timeTaken: 1 })
      .select('-answers');

    const userAnalytics = await StudentAnalytics.findOne({
      userId,
      sessionId: session._id
    });

    const leaderboardData = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId._id,
      name: entry.userId.name,
      email: entry.userId.email,
      score: Math.round(entry.score),
      accuracy: Math.round(entry.accuracy),
      correctAnswers: entry.correctAnswers,
      totalQuestions: entry.totalQuestions,
      timeTaken: Math.round(entry.timeTaken),
      finalRankScore: Math.round(entry.rankFactors.finalRankScore * 100),
      normalizedScore: Math.round(entry.rankFactors.normalizedScore * 100),
      normalizedTime: Math.round(entry.rankFactors.normalizedTime * 100)
    }));

    res.status(200).json({
      leaderboard: leaderboardData,
      myRank: userAnalytics ? leaderboardData.findIndex(entry => entry.userId.toString() === userId) + 1 : null,
      myScore: userAnalytics ? Math.round(userAnalytics.score) : null,
      totalParticipants: leaderboardData.length
    });

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ message: "Failed to get leaderboard" });
  }
};

// Get detailed analytics for a specific session (educator only)
export const getSessionAnalytics = async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const userId = req.userId;

    if (!sessionCode) {
      return res.status(400).json({ message: "Session code required" });
    }

    const session = await Session.findOne({ sessionCode }).populate('educator');
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.educator._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const analytics = await StudentAnalytics.find({ sessionId: session._id })
      .populate('userId', 'name email')
      .sort({ 'rankFactors.finalRankScore': -1 });

    const detailedAnalytics = analytics.map(entry => ({
      rank: entry.rank,
      userId: entry.userId._id,
      name: entry.userId.name,
      email: entry.userId.email,
      score: Math.round(entry.score),
      accuracy: Math.round(entry.accuracy),
      correctAnswers: entry.correctAnswers,
      totalQuestions: entry.totalQuestions,
      timeTaken: Math.round(entry.timeTaken),
      finalRankScore: Math.round(entry.rankFactors.finalRankScore * 100),
      normalizedScore: Math.round(entry.rankFactors.normalizedScore * 100),
      normalizedTime: Math.round(entry.rankFactors.normalizedTime * 100),
      answers: entry.answers,
      submittedAt: entry.createdAt
    }));

    const totalParticipants = analytics.length;
    const avgScore = totalParticipants > 0 ? analytics.reduce((sum, a) => sum + a.score, 0) / totalParticipants : 0;
    const avgTime = totalParticipants > 0 ? analytics.reduce((sum, a) => sum + a.timeTaken, 0) / totalParticipants : 0;
    const avgAccuracy = totalParticipants > 0 ? analytics.reduce((sum, a) => sum + a.accuracy, 0) / totalParticipants : 0;

    res.status(200).json({
      sessionCode,
      sessionTitle: session.title,
      totalParticipants,
      avgScore: Math.round(avgScore),
      avgTime: Math.round(avgTime),
      avgAccuracy: Math.round(avgAccuracy),
      analytics: detailedAnalytics
    });

  } catch (error) {
    console.error('Error getting session analytics:', error);
    res.status(500).json({ message: "Failed to get session analytics" });
  }
};

 