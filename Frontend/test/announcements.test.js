import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import { AnnouncementsView } from 'src/sections/announcements/view';

// ----------------------------------------------------------------------

jest.mock('src/routes/hooks', () => ({
  usePathname: jest.fn(
    () => 'localhost:3030/dashboard/manager/11EEDCD88EB60DF78F5742010A7F6002/announcements'
  ),
}));

jest.mock('src/sections/announcements/hooks/announcement-specifics', () => ({
  getAnnouncements: jest.fn(),
  addAnnouncement: jest.fn()
}));

jest.mock('src/components/scrollbar', () => ({ children }) => <div>{children}</div>);

jest.mock('src/sections/announcements/table-components/table-row', () => ({ title, description, date }) => (
  <tr>
    <td>{title}</td>
    <td>{description}</td>
    <td>{date}</td>
  </tr>
));

jest.mock('src/sections/announcements/table-components/table-head', () => () => <thead><tr><th>Title</th><th>Description</th><th>Date</th></tr></thead>);

jest.mock('src/sections/announcements/table-components/table-empty-rows', () => () => <tr><td>No rows</td></tr>);

const mockAnnouncements = [
  { announcementID: 1, title: 'Announcement 1', description: 'Description 1', date: '2023-01-01' },
  { announcementID: 2, title: 'Announcement 2', description: 'Description 2', date: '2023-01-02' }
];

describe("AnnouncementsView Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly and displays data", async () => {
    const { getAnnouncements } = require('src/sections/announcements/hooks/announcement-specifics');
    getAnnouncements.mockResolvedValue(mockAnnouncements);

    render(<BrowserRouter><AnnouncementsView /></BrowserRouter>);

    expect(screen.getByText(/Announcements/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Announcement/i })).toBeInTheDocument();

    await waitFor(() => {
      mockAnnouncements.forEach(announcement => {
        expect(screen.getByText(announcement.title)).toBeInTheDocument();
        expect(screen.getByText(announcement.description)).toBeInTheDocument();
        expect(screen.getByText(announcement.date)).toBeInTheDocument();
      });
    });
  });

  test("displays loading spinner and handles error messages", async () => {
    const { getAnnouncements } = require('src/sections/announcements/hooks/announcement-specifics');
    getAnnouncements.mockRejectedValue(new Error('Failed to fetch announcements'));

    render(<BrowserRouter><AnnouncementsView /></BrowserRouter>);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch announcements')).toBeInTheDocument();
    });
  });

  test("opens and submits new announcement dialog", async () => {
    const { addAnnouncement, getAnnouncements } = require('src/sections/announcements/hooks/announcement-specifics');
    getAnnouncements.mockResolvedValue(mockAnnouncements);
    addAnnouncement.mockResolvedValue({ ok: true });

    render(<BrowserRouter><AnnouncementsView /></BrowserRouter>);

    fireEvent.click(screen.getByRole('button', { name: /New Announcement/i }));

    expect(screen.getByText(/Make Announcement/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(getAnnouncements).toHaveBeenCalledTimes(2); // Initially and after submit
    });
  });
});
