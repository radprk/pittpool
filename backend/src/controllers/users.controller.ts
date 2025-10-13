import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        profilePhoto: true,
        role: true,
        verificationStatus: true,
        rating: true,
        totalRides: true,
        driverLicense: true,
        vehicleMake: true,
        vehicleModel: true,
        vehicleYear: true,
        licensePlate: true,
        insuranceProof: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      phone,
      profilePhoto,
      role,
      driverLicense,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      licensePlate,
      insuranceProof,
    } = req.body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;
    if (role) updateData.role = role;
    if (driverLicense) updateData.driverLicense = driverLicense;
    if (vehicleMake) updateData.vehicleMake = vehicleMake;
    if (vehicleModel) updateData.vehicleModel = vehicleModel;
    if (vehicleYear) updateData.vehicleYear = parseInt(vehicleYear);
    if (licensePlate) updateData.licensePlate = licensePlate;
    if (insuranceProof) updateData.insuranceProof = insuranceProof;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        profilePhoto: true,
        role: true,
        verificationStatus: true,
        rating: true,
        totalRides: true,
        driverLicense: true,
        vehicleMake: true,
        vehicleModel: true,
        vehicleYear: true,
        licensePlate: true,
        insuranceProof: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        profilePhoto: true,
        role: true,
        verificationStatus: true,
        rating: true,
        totalRides: true,
        vehicleMake: true,
        vehicleModel: true,
        vehicleYear: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // In production, implement file upload to S3 or similar service
    res.json({ message: 'Document upload endpoint - implement with file storage service' });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

