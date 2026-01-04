import { PrismaClient } from '@prisma/client';
import { ApplicationData } from '@schemas/application.schema';

const prisma = new PrismaClient();

export type Status = 'DRAFT' | 'SUBMITTED';

export interface ApplicationWithData {
  id: string;
  status: Status;
  data: ApplicationData;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

export async function createApplication(): Promise<ApplicationWithData> {
  // Initialize with empty/default data structure
  const initialData: Partial<ApplicationData> = {
    guardianName: '',
    applicant: {} as any,
    request: {} as any,
    medicalHistory: {},
    medicalCoverage: {} as any,
    income: {
      receives: {},
      unemployment: {},
    },
    employmentApplicant: {},
    spouse: {},
    dependents: {},
    residencyGA: false,
    resourcesContacted: [],
    natureOfRequest: '',
    vendors: [{}, {}, {}],
  };

  const application = await prisma.application.create({
    data: {
      status: 'DRAFT',
      data: JSON.stringify(initialData),
    },
  });

  return {
    ...application,
    status: application.status as Status,
    data: JSON.parse(application.data) as ApplicationData,
  };
}

export async function getApplication(id: string): Promise<ApplicationWithData | null> {
  const application = await prisma.application.findUnique({
    where: { id },
    include: { uploads: true },
  });

  if (!application) return null;

  return {
    ...application,
    status: application.status as Status,
    data: JSON.parse(application.data) as ApplicationData,
  };
}

export async function updateApplication(
  id: string,
  partialData: Partial<ApplicationData>
): Promise<ApplicationWithData> {
  // Get existing application
  const existing = await getApplication(id);
  if (!existing) {
    throw new Error('Application not found');
  }

  if (existing.status === 'SUBMITTED') {
    throw new Error('Cannot modify submitted application');
  }

  // Merge with existing data (deep merge for nested objects)
  const updatedData = deepMerge(existing.data, partialData);

  const application = await prisma.application.update({
    where: { id },
    data: {
      data: JSON.stringify(updatedData),
      updatedAt: new Date(),
    },
  });

  return {
    ...application,
    status: application.status as Status,
    data: JSON.parse(application.data) as ApplicationData,
  };
}

export async function submitApplication(id: string): Promise<ApplicationWithData> {
  const existing = await getApplication(id);
  if (!existing) {
    throw new Error('Application not found');
  }

  if (existing.status === 'SUBMITTED') {
    throw new Error('Application already submitted');
  }

  const application = await prisma.application.update({
    where: { id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  return {
    ...application,
    status: application.status as Status,
    data: JSON.parse(application.data) as ApplicationData,
  };
}

export async function listApplications(status?: Status): Promise<ApplicationWithData[]> {
  const applications = await prisma.application.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return applications.map(app => ({
    ...app,
    status: app.status as Status,
    data: JSON.parse(app.data) as ApplicationData,
  }));
}

export async function resetApplication(id: string): Promise<ApplicationWithData> {
  const application = await prisma.application.update({
    where: { id },
    data: {
      status: 'DRAFT',
      submittedAt: null,
    },
  });

  return {
    ...application,
    status: application.status as Status,
    data: JSON.parse(application.data) as ApplicationData,
  };
}
