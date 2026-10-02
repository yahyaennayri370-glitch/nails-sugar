import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Ramp-up to 20 users
    { duration: '30s', target: 50 },  // Stay at 50 users (peak load test)
    { duration: '10s', target: 100 }, // Spike to 100 users
    { duration: '10s', target: 0 },   // Ramp-down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should complete under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate below 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Fetch public services page / API
  const resServices = http.get(`${BASE_URL}/api/services`);
  check(resServices, {
    'services status is 200': (r) => r.status === 200,
    'services response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Test 2: Fetch public gallery
  const resGallery = http.get(`${BASE_URL}/api/gallery`);
  check(resGallery, {
    'gallery status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test 3: Fetch available slots (simulating customer booking flow)
  const today = new Date().toISOString().split('T')[0];
  const resSlots = http.get(`${BASE_URL}/api/appointments/available-slots?date=${today}&serviceId=test-id`);
  check(resSlots, {
    'slots status is 200 or 400': (r) => r.status === 200 || r.status === 400,
  });

  sleep(2);
}
