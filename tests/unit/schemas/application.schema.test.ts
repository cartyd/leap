import {
  applicantSchema,
  medicalCoverageSchema,
  incomeSchema,
  submitApplicationSchema,
} from '../../../src/schemas/application.schema';

describe('Applicant Schema Validation', () => {
  interface ApplicantTestCase {
    name: string;
    input: Record<string, any>;
    shouldPass: boolean;
    expectedErrors?: string[];
  }

  const testCases: ApplicantTestCase[] = [
    {
      name: 'valid complete applicant data',
      input: {
        firstName: 'John',
        middleInitial: 'D',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dob: '1980-01-01',
        address1: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301',
        county: 'Fulton',
        phoneHome: '404-555-0100',
        phoneCell: '404-555-0101',
      },
      shouldPass: true,
    },
    {
      name: 'valid applicant without optional fields',
      input: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        dob: '1990-05-15',
        address1: '456 Oak Ave',
        city: 'Savannah',
        state: 'GA',
        zip: '31401',
        county: 'Chatham',
      },
      shouldPass: true,
    },
    {
      name: 'missing required firstName',
      input: {
        lastName: 'Doe',
        email: 'test@example.com',
        dob: '1980-01-01',
        address1: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301',
        county: 'Fulton',
      },
      shouldPass: false,
      expectedErrors: ['firstName'],
    },
    {
      name: 'invalid email format',
      input: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        dob: '1980-01-01',
        address1: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301',
        county: 'Fulton',
      },
      shouldPass: false,
      expectedErrors: ['email'],
    },
    {
      name: 'invalid ZIP code format',
      input: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dob: '1980-01-01',
        address1: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        zip: '123',
        county: 'Fulton',
      },
      shouldPass: false,
      expectedErrors: ['zip'],
    },
    {
      name: 'valid ZIP+4 format',
      input: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dob: '1980-01-01',
        address1: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301-1234',
        county: 'Fulton',
      },
      shouldPass: true,
    },
    {
      name: 'empty string for optional fields',
      input: {
        firstName: 'John',
        middleInitial: '',
        lastName: 'Doe',
        email: 'john@example.com',
        dob: '1980-01-01',
        address1: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301',
        county: 'Fulton',
        phoneHome: '',
        phoneCell: '',
      },
      shouldPass: true,
    },
  ];

  testCases.forEach(({ name, input, shouldPass, expectedErrors }) => {
    it(name, () => {
      const result = applicantSchema.safeParse(input);

      if (shouldPass) {
        expect(result.success).toBe(true);
      } else {
        expect(result.success).toBe(false);
        if (expectedErrors && !result.success) {
          const errorPaths = result.error.errors.map((err) => err.path[0]);
          expectedErrors.forEach((expectedError) => {
            expect(errorPaths).toContain(expectedError);
          });
        }
      }
    });
  });
});

describe('Medical Coverage Schema Validation', () => {
  interface MedicalCoverageTestCase {
    name: string;
    input: Record<string, any>;
    shouldPass: boolean;
    expectedErrors?: string[];
  }

  const testCases: MedicalCoverageTestCase[] = [
    {
      name: 'valid with private insurance',
      input: {
        hasInsurance: true,
        coverageType: 'Private',
        privateInsuranceName: 'Blue Cross',
        rxCoverage: 'Yes',
        copayAmount: 20,
      },
      shouldPass: true,
    },
    {
      name: 'valid with Medicaid',
      input: {
        hasInsurance: true,
        coverageType: 'Medicaid',
        rxCoverage: 'Yes',
        copayAmount: 15,
      },
      shouldPass: true,
    },
    {
      name: 'valid with rxCoverage Yes + copay',
      input: {
        hasInsurance: true,
        coverageType: 'Medicare',
        rxCoverage: 'Yes',
        copayAmount: 25.5,
      },
      shouldPass: true,
    },
    {
      name: 'no insurance',
      input: {
        hasInsurance: false,
        coverageType: 'None',
        rxCoverage: 'No',
      },
      shouldPass: true,
    },
    {
      name: 'private insurance without name',
      input: {
        hasInsurance: true,
        coverageType: 'Private',
        rxCoverage: 'Yes',
        copayAmount: 10,
      },
      shouldPass: false,
      expectedErrors: ['privateInsuranceName'],
    },
    {
      name: 'copay without amount',
      input: {
        hasInsurance: true,
        coverageType: 'Medicare',
        rxCoverage: 'Yes',
      },
      shouldPass: false,
      expectedErrors: ['copayAmount'],
    },
    {
      name: 'copay with zero amount',
      input: {
        hasInsurance: true,
        coverageType: 'Medicare',
        rxCoverage: 'Yes',
        copayAmount: 0,
      },
      shouldPass: true,
    },
    {
      name: 'negative copay amount',
      input: {
        hasInsurance: true,
        coverageType: 'Medicare',
        rxCoverage: 'Copay',
        copayAmount: -10,
      },
      shouldPass: false,
    },
  ];

  testCases.forEach(({ name, input, shouldPass, expectedErrors }) => {
    it(name, () => {
      const result = medicalCoverageSchema.safeParse(input);

      if (shouldPass) {
        expect(result.success).toBe(true);
      } else {
        expect(result.success).toBe(false);
        if (expectedErrors && !result.success) {
          const errorPaths = result.error.errors.map((err) =>
            err.path.join('.')
          );
          expectedErrors.forEach((expectedError) => {
            expect(errorPaths).toContain(expectedError);
          });
        }
      }
    });
  });
});

describe('Income Schema Validation', () => {
  interface IncomeTestCase {
    name: string;
    input: Record<string, any>;
    shouldPass: boolean;
    expectedErrors?: string[];
  }

  const testCases: IncomeTestCase[] = [
    {
      name: 'valid with SSDI',
      input: {
        appliedDisability: true,
        receives: {
          type: 'SSDI',
          monthlyAmount: 1200,
        },
        currentlyEmployed: false,
        unemployment: {
          receiving: false,
        },
      },
      shouldPass: true,
    },
    {
      name: 'valid with SSI',
      input: {
        receives: {
          type: 'SSI',
          monthlyAmount: 800,
        },
        unemployment: {
          receiving: false,
        },
      },
      shouldPass: true,
    },
    {
      name: 'valid with unemployment',
      input: {
        receives: {
          type: 'None',
        },
        unemployment: {
          receiving: true,
          amount: 350,
        },
      },
      shouldPass: true,
    },
    {
      name: 'valid with no benefits',
      input: {
        receives: {
          type: 'None',
        },
        currentlyEmployed: true,
        unemployment: {
          receiving: false,
        },
      },
      shouldPass: true,
    },
    {
      name: 'SSDI without monthly amount',
      input: {
        receives: {
          type: 'SSDI',
        },
        unemployment: {
          receiving: false,
        },
      },
      shouldPass: false,
      expectedErrors: ['receives.monthlyAmount'],
    },
    {
      name: 'SSI without monthly amount',
      input: {
        receives: {
          type: 'SSI',
        },
        unemployment: {
          receiving: false,
        },
      },
      shouldPass: false,
      expectedErrors: ['receives.monthlyAmount'],
    },
    {
      name: 'unemployment without amount',
      input: {
        receives: {
          type: 'None',
        },
        unemployment: {
          receiving: true,
        },
      },
      shouldPass: false,
      expectedErrors: ['unemployment.amount'],
    },
    {
      name: 'SSDI with amount',
      input: {
        receives: {
          type: 'SSDI',
          monthlyAmount: 1500,
        },
        unemployment: {
          receiving: false,
        },
      },
      shouldPass: true,
    },
    {
      name: 'negative monthly amount',
      input: {
        receives: {
          type: 'SSDI',
          monthlyAmount: -100,
        },
        unemployment: {
          receiving: false,
        },
      },
      shouldPass: false,
    },
  ];

  testCases.forEach(({ name, input, shouldPass, expectedErrors }) => {
    it(name, () => {
      const result = incomeSchema.safeParse(input);

      if (shouldPass) {
        expect(result.success).toBe(true);
      } else {
        expect(result.success).toBe(false);
        if (expectedErrors && !result.success) {
          const errorPaths = result.error.errors.map((err) =>
            err.path.join('.')
          );
          expectedErrors.forEach((expectedError) => {
            expect(errorPaths).toContain(expectedError);
          });
        }
      }
    });
  });
});

describe('Submit Application Schema Validation', () => {
  const validCompleteApplication = {
    guardianName: '',
    applicant: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      dob: '1980-01-01',
      address1: '123 Main St',
      city: 'Atlanta',
      state: 'GA',
      zip: '30301',
      county: 'Fulton',
    },
    request: {
      assistanceFor: 'Medical',
      approximateCost: 5000,
    },
    medicalHistory: {
      diagnosisYear: 2020,
      lupusType: 'Systemic',
      physicianName: 'Dr. Smith',
      physicianPhone: '404-555-0100',
    },
    medicalCoverage: {
      hasInsurance: true,
      coverageType: 'Medicare',
      rxCoverage: 'Yes',
      copayAmount: 50,
    },
    income: {
      receives: {
        type: 'SSDI',
        monthlyAmount: 1200,
      },
      unemployment: {
        receiving: false,
      },
    },
    employmentApplicant: {
      status: 'Unemployed',
    },
    spouse: {
      name: '',
    },
    dependents: {
      count: 0,
    },
    residencyGA: true,
    resourcesContacted: [],
    natureOfRequest: 'Need assistance with outstanding medical bills',
    vendors: [
      {
        vendorName: 'Atlanta Medical Center',
        amountRequesting: 2500,
      },
      {},
      {},
    ],
    certification: {
      applicantSignatureTyped: 'John Doe',
      dateSigned: '2024-01-01',
    },
  };

  it('should pass with valid complete application', () => {
    const result = submitApplicationSchema.safeParse(validCompleteApplication);
    expect(result.success).toBe(true);
  });

  it('should fail without vendor 1 name', () => {
    const data = {
      ...validCompleteApplication,
      vendors: [
        {
          amountRequesting: 2500,
        },
        {},
        {},
      ],
    };
    const result = submitApplicationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should fail without vendor 1 amount', () => {
    const data = {
      ...validCompleteApplication,
      vendors: [
        {
          vendorName: 'Atlanta Medical Center',
        },
        {},
        {},
      ],
    };
    const result = submitApplicationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should fail without signature', () => {
    const data = {
      ...validCompleteApplication,
      certification: {
        dateSigned: '2024-01-01',
      },
    };
    const result = submitApplicationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should fail without date signed', () => {
    const data = {
      ...validCompleteApplication,
      certification: {
        applicantSignatureTyped: 'John Doe',
      },
    };
    const result = submitApplicationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should fail without GA residency', () => {
    const data = {
      ...validCompleteApplication,
      residencyGA: false,
    };
    const result = submitApplicationSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorPaths = result.error.errors.map((err) => err.path.join('.'));
      expect(errorPaths).toContain('residencyGA');
    }
  });

  it('should fail without nature of request', () => {
    const data = {
      ...validCompleteApplication,
      natureOfRequest: '',
    };
    const result = submitApplicationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
