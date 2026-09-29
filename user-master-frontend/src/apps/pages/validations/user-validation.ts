import * as yup from "yup";

export interface UserFormEntry {
  id: number | null;
  userId: string;
  employeeId: number | null;
  employeeCode: string;
  fullName: string;
  departmentId: number | null;
  designationId: number | null;
  roleId: number | null;
  email: string;
  mobileNumber: string;
  branchIds: number[];
  reportingManager: number | null;
  accessibleModules: number[];
  language: string;
  dashboard: string;
  timeZone: string;
  loginType: string;
  passwordExpiry: number | null;
  twoFactorAuthentication: boolean;
  profileImage: File | null;
  digitalSignature: File | null;
  remarks: string;
  status: boolean;
}
export interface UserFormData {
  users: UserFormEntry[];
}
export const emptyUserEntry: UserFormEntry = {
  id: null,
  userId: "",
  employeeId: null,
  employeeCode: "",
  fullName: "",
  departmentId: null,
  designationId: null,
  roleId: null,
  email: "",
  mobileNumber: "",
  branchIds: [],
  reportingManager: null,
  accessibleModules: [],
  language: "",
  dashboard: "",
  timeZone: "",
  loginType: "",
  passwordExpiry: null,
  twoFactorAuthentication: false,
  profileImage: null,
  digitalSignature: null,
  remarks: "",
  status: false,
};

const BLOCKED_EMAIL_DOMAINS = [
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "mailinator.com",
  "fake.com",
  "sample.com",
  "yopmail.com",
  "tempmail.com",
  "dummy.com",
];

const BLOCKED_EMAIL_LOCAL_PARTS = ["example", "test", "sample", "dummy", "fake", "demo"];

const KNOWN_PROVIDER_DOMAINS: Record<string, string> = {
  gmail: "gmail.com",
  yahoo: "yahoo.com",
  outlook: "outlook.com",
  hotmail: "hotmail.com",
  rediffmail: "rediffmail.com",
  icloud: "icloud.com",
  live: "live.com",
};

export const userEntryValidationSchema: yup.ObjectSchema<UserFormEntry> =
  yup.object({
    id: yup.number().nullable().defined(),

    userId: yup
      .string()
      .trim()
      .required("User ID is required")
      .max(50, "Maximum 50 characters")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "User ID must contain only letters and numbers",
      ),

    employeeId: yup.number().nullable().required("Employee is required"),

    employeeCode: yup
      .string()
      .trim()
      .required("Employee Code is required")
      .max(20, "Maximum 20 characters")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "Employee Code must contain only letters and numbers",
      ),

    fullName: yup.string().trim().required("Full Name is required"),

    departmentId: yup.number().nullable().required("Department is required"),

    designationId: yup.number().nullable().required("Designation is required"),

    roleId: yup.number().nullable().required("Role is required"),

    email: yup
      .string()
      .trim()
      .required("Email is required")
      .email("Enter a valid email")
      .test("no-placeholder-email", "Please enter a real email address, not a placeholder", (value) => {
        if (!value) return true;
        const parts = value.toLowerCase().split("@");
        const local = parts[0];
        const domain = parts[1];
        if (!domain) return true;
        if (BLOCKED_EMAIL_DOMAINS.includes(domain)) return false;
        if (BLOCKED_EMAIL_LOCAL_PARTS.includes(local)) return false;
        return true;
      })
      .test("known-provider-typo", "Check the domain spelling (e.g. gmail.com, yahoo.com)", (value) => {
        if (!value) return true;
        const domain = value.toLowerCase().split("@")[1];
        if (!domain) return true;
        for (const key of Object.keys(KNOWN_PROVIDER_DOMAINS)) {
          if (domain.startsWith(key) && domain !== KNOWN_PROVIDER_DOMAINS[key]) {
            return false;
          }
        }
        return true;
      }),

    mobileNumber: yup
      .string()
      .required("Mobile Number is required")
      .matches(
        /^[6-9][0-9]{9}$/,
        "Mobile number must be 10 digits and start with 6, 7, 8 or 9",
      ),

    branchIds: yup
      .array()
      .of(yup.number().required())
      .min(1, "Select at least one branch")
      .required("Branch is required"),

    reportingManager: yup.number().nullable().defined(),

    accessibleModules: yup.array().of(yup.number().required()).defined(),

    language: yup
      .string()
      .oneOf(
        ["English", "Hindi", "Arabic"],
        "Language must be English, Hindi or Arabic",
      )
      .required("Language is required"),
    dashboard: yup.string().defined(),

    timeZone: yup.string().defined(),

    loginType: yup.string().required("Login Type is required"),

    passwordExpiry: yup
      .number()
      .nullable()
      .min(0, "Minimum 0 days")
      .max(999, "Maximum 999 days")
      .defined(),

    twoFactorAuthentication: yup.boolean().required(),

    profileImage: yup.mixed<File>().nullable().defined(),

    digitalSignature: yup.mixed<File>().nullable().defined(),

    remarks: yup.string().defined(),

    status: yup.boolean().required(),
  });
export const userValidationSchema: yup.ObjectSchema<UserFormData> = yup.object({
  users: yup
    .array()
    .of(userEntryValidationSchema)
    .min(1, "At least one user is required")
    .required(),
});