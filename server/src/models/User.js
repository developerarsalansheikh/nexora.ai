import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/roles.js';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required.'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      minlength: [3, 'Username must be at least 3 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.MEMBER,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
      default: null,
    },
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
userSchema.plugin(softDeletePlugin);
userSchema.plugin(paginationPlugin);
userSchema.plugin(auditPlugin);

// Configure toJSON and toObject outputs
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const User = mongoose.model('User', userSchema);
export default User;
