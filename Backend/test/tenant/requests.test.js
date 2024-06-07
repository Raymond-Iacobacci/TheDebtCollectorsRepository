const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { executeQuery, getDate } = require('../../src/utils'); 
const requestsRouter = require('../../src/tenant/requests'); 

jest.mock('../../src/utils');

const app = express();
app.use(bodyParser.json());
app.use('/requests', requestsRouter);

describe('POST /requests/new-request', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new request and return the requestID', async () => {
    const tenantID = 'a1b2c3';
    const managerID = Buffer.from('d4e5f6', 'hex');
    const date = '2024-06-07';

    executeQuery
      .mockImplementationOnce(() => Promise.resolve([{ managerID }])) 
      .mockImplementationOnce(() => Promise.resolve()) 
      .mockImplementationOnce(() => Promise.resolve([{ requestID: Buffer.from('789abc', 'hex') }]))
      .mockImplementationOnce(() => Promise.resolve()); 

    getDate.mockReturnValue(date);

    const response = await request(app)
      .post('/requests/new-request?tenant-id=' + tenantID)
      .set('Content-Type', 'multipart/form-data')
      .field('description', 'Test Description')
      .field('type', 'Test Type')
      .attach('attachment', Buffer.from('Test File Content'), 'testfile.txt');

    expect(response.status).toBe(200);
    expect(response.text).toBe('0x789ABC');

    expect(executeQuery).toHaveBeenCalledTimes(4);
    expect(executeQuery).toHaveBeenNthCalledWith(1, `SELECT managerID FROM tenants where tenantID = 0x${tenantID};`);
    expect(executeQuery).toHaveBeenNthCalledWith(2, 'INSERT INTO requests (description, tenantID, managerID, status, date, type) VALUES (?, ?, ?, ?, ?, ?)', [
      'Test Description',
      Buffer.from(tenantID, 'hex'),
      managerID,
      'Unresolved',
      date,
      'Test Type'
    ]);
    expect(executeQuery).toHaveBeenNthCalledWith(3, 'SELECT requestID FROM requests ORDER BY id DESC LIMIT 1;');
    expect(executeQuery).toHaveBeenNthCalledWith(4, 'INSERT INTO attachments (title, description, attachment, requestID, date) VALUES (?, ?, ?, ?, ?)', [
      'Test Type',
      'Test Description',
      Buffer.from('Test File Content'),
      Buffer.from('789abc', 'hex'),
      date
    ]);
  });

  test('should return 404 if requestID is not found after insert', async () => {
    const tenantID = 'a1b2c3';
    const managerID = Buffer.from('d4e5f6', 'hex');
    const date = '2024-06-07';

    executeQuery
      .mockImplementationOnce(() => Promise.resolve([{ managerID }]))
      .mockImplementationOnce(() => Promise.resolve()) 
      .mockImplementationOnce(() => Promise.resolve([])); 
    getDate.mockReturnValue(date);

    const response = await request(app)
      .post('/requests/new-request?tenant-id=' + tenantID)
      .set('Content-Type', 'multipart/form-data')
      .field('description', 'Test Description')
      .field('type', 'Test Type')
      .attach('attachment', Buffer.from('Test File Content'), 'testfile.txt');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'requestID not found in requests table.' });
  });

  test('should return 500 on server error', async () => {
    const tenantID = 'a1b2c3';

    executeQuery.mockImplementationOnce(() => Promise.reject(new Error('Test Error'))); 

    const response = await request(app)
      .post('/requests/new-request?tenant-id=' + tenantID)
      .set('Content-Type', 'multipart/form-data')
      .field('description', 'Test Description')
      .field('type', 'Test Type')
      .attach('attachment', Buffer.from('Test File Content'), 'testfile.txt');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error inserting into table' });
  });

  test('should return all requests for the given tenantID', async () => {
    const tenantID = 'a1b2c3';
    const requestResults = [
      {
        requestID: Buffer.from('789abc', 'hex'),
        description: 'Fix the leaky faucet',
        type: 'Maintenance',
        status: 'Unresolved',
        date: '2024-06-07'
      },
      {
        requestID: Buffer.from('123def', 'hex'),
        description: 'Install new blinds',
        type: 'Improvement',
        status: 'Resolved',
        date: '2024-05-20'
      }
    ];

    executeQuery.mockImplementationOnce(() => Promise.resolve(requestResults));

    const response = await request(app)
      .get('/requests/get-view?tenant-id=' + tenantID);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        requestID: '789ABC',
        description: 'Fix the leaky faucet',
        type: 'Maintenance',
        status: 'Unresolved',
        date: '2024-06-07'
      },
      {
        requestID: '123DEF',
        description: 'Install new blinds',
        type: 'Improvement',
        status: 'Resolved',
        date: '2024-05-20'
      }
    ]);

    expect(executeQuery).toHaveBeenCalledTimes(1);
    expect(executeQuery).toHaveBeenCalledWith(`SELECT requestID, description, type, status, date FROM requests WHERE tenantID = 0x${tenantID};`);
  });

  test('should return a message if no requests are found for the tenantID', async () => {
    const tenantID = 'a1b2c3';
    executeQuery.mockImplementationOnce(() => Promise.resolve([]));

    const response = await request(app)
      .get('/requests/get-view?tenant-id=' + tenantID);

    expect(response.text).toBe('[]');
  });

  test('should return 500 on server error', async () => {
    const tenantID = 'a1b2c3';
    executeQuery.mockImplementationOnce(() => Promise.reject(new Error('Test Error')));

    const response = await request(app)
      .get('/requests/get-view?tenant-id=' + tenantID);

    expect(response.body).toEqual({ error: "ERROR LOADING TENANT VIEW: ERROR Error: Test Error" });
  });
});
