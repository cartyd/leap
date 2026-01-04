import { z } from 'zod';

// Base schemas for reusable types
const phoneSchema = z.string().regex(/^[\d\s\-\(\)]+$/).optional().or(z.literal(''));
const emailSchema = z.string().email();
const currencySchema = z.coerce.number().nonnegative();
const yearSchema = z.coerce.number().int().min(1900).max(new Date().getFullYear());

// Applicant information
export const applicantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleInitial: z.string().max(1).optional().or(z.literal('')),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  dob: z.string().min(1, 'Date of birth is required'),
  address1: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  county: z.string().min(1, 'County is required'),
  phoneHome: phoneSchema,
  phoneCell: phoneSchema,
});

export const guardianSchema = z.object({
  guardianName: z.string().optional().or(z.literal('')),
});

export const requestSchema = z.object({
  assistanceFor: z.string().min(1, 'Assistance type is required'),
  approximateCost: currencySchema,
});

// Medical information
export const medicalHistorySchema = z.object({
  diagnosisYear: yearSchema.optional().or(z.literal('')),
  lupusType: z.enum(['Discoid', 'Systemic', 'Both', 'Unknown']).optional().or(z.literal('')),
  physicianName: z.string().optional().or(z.literal('')),
  physicianPhone: phoneSchema,
});

export const medicalCoverageSchema = z.object({
  hasInsurance: z.boolean(),
  coverageType: z.enum(['Medicaid', 'Medicare', 'Private', 'None']).optional().or(z.literal('')),
  privateInsuranceName: z.string().optional().or(z.literal('')),
  rxCoverage: z.enum(['Yes', 'No', 'Copay']).optional().or(z.literal('')),
  copayAmount: currencySchema.optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // If has insurance and is private, require insurance name
  if (data.hasInsurance && data.coverageType === 'Private' && !data.privateInsuranceName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Private insurance name is required',
      path: ['privateInsuranceName'],
    });
  }
  // If rx coverage is copay, require copay amount
  if (data.rxCoverage === 'Copay' && (data.copayAmount === undefined || data.copayAmount === '' || data.copayAmount === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Copay amount is required',
      path: ['copayAmount'],
    });
  }
});

// Income information
export const incomeSchema = z.object({
  appliedDisability: z.boolean().optional(),
  receives: z.object({
    ssdi: z.boolean().optional(),
    ssi: z.boolean().optional(),
    monthlyAmount: currencySchema.optional().or(z.literal('')),
  }),
  currentlyEmployed: z.boolean().optional(),
  unemployment: z.object({
    receiving: z.boolean().optional(),
    amount: currencySchema.optional().or(z.literal('')),
  }),
  otherIncome: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // If receives SSDI or SSI, require monthly amount
  if ((data.receives.ssdi || data.receives.ssi) && !data.receives.monthlyAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Monthly amount is required',
      path: ['receives', 'monthlyAmount'],
    });
  }
  // If receiving unemployment, require amount
  if (data.unemployment.receiving && !data.unemployment.amount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Unemployment amount is required',
      path: ['unemployment', 'amount'],
    });
  }
});

export const employmentApplicantSchema = z.object({
  employerName: z.string().optional().or(z.literal('')),
  status: z.enum(['Full-Time', 'Part-Time', 'Other', 'Unemployed']).optional().or(z.literal('')),
  otherStatusText: z.string().optional().or(z.literal('')),
  grossIncome: currencySchema.optional().or(z.literal('')),
});

export const spouseSchema = z.object({
  name: z.string().optional().or(z.literal('')),
  phone: phoneSchema,
  employerName: z.string().optional().or(z.literal('')),
  status: z.enum(['Full-Time', 'Part-Time', 'Other', 'Unemployed']).optional().or(z.literal('')),
  otherStatusText: z.string().optional().or(z.literal('')),
  grossTaxableIncome: currencySchema.optional().or(z.literal('')),
});

// Dependents and residency
export const dependentsSchema = z.object({
  count: z.coerce.number().int().nonnegative().optional().or(z.literal('')),
  agesText: z.string().optional().or(z.literal('')),
});

export const residencySchema = z.object({
  residencyGA: z.boolean(),
});

// Resources contacted
export const resourceSchema = z.object({
  nameOrAgency: z.string().optional().or(z.literal('')),
  outcome: z.string().optional().or(z.literal('')),
});

export const resourcesContactedSchema = z.array(resourceSchema).max(4);

// Nature of request
export const natureOfRequestSchema = z.object({
  natureOfRequest: z.string().min(1, 'Nature of request is required'),
});

// Vendors
export const vendorSchema = z.object({
  vendorName: z.string().optional().or(z.literal('')),
  contactPerson: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal('')),
  telephone: phoneSchema,
  fax: phoneSchema,
  email: z.string().optional().or(z.literal('')),
  totalAmountOwed: currencySchema.optional().or(z.literal('')),
  amountRequesting: currencySchema.optional().or(z.literal('')),
});

export const vendorsSchema = z.array(vendorSchema).length(3);

// Certification
export const certificationSchema = z.object({
  applicantSignatureTyped: z.string().min(1, 'Signature is required'),
  dateSigned: z.string().min(1, 'Date is required'),
});

// Complete application schema
export const applicationDataSchema = z.object({
  guardianName: z.string().optional().or(z.literal('')),
  applicant: applicantSchema,
  request: requestSchema,
  medicalHistory: medicalHistorySchema,
  medicalCoverage: medicalCoverageSchema,
  income: incomeSchema,
  employmentApplicant: employmentApplicantSchema,
  spouse: spouseSchema,
  dependents: dependentsSchema,
  residencyGA: z.boolean(),
  resourcesContacted: resourcesContactedSchema,
  natureOfRequest: z.string().min(1, 'Nature of request is required'),
  vendors: vendorsSchema,
  certification: certificationSchema.optional(),
});

// Step schemas (lenient for draft saving)
export const step1Schema = z.object({
  guardianName: z.string().optional().or(z.literal('')),
  applicant: applicantSchema.partial().optional(),
  request: requestSchema.partial().optional(),
});

export const step2Schema = z.object({
  medicalHistory: medicalHistorySchema.partial().optional(),
  medicalCoverage: medicalCoverageSchema.optional(),
});

export const step3Schema = z.object({
  income: incomeSchema.optional(),
  employmentApplicant: employmentApplicantSchema.partial().optional(),
  spouse: spouseSchema.partial().optional(),
});

export const step4Schema = z.object({
  dependents: dependentsSchema.partial().optional(),
  residencyGA: z.boolean().optional(),
  resourcesContacted: z.array(resourceSchema).max(4).optional(),
});

export const step5Schema = z.object({
  natureOfRequest: z.string().optional().or(z.literal('')),
  vendors: z.array(vendorSchema.partial()).length(3).optional(),
});

export const step6Schema = z.object({
  certification: certificationSchema.partial().optional(),
});

// Strict schema for final submission
export const submitApplicationSchema = applicationDataSchema.superRefine((data, ctx) => {
  // Ensure at least vendor 1 has name and amount
  if (!data.vendors[0]?.vendorName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vendor 1 name is required',
      path: ['vendors', 0, 'vendorName'],
    });
  }
  if (!data.vendors[0]?.amountRequesting) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vendor 1 amount requesting is required',
      path: ['vendors', 0, 'amountRequesting'],
    });
  }
  // Ensure certification is complete
  if (!data.certification?.applicantSignatureTyped) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Signature is required',
      path: ['certification', 'applicantSignatureTyped'],
    });
  }
  if (!data.certification?.dateSigned) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Date signed is required',
      path: ['certification', 'dateSigned'],
    });
  }
  // Ensure GA residency is true
  if (!data.residencyGA) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Georgia residency is required',
      path: ['residencyGA'],
    });
  }
});

// Type exports
export type ApplicationData = z.infer<typeof applicationDataSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
