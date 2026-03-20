import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'synapse_dev_secret';
const JWT_EXPIRES = '7d';

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const password_hash = await bcrypt.hash(password, 12);
      const user = await User.create({ email: email.toLowerCase(), password_hash });

      const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      res.status(201).json({
        message: 'Account created',
        token,
        user: { id: user._id.toString(), email: user.email },
      });
    } catch (err: any) {
      console.error('[Auth] register error:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: user._id.toString(), email: user.email },
      });
    } catch (err: any) {
      console.error('[Auth] login error:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  me = async (req: any, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select('-password_hash');
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }
      res.status(200).json({ user: { id: user._id.toString(), email: user.email } });
    } catch (err: any) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
