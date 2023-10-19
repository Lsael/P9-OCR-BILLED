/**
 * @jest-environment jsdom
 */

import { toBeInTheDocument } from '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import router from '../app/Router.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then mail icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      );

      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');

      expect(mailIcon.className).toEqual('active-icon');
    });

    test('All fields are displayed', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByTestId('expense-type'));
      const expenseSelect = screen.getByTestId('expense-type');
      const expenseName = screen.getByTestId('expense-name');
      const datePicker = screen.getByTestId('datepicker');
      const amount = screen.getByTestId('amount');
      const tvaAmount = screen.getByTestId('vat');
      const tvaRate = screen.getByTestId('pct');
      const commentary = screen.getByTestId('commentary');
      const filePicker = screen.getByTestId('file');

      expect(expenseSelect).toBeInTheDocument();
      expect(expenseName).toBeInTheDocument();
      expect(datePicker).toBeInTheDocument();
      expect(amount).toBeInTheDocument();
      expect(tvaAmount).toBeInTheDocument();
      expect(tvaRate).toBeInTheDocument();
      expect(commentary).toBeInTheDocument();
      expect(filePicker).toBeInTheDocument();
    });

    test('Expense option list is complete', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByTestId('expense-type'));
      const expenseSelect = screen.getByTestId('expense-type');

      expect(expenseSelect.childElementCount).toEqual(7);
      expect(expenseSelect.children[0].textContent).toBe('Transports');
      expect(expenseSelect.children[1].textContent).toBe('Restaurants et bars');
      expect(expenseSelect.children[2].textContent).toBe('Hôtel et logement');
      expect(expenseSelect.children[3].textContent).toBe('Services en ligne');
      expect(expenseSelect.children[4].textContent).toBe('IT et électronique');
      expect(expenseSelect.children[5].textContent).toBe('Equipement et matériel');
      expect(expenseSelect.children[6].textContent).toBe('Fournitures de bureau');
    });

    test('Name is type text and have placeholder', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByTestId('expense-name'));
      const expenseName = screen.getByTestId('expense-name');

      expect(expenseName).toHaveAttribute('type', 'text');
      expect(expenseName).toHaveAttribute('placeholder', 'Vol Paris Londres');
    });

    test('Date is type date and required', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByTestId('datepicker'));
      const expenseDate = screen.getByTestId('datepicker');

      expect(expenseDate).toHaveAttribute('type', 'date');
      expect(expenseDate).toHaveAttribute('required');
    });

    test('Amount is type number, has placeholder and is required', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByTestId('amount'));
      const expenseAmount = screen.getByTestId('amount');

      expect(expenseAmount).toHaveAttribute('type', 'number');
      expect(expenseAmount).toHaveAttribute('placeholder', '348');
      expect(expenseAmount).toHaveAttribute('required');
    });

    test('Tva is type number and has placeholder', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByTestId('vat'));
      const tvaAmount = screen.getByTestId('vat');
      await waitFor(() => screen.getByTestId('pct'));
      const tvaRate = screen.getByTestId('pct');

      expect(tvaAmount).toHaveAttribute('type', 'number');
      expect(tvaAmount).toHaveAttribute('placeholder', '70');
      expect(tvaRate).toHaveAttribute('type', 'number');
      expect(tvaRate).toHaveAttribute('placeholder', '20');
    });

    test('Commentary is a text area', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByTestId('commentary'));
      const commentary = screen.getByTestId('commentary');

      expect(commentary.nodeName).toBe('TEXTAREA');
    });

    test('File field is type file and is required', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByTestId('file'));
      const fileField = screen.getByTestId('file');

      expect(fileField).toHaveAttribute('type', 'file');
      expect(fileField).toHaveAttribute('required');
    });

    test('Submit button is in document and is type submit', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      await waitFor(() => screen.getByText('Envoyer'));
      const submitButton = screen.getByText('Envoyer');

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

/*     test('When I change the file, it should be updated', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee'
        })
      );

      const newBillsDatas = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });

      document.body.innerHTML = BillsUI({ data: bills });

      const handleClickNewBillFunction = jest.fn(() => BillsDatas.handleClickNewBill());

      await waitFor(() => screen.getByTestId('btn-new-bill'));
      const icon = screen.getByTestId('btn-new-bill');
      icon.addEventListener('click', handleClickNewBillFunction);

      userEvent.click(icon);

      expect(handleClickNewBillFunction).toHaveBeenCalled();
    }); */
  });
});
