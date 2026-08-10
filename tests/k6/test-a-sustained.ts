import http from 'k6/http';
import { check, sleep } from 'k6';

// Test A — Sustained Load Finding

const BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}`;
const TEST_EMAIL = `${process.env.USER_EMAIL}`;
const TEST_PASSWORD = `${process.env.USER_PASSWORD}`;

export const options = {
  scenarios: {
    authenticated_api: {
      // Keep 10 users running continuously
      executor: 'constant-vus',

      vus: 10,

      // Run for 10 minutes
      duration: '10m',
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
    sleep(30);
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
    sleep(30);
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
    sleep(30);
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
  // Wait before next iteration
  // --------------------------------------------------

  sleep(30);
}