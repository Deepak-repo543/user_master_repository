export interface UserContactEntry {
  email: string;
  mobileNumber: string;
  branchIds: number[];
  reportingManager: number | null;
  accessibleModules: number[];
  language: string;
}

export interface UserRequest {
  id?: number | null;
  userId: string;
  employeeId: number;
  email: string;
  employeeCode: string;
  fullName: string;
  departmentId: number;
  designationId: number;
  roleId: number;
  dashboard?: string;
  timeZone?: string;
  loginType: string;
  passwordExpiry?: number | null;
  twoFactorAuthentication?: boolean;
  profileImage?: File;
  digitalSignature?: File;
  remarks?: string;
  status: boolean;
}

export interface UserResponse
  extends Omit<
    UserRequest,
    "profileImage" | "digitalSignature"
  > {
  id: number;
  profileImage?: string;
  digitalSignature?: string;
  createdAt: string;
  updatedAt: string;
}