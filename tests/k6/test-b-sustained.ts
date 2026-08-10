import http from 'k6/http';
import { check, sleep } from 'k6';

//Test B — Increasing Load Finding

const BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}`;
const TEST_EMAIL = `${process.env.USER_EMAIL}`;
const TEST_PASSWORD = `${process.env.USER_PASSWORD}`;

export const options = {
  scenarios: {
    authenticated_api: {
      executor: 'ramping-vus',

      startVUs: 10,

      stages: [
        // 10 users for 2 minutes
        { duration: '2m', target: 10 },

        // Increase to 20 users over 30 seconds
        { duration: '30s', target: 20 },

        // 20 users for 2 minutes
        { duration: '2m', target: 20 },

        // Increase to 30 users
        { duration: '30s', target: 30 },

        // 30 users for 2 minutes
        { duration: '2m', target: 30 },

        // Increase to 40 users
        { duration: '30s', target: 40 },

        // 40 users for 2 minutes
        { duration: '2m', target: 40 },

        // Increase to 50 users
        { duration: '30s', target: 50 },

        // 50 users for 2 minutes
        { duration: '2m', target: 50 },

        // Ramp back down
        { duration: '30s', target: 0 },
      ],

      gracefulRampDown: '30s',
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<3000'],
  },

  summaryTrendStats: [
    'avg',
    'min',
    'med',
    'max',
    'p(90)',
    'p(95)',
    'p(99)',
  ],
};

export default function () {

  // --------------------------------------------------
  // 1. Get CSRF token
  // --------------------------------------------------

  const csrfResponse = http.get(
    `${BASE_URL}/api/auth/csrf`,
    {
      tags: {
        endpoint: 'csrf',
      },
    }
  );

  check(csrfResponse, {
    'CSRF request returned 200': (r) => r.status === 200,
  });

  if (csrfResponse.status !== 200) {
    sleep(5);
    return;
  }

  const csrfToken = csrfResponse.json('csrfToken');

  // --------------------------------------------------
  // 2. Login
  // --------------------------------------------------

  const loginResponse = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      csrfToken: csrfToken,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      json: 'true',
    },
    {
      redirects: 0,
      tags: {
        endpoint: 'login',
      },
    }
  );

  const loginSuccessful =
    loginResponse.status === 200 ||
    loginResponse.status === 302;

  check(loginResponse, {
    'login successful': () => loginSuccessful,
  });

  if (!loginSuccessful) {
    sleep(5);
    return;
  }

  // --------------------------------------------------
  // 3. Check session
  // --------------------------------------------------

  const sessionResponse = http.get(
    `${BASE_URL}/api/auth/session`,
    {
      tags: {
        endpoint: 'session',
      },
    }
  );

  let sessionHasUser = false;

  try {
    sessionHasUser = !!sessionResponse.json('user');
  } catch (e) {
    sessionHasUser = false;
  }

  check(sessionResponse, {
    'session returned 200': (r) => r.status === 200,

    'session has user': () => sessionHasUser,
  });

  if (
    sessionResponse.status !== 200 ||
    !sessionHasUser
  ) {
    sleep(5);
    return;
  }

  // --------------------------------------------------
  // 4. Protected API
  // --------------------------------------------------

  const apiResponse = http.get(
    `${BASE_URL}/api/admin/clients`,
    {
      tags: {
        endpoint: 'clients',
      },
    }
  );

  check(apiResponse, {
    'clients API returned 200': (r) => r.status === 200,
  });

  // --------------------------------------------------
  // Small pause between user iterations
  // --------------------------------------------------

  sleep(5);
}