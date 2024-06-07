import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import PaymentsHistoryView from 'src/sections/payment-history/view';
import { getLedger, getName, makePayment, createCharge, createCredit } from 'src/hooks/payment-history-specifics';

// Mocking hooks and APIs
jest.mock('src/routes/hooks', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
  usePathname: jest.fn(
    () => 'localhost:3030/dashboard/tenant/11EEDCD88EB60DF78F5742010A7F6002/payment-history'
  ),
}));

jest.mock('src/hooks/payment-history-specifics', () => ({
  getLedger: jest.fn(),
  getName: jest.fn(),
  makePayment: jest.fn(),
  createCharge: jest.fn(),
  createCredit: jest.fn(),
}));

describe('PaymentsHistoryView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders payment history view and fetches data', async () => {
    getLedger.mockResolvedValue([]);
    getName.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });

    render(
      <BrowserRouter>
        <PaymentsHistoryView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getLedger).toHaveBeenCalled();
      expect(getName).toHaveBeenCalled();
    });

    expect(screen.getByText('Payments')).toBeInTheDocument();
  });

  test('opens and closes the payment dialog', () => {
    render(
      <BrowserRouter>
        <PaymentsHistoryView />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Make Payment'));

    expect(screen.getByText('Balance')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Submit'));
    waitFor(() => {
      expect(screen.queryByText('Balance')).not.toBeInTheDocument();
    });
  });

  test('opens and closes the charge dialog', () => {
    render(
      <BrowserRouter>
        <PaymentsHistoryView />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Charge Tenant'));

    expect(screen.getByText('Fill Charge Details')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Create Charge'));
    waitFor(() => {
      expect(screen.queryByText('Fill Charge Details')).not.toBeInTheDocument();
    });
  });

  test('opens and closes the credit dialog', () => {
    render(
      <BrowserRouter>
        <PaymentsHistoryView />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Credit Tenant'));

    expect(screen.getByText('Fill Credit Details')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Create Credit'));
    waitFor(() => {
      expect(screen.queryByText('Fill Credit Details')).not.toBeInTheDocument();
    });
  });

  test('submits a payment', async () => {
    makePayment.mockResolvedValue({ ok: true });

    render(
      <BrowserRouter>
        <PaymentsHistoryView />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Make Payment'));

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Categories'), { target: { value: 'Rent' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(makePayment).toHaveBeenCalledWith(
        '11EEDCD88EB60DF78F5742010A7F6002',
        '100',
        'Rent'
      );
    });
  });

  test('submits a charge', async () => {
    createCharge.mockResolvedValue({ ok: true });

    render(
      <BrowserRouter>
        <PaymentsHistoryView />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Charge Tenant'));

    fireEvent.change(screen.getByLabelText('Payment Amount'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Categories'), { target: { value: 'Utilities' } });
    fireEvent.click(screen.getByText('Create Charge'));

    await waitFor(() => {
      expect(createCharge).toHaveBeenCalledWith(
        '11EEDCD88EB60DF78F5742010A7F6002',
        '50',
        'Utilities'
      );
    });
  });

  test('submits a credit', async () => {
    createCredit.mockResolvedValue({ ok: true });

    render(
      <BrowserRouter>
        <PaymentsHistoryView />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Credit Tenant'));

    fireEvent.change(screen.getByLabelText('Credit Amount'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Other' } });
    fireEvent.click(screen.getByText('Create Credit'));

    await waitFor(() => {
      expect(createCredit).toHaveBeenCalledWith(
        '11EEDCD88EB60DF78F5742010A7F6002',
        '30',
        'Other'
      );
    });
  });
});
