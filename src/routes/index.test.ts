import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../app';

describe('GET /api/v1/health', () => {
  it('informa que a API esta disponivel', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: 'safehome-api',
      version: '1.0.1',
      status: 'ok'
    });
    expect(response.body.timestamp).toBeTypeOf('string');
  });
});
