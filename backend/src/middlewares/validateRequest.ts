import { Request, Response, NextFunction } from 'express';

// For simplicity in this base architecture, we use a custom basic middleware.
// In a full implementation, swap this with Zod, Joi, or express-validator.
export const validateGeneratePlan = (req: Request, res: Response, next: NextFunction): void => {
    const { syllabusText, title, targetDate, hoursPerDay } = req.body;
    
    const errors: string[] = [];

    if (!syllabusText) errors.push('syllabusText is required');
    if (!title) errors.push('title is required');
    if (!targetDate || isNaN(Date.parse(targetDate))) errors.push('targetDate is required and must be a valid date');
    const hours = Number(hoursPerDay);
    if (!hoursPerDay || isNaN(hours) || hours <= 0) errors.push('hoursPerDay is required and must be a positive number');

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }

    next();
};
