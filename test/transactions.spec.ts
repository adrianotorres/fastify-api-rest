import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Transaction Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 300,
        type: 'debit',
      })
      .expect(201)
  })
  it('should be able to list all transactions', async () => {
    const createResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 300,
        type: 'debit',
      })

    const cookies = createResponse.get('Set-Cookie')

    const listResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: -300,
      }),
    ])
  })
  it('should be able to get a specific transaction', async () => {
    const createResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 300,
        type: 'debit',
      })

    const cookies = createResponse.get('Set-Cookie')

    const listResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listResponse.body.transactions[0].id

    const getResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: -300,
        id: transactionId,
      }),
    )
  })
  it('should be able to get current summary', async () => {
    const createResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 300,
        type: 'debit',
      })

    const cookies = createResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Credit transaction',
        amount: 500,
        type: 'credit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 200,
    })
  })
})
