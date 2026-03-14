import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (employeeId: string) {
          // Alphanumeric, hyphens, and underscores only
          const employeeIdRegex = /^[a-zA-Z0-9_-]+$/;
          return employeeIdRegex.test(employeeId) && employeeId.length >= 2;
        },
        message: 'Employee ID must be at least 2 characters and contain only letters, numbers, hyphens, and underscores',
      },
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      validate: {
        validator: function (fullName: string) {
          return fullName.trim().length >= 2;
        },
        message: 'Full name must be at least 2 characters',
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // RFC 5322 compliant email regex (simplified but robust)
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test(email);
        },
        message: 'Please provide a valid email address (e.g., user@example.com)',
      },
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance and to enforce uniqueness
EmployeeSchema.index({ employeeId: 1 }, { unique: true });
EmployeeSchema.index({ email: 1 }, { unique: true });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
