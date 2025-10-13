import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { validateEmail, validatePhone, validatePassword } from '../utils/validators';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password, name, role } = req.body;

    // Validation
    if (!email || !phone || !password || !name) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (!validatePhone(phone)) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.message });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this email or phone already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        name,
        role: role || 'RIDER',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        profilePhoto: true,
        verificationStatus: true,
        rating: true,
        totalRides: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    // In production, implement proper email verification with tokens
    res.json({ message: 'Email verification endpoint - implement with email service' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
};

export const verifyPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    // In production, implement proper phone verification with SMS service
    res.json({ message: 'Phone verification endpoint - implement with SMS service' });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ error: 'Failed to verify phone' });
  }
};

