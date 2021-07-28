/**
 * Define global environment variables for prod version
 */
export const environment: {
  production: boolean;
  version: string;
  api: string;
  security: 'csrf' | 'jwt';
  authPath: string;
  usersPath: string;
  utilsPath: string;
  teamUtilsPath: string;
  projectsPath: string;
  monthsPath: string;
  rolePath: string;
  gradePath: string;
  forecastsPath: string;
  lockedPath: string;
  savedPath: string;
  teamPath: string;
  executivePath: string;
  resetPasswordPath: string;
  roles: {
    css: number,
    pdl: number,
    pl: number,
    msl: number,
    fc: number,
    admin: number,
  };
  routes: {
    admin: string,
  };
  projectTypes: {
    default: number,
    nonbillable: number,
    businessdays: number,
    trainingdays: number,
    vacationdays: number,
    benchdays: number,
  };
} = {
  production: true,
  version: 'prod',
  api: 'https://forecastr-test.at.capgemini.com/forecastr-api/api/v1/',
  security: 'jwt',
  authPath: 'auth',
  usersPath: 'users',
  utilsPath: 'utilities',
  teamUtilsPath: 'teams',
  projectsPath: 'projects',
  monthsPath: 'months',
  rolePath: 'roles',
  gradePath: 'grades',
  forecastsPath: 'forecasts',
  lockedPath: 'locked',
  savedPath: 'saved',
  teamPath: 'team',
  executivePath: 'company',
  resetPasswordPath: 'password/reset',
  roles: {
    css: 0,
    pdl: 1,
    pl: 2,
    msl: 3,
    fc: 4,
    admin: 100,
  },
  routes: {
    admin: 'admin',
  },
  projectTypes: {
    default: 0,
    nonbillable: 5,
    businessdays: 1,
    trainingdays: 2,
    vacationdays: 3,
    benchdays: 4,
  },
};
