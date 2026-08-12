import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}`;
const TEST_EMAIL = `${process.env.USER_EMAIL}`;
const TEST_PASSWORD = `${process.env.USER_PASSWORD}`;

export const options = {
  scenarios: {
    authenticated_api: {
      executor: 'per-vu-iterations',

      // 10 concurrent users
      vus: 10,

      // Each VU performs the complete flow 10 times
      iterations: 10,

      maxDuration: '10m',
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
  // 1. CSRF
  // --------------------------------------------------

  const csrfResponse = http.get(
    `${BASE_URL}/api/auth/csrf`,
    {
      tags: { endpoint: 'csrf' },
    }
  );

  check(csrfResponse, {
    'CSRF request returned 200': (r) => r.status === 200,
  });

  if (csrfResponse.status !== 200) {
    sleep(30);
    return;
  }

  const csrfToken = csrfResponse.json('csrfToken') as string | null;
  if (!csrfToken) {
    sleep(30);
    return;
  }

  // --------------------------------------------------
  // 2. Login
  // --------------------------------------------------

  const loginBody = new URLSearchParams();
  loginBody.append('csrfToken', csrfToken);
  loginBody.append('email', TEST_EMAIL);
  loginBody.append('password', TEST_PASSWORD);
  loginBody.append('json', 'true');

  const loginResponse = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    loginBody.toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      redirects: 0,
      tags: { endpoint: 'login' },
    }
  );

  check(loginResponse, {
    'login successful': (r) =>
      r.status === 200 || r.status === 302,
  });

  // --------------------------------------------------
  // 3. Session
  // --------------------------------------------------

  const sessionResponse = http.get(
    `${BASE_URL}/api/auth/session`,
    {
      tags: { endpoint: 'session' },
    }
  );

  check(sessionResponse, {
    'session returned 200': (r) => r.status === 200,

    'session has user': (r) => {
      try {
        return !!r.json('user');
      } catch (e) {
        return false;
      }
    },
  });

  // --------------------------------------------------
  // 4. Protected API
  // --------------------------------------------------

  const apiResponse = http.get(
    `${BASE_URL}/api/admin/clients`,
    {
      tags: { endpoint: 'clients' },
    }
  );

  check(apiResponse, {
    'clients API returned 200': (r) => r.status === 200,
  });

  // --------------------------------------------------
  // Wait before next batch
  // --------------------------------------------------

  sleep(30);
}