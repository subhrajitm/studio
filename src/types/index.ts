
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warranty {
  _id: string;
  user: string; // User ID
  productName: string;
  purchaseDate: string; // ISO Date string
  warrantyLength: number; // in months or a duration string
  warrantyEndDate?: string; // ISO Date string, calculated or set
  notes?: string;
  documentUrl?: string; // URL to the uploaded document
  category?: string;
  retailer?: string;
  purchasePrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  description?: string;
  brand?: string;
  modelNumber?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface ApiErrorResponse {
  message: string;
  error?: string; // Detailed error information (development only)
}

export interface UploadResponse {
  message: string;
  filePath: string; // e.g. /uploads/filename.ext
  fileUrl: string; // e.g. https://api.example.com/uploads/filename.ext
}

export interface ExtractedWarrantyDetails {
  productName: string;
  purchaseDate: string; // YYYY-MM-DD
  warrantyExpiration: string; // YYYY-MM-DD
  otherDetails?: string;
}

// Interface for warranty form values
export interface WarrantyFormValues {
  productName: string;
  purchaseDate: Date;
  warrantyLength?: number; // In months
  warrantyEndDate?: Date;
  notes?: string;
  document?: File | null;
  documentUrl?: string;
  category?: string;
  retailer?: string;
  purchasePrice?: number;
}

// Interface for user profile form values
export interface ProfileFormValues {
  username: string;
  email: string;
  profilePictureFile?: File | null;
}
