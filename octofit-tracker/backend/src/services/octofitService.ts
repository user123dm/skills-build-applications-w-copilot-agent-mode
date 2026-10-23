import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid activity payload'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  const normalizedMinutes = Number(minutes);

  if (!userId || !teamId || typeof type !== 'string' || !type.trim() || !Number.isFinite(normalizedMinutes) || normalizedMinutes <= 0) {
    throw Object.assign(new Error('Invalid activity payload'), { status: 400 });
  }

  const userObjectId = String(userId);
  const teamObjectId = String(teamId);

  if (!mongoose.Types.ObjectId.isValid(userObjectId) || !mongoose.Types.ObjectId.isValid(teamObjectId)) {
    throw Object.assign(new Error('Invalid activity payload'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userObjectId),
    Team.findById(teamObjectId),
  ]);

  if (!user || !team) {
    throw Object.assign(new Error('Invalid activity payload'), { status: 400 });
  }

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes: normalizedMinutes,
    points: normalizedMinutes,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid team payload'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;

  if (typeof name !== 'string' || !name.trim()) {
    throw Object.assign(new Error('Invalid team payload'), { status: 400 });
  }

  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('Invalid team payload'), { status: 400 });
  }

  const normalizedMembers = Array.isArray(members)
    ? members.reduce<Array<mongoose.Types.ObjectId>>((accumulator, member) => {
        if (typeof member === 'string' && mongoose.Types.ObjectId.isValid(member)) {
          accumulator.push(new mongoose.Types.ObjectId(member));
        }
        return accumulator;
      }, [])
    : [];

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: normalizedMembers,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return leaderboard.map((entry, index) => ({
    teamName: entry.teamName,
    totalPoints: Number(entry.totalPoints),
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivity = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(1).lean();
  const recentType = recentActivity[0]?.type?.toLowerCase();
  const goalFocus = typeof user.fitnessGoal === 'string' ? user.fitnessGoal.toLowerCase() : '';
  const workouts = await Workout.find().lean();

  const bestMatch = workouts.find((workout) => {
    const focus = String(workout.focus ?? '').toLowerCase();
    return focus === goalFocus || focus === recentType;
  }) ?? workouts[0];

  if (!bestMatch) {
    return [];
  }

  return [{
    ...bestMatch,
    reason: `Matches your ${user.fitnessGoal} goal${recentType ? ` and recent ${recentType} activity` : ''}.`,
  }];
}

export { User };
