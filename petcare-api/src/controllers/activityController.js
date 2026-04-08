import prisma from '../lib/prismaClient.js';

const parseDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const healthHandler = (req, res) => {
  res.status(200).json({ status: 'OK', service: 'PetCare API' });
};

export const getActivities = async (req, res) => {
  try {
    const activities = await prisma.petActivity.findMany({
      orderBy: { activityDate: 'desc' }
    });
    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to load activities' });
  }
};

export const createActivity = async (req, res) => {
  const { petName, activityType, description, duration, activityDate } = req.body;
  if (!petName || !activityType) {
    return res.status(400).json({ error: 'petName and activityType are required' });
  }

  try {
    const activity = await prisma.petActivity.create({
      data: {
        petName,
        activityType,
        description,
        duration: duration ? Number(duration) : null,
        activityDate: activityDate ? new Date(activityDate) : undefined
      }
    });
    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create activity' });
  }
};

export const getActivityById = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid activity id' });
  }

  try {
    const activity = await prisma.petActivity.findUnique({ where: { id } });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(200).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve activity' });
  }
};

export const updateActivity = async (req, res) => {
  const id = Number(req.params.id);
  const { petName, activityType, description, duration, activityDate } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Invalid activity id' });
  }

  try {
    const existing = await prisma.petActivity.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const updated = await prisma.petActivity.update({
      where: { id },
      data: {
        petName: petName ?? existing.petName,
        activityType: activityType ?? existing.activityType,
        description: description ?? existing.description,
        duration: duration !== undefined ? Number(duration) : existing.duration,
        activityDate: activityDate ? new Date(activityDate) : existing.activityDate
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update activity' });
  }
};

export const deleteActivity = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid activity id' });
  }

  try {
    await prisma.petActivity.delete({ where: { id } });
    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to delete activity' });
  }
};

export const filterActivities = async (req, res) => {
  const { petName, activityType, startDate, endDate } = req.query;
  const where = {};

  if (petName) {
    where.petName = { contains: petName, mode: 'insensitive' };
  }
  if (activityType) {
    where.activityType = { contains: activityType, mode: 'insensitive' };
  }
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (start || end) {
    where.activityDate = {};
    if (start) where.activityDate.gte = start;
    if (end) where.activityDate.lte = end;
  }

  try {
    const activities = await prisma.petActivity.findMany({
      where,
      orderBy: { activityDate: 'desc' }
    });
    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to filter activities' });
  }
};

const getDaysSince = (lastDate) => {
  if (!lastDate) return null;
  const diff = Date.now() - new Date(lastDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const vetCounter = async (req, res) => {
  const { petName } = req.params;
  if (!petName) {
    return res.status(400).json({ error: 'petName parameter is required' });
  }

  try {
    const visits = await prisma.petActivity.findMany({
      where: {
        petName: { contains: petName, mode: 'insensitive' },
        activityType: { contains: 'vet', mode: 'insensitive' }
      },
      orderBy: { activityDate: 'desc' }
    });

    const lastVetVisit = visits.length ? visits[0] : null;
    res.status(200).json({
      petName,
      visits: visits.length,
      lastVetVisitDate: lastVetVisit?.activityDate ?? null,
      daysSinceLastVetVisit: lastVetVisit ? getDaysSince(lastVetVisit.activityDate) : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to calculate vet counter' });
  }
};
