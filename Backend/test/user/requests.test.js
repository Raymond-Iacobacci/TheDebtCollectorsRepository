const request = require('supertest');
const express = require('express');
const requestsRouter = require('../../src/user/requests');
const { executeQuery, uuidToString, getDate } = require('../../src/utils');

jest.mock('../../src/utils', () => ({
  executeQuery: jest.fn(),
  uuidToString: jest.fn(),
  getDate: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/requests', requestsRouter);

describe('Requests API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /requests/get-request-info should return request details', async () => {
    const { executeQuery, getDate } = require('../../src/utils');

    const mockRequestID = '11EF20B8E50C1E8A929C42010A7F6005';
    const mockRequestInfo = [{
        "type": "Kitchen",
        "tenant": "Raymond Iacobacci",
        "address": "999 MyAddress Road",
        "description": "The floor doesn't exist",
        "status": "Unresolved"
    }];

    executeQuery.mockResolvedValue(mockRequestInfo);
    
    const response = await request(app)
      .get('/requests/get-request-info')
      .query({ 'request-id': mockRequestID });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRequestInfo[0]);
    expect(executeQuery).toHaveBeenCalledWith(`SELECT r.type, CONCAT(t.firstname, ' ', t.lastname) AS tenant, t.address, r.description, r.status FROM requests 
    AS r JOIN tenants AS t ON r.tenantID = t.tenantID WHERE r.requestID = ${'0x' + mockRequestID};`);
  });

  test('PUT /requests/change-status should update request status', async () => {
    const mockRequestID = '11EF20B8E50C1E8A929C42010A7F6005';
    const mockNewStatus = 'Completed';

    executeQuery.mockResolvedValue();

    const response = await request(app)
      .put('/requests/change-status')
      .query({ 'request-id': mockRequestID })
      .send({ status: mockNewStatus });

    expect(response.status).toBe(200);
    expect(executeQuery).toHaveBeenCalledWith(`UPDATE requests SET status = '${mockNewStatus}' WHERE requestID = 0x${mockRequestID};`);
  });

  test('GET /requests/get-attachments should return attachments', async () => {
    const mockRequestID = '11EF20B8E50C1E8A929C42010A7F6005';
    const mockAttachments = [
      {
        title: 'Attachment 1',
        description: 'Description of attachment 1',
        date: '2024-06-07',
        attachment: Buffer.from('Mock attachment content'),
      },
      {
        title: 'Attachment 2',
        description: 'Description of attachment 2',
        date: '2024-06-06',
        attachment: Buffer.from('Another mock attachment'),
      }
    ];

    executeQuery.mockResolvedValue(mockAttachments);

    const response = await request(app)
      .get('/requests/get-attachments')
      .query({ 'request-id': mockRequestID });

    expect(response.status).toBe(200);
  });

  // test('POST /requests/delete-request should delete request and related data', async () => {
  //   const mockRequestID = '11EF20B8E50C1E8A929C42010A7F6005';
    
  //   executeQuery.mockResolvedValueOnce(); 
  //   executeQuery.mockResolvedValueOnce();
  //   executeQuery.mockResolvedValueOnce();
  //   executeQuery.mockResolvedValue([]);   
  //   executeQuery.mockResolvedValueOnce(); 

  //   const response = await request(app)
  //     .post('/requests/delete-request')
  //     .query({ 'request-id': mockRequestID });

  //   expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM attachments where requestID = '0x${mockRequestID}'`);
  //   expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM comments where requestID = '0x${mockRequestID}'`);
  //   expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM requests where requestID = '0x${mockRequestID}'`);
  //   expect(executeQuery).toHaveBeenCalledWith(`SELECT expenseID from expenses where requestID = '0x${mockRequestID}'`);
  //   expect(executeQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE expenses SET requestID = NULL where expenseID ='));
  // });

  test('POST /requests/add-comment should add a comment', async () => {
    const mockRequestID = '11EF20B8E50C1E8A929C42010A7F6005';
    const mockUserID = '22EF20B8E50C1E8A929C42010A7F6006';
    const mockComment = 'This is a test comment';
    const mockDate = '2024-06-07';
    const mockResults = { affectedRows: 1 };

    getDate.mockReturnValue(mockDate);
    executeQuery.mockResolvedValue(mockResults);

    const response = await request(app)
      .post('/requests/add-comment')
      .query({ 'request-id': mockRequestID })
      .send({ userID: mockUserID, comment: mockComment });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResults);
    expect(getDate).toHaveBeenCalled();
    expect(executeQuery).toHaveBeenCalledWith(
      'INSERT INTO comments (requestID, date, comment, userID) VALUES (?, ?, ?, ?)',
      [
        Buffer.from(mockRequestID, 'hex'),
        mockDate,
        mockComment,
        Buffer.from(mockUserID, 'hex')
      ]
    );
  });

  test('GET /requests/get-comments should return comments with user names', async () => {
    const mockRequestID = '11EF20B8E50C1E8A929C42010A7F6005';
    const mockCommentResults = [
      { commentID: '1', userID: Buffer.from('22EF20B8E50C1E8A929C42010A7F6006', 'hex'), comment: 'Test comment', date: '2024-06-07' },
    ];
    const mockTenantResults = [{ firstName: 'John', lastName: 'Doe' }];
    const mockManagerResults = [];

    executeQuery
      .mockResolvedValueOnce(mockCommentResults) 
      .mockResolvedValueOnce(mockTenantResults) 
      .mockResolvedValueOnce(mockManagerResults);

    uuidToString.mockImplementation((buffer) => buffer.toString('hex').toUpperCase());

    const response = await request(app)
      .get('/requests/get-comments')
      .query({ 'request-id': mockRequestID });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        commentID: '1',
        comment: 'Test comment',
        date: '2024-06-07',
        user: 'John Doe',
      },
    ]);
    expect(executeQuery).toHaveBeenCalledWith(`SELECT commentID, userID, comment, date FROM comments WHERE requestID = 0x${mockRequestID} ORDER BY date;`);
    expect(executeQuery).toHaveBeenCalledWith(`SELECT firstName, lastName FROM tenants WHERE tenantID = ${uuidToString(Buffer.from('22EF20B8E50C1E8A929C42010A7F6006', 'hex'))};`);
  });

  // test('POST /requests/delete-request should delete request and related data', async () => {
  //   const mockRequestID = '11EF20B8E50C1E8A929C42010A7F6005';

  //   executeQuery.mockResolvedValueOnce(); 
  //   executeQuery.mockResolvedValueOnce();
  //   executeQuery.mockResolvedValueOnce();
  //   executeQuery.mockResolvedValue([]);   
  //   executeQuery.mockResolvedValueOnce(); 

  //   const response = await request(app)
  //     .post('/requests/delete-request')
  //     .query({ 'request-id': mockRequestID });

  //   expect(response.status).toBe(200);
  //   expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM attachments where requestID = '0x${mockRequestID}'`);
  //   expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM comments where requestID = '0x${mockRequestID}'`);
  //   expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM requests where requestID = '0x${mockRequestID}'`);
  //   expect(executeQuery).toHaveBeenCalledWith(`SELECT expenseID from expenses where requestID = '0x${mockRequestID}'`);
  //   expect(executeQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE expenses SET requestID = NULL where expenseID ='));
  // });

});