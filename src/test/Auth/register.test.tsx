/* eslint-disable arrow-body-style */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable global-require */
import {
  cleanup, fireEvent, queryByAttribute, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import firebase from 'firebase/compat';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { auth } from '../../config/firebase_config';
import RegisterPage from '../../pages/auth/register';
import '@testing-library/jest-dom';

jest.mock('firebase/compat/app', () => {
  const Firestore = () => ({
    collection: () => ({
      where: () => ({
        onSnapshot: () => null,
      }),
      doc: () => ({
        get: () => ({
          then: () => null,

        }),
        set: () => ({
          then: () => null,

        }),
      }),
    }),
    // to mock attributes
    FieldValue: {
      serverTimestamp: jest.fn(),
    },

  });

  const firestore = Firestore;
  const app = jest.requireActual('firebase/compat/app');
  const auth = () => ({
    onAuthStateChanged: jest.fn(),
    createUserWithEmailAndPassword: (args : any) => new Promise<void>((resolve) => resolve()),
  });

  auth.GoogleAuthProvider = jest.fn();
  auth.signInWithEmailAndPassword = jest.fn();

  return {
    __esModule: true,
    ...app,
    default: {
      auth,
      initializeApp: jest.fn(),
      firestore,
    },
  };
});

const getById = queryByAttribute.bind(null, 'id');

afterEach(cleanup);

test('Register renders correctly', async () => {
  const component = render(<BrowserRouter><RegisterPage /></BrowserRouter>);
  expect(component.getByText('Getting Started')).toBeTruthy();
  expect(component.getByText('Already have an account? Sign in')).toBeTruthy();

  const firstNameInput = component.getByTestId('first-name');
  expect(firstNameInput).toBeTruthy();
  userEvent.type(firstNameInput, 'first name');
  expect(firstNameInput).toHaveAttribute('value', 'first name');

  const lastNameInput = component.getByTestId('last-name');
  expect(lastNameInput).toBeTruthy();
  userEvent.type(lastNameInput, 'last name');
  expect(lastNameInput).toHaveAttribute('value', 'last name');

  const emailInput = component.getByTestId('email');
  expect(emailInput).toBeTruthy();
  userEvent.type(emailInput, 'test@test.com');
  expect(emailInput).toHaveAttribute('value', 'test@test.com');

  const phoneInput = component.getByTestId('phone-number');
  expect(phoneInput).toBeTruthy();
  userEvent.type(phoneInput, '5143211234');
  expect(phoneInput).toHaveAttribute('value', '5143211234');

  const passwordInput = component.getByTestId('password');
  expect(passwordInput).toBeTruthy();
  userEvent.type(passwordInput, 'password');
  expect(passwordInput).toHaveAttribute('value', 'password');

  const confirmInput = component.getByTestId('confirm-password');
  expect(confirmInput).toBeTruthy();
  userEvent.type(confirmInput, 'password');
  expect(confirmInput).toHaveAttribute('value', 'password');

  const button = getById(component.container, 'next-1');
  expect(button?.closest('button')?.disabled).toBeFalsy();
  fireEvent.click(button as HTMLElement);

  expect(component.getByText('Health Information')).toBeTruthy();

  const datepicker = screen.getByLabelText('Date of Birth *');
  userEvent.type(datepicker, '2021-11-09');
  const chosenDate = screen.getByRole('button', { name: 'Mar 29, 2022' });
  fireEvent.click(chosenDate);
  expect(chosenDate).toBeInTheDocument();

  const okButton = screen.getByRole('button', { name: 'OK' });
  expect(okButton).toBeTruthy();
  fireEvent.click(okButton);

  expect(component.getByLabelText('Weight')).toBeTruthy();

  const height = component.getByLabelText('Height *');
  expect(height).toBeTruthy();
  userEvent.type(height, '125');
  expect(height).toHaveAttribute('value', '125');

  expect(component.getByText('Sex')).toBeTruthy();

  const healthcareNumber = component.getByTestId('healthcare-number');
  expect(healthcareNumber).toBeTruthy();
  userEvent.type(healthcareNumber, 'test123');
  expect(healthcareNumber).toHaveAttribute('value', 'test123');

  expect(component.getByLabelText('Medical Conditions')).toBeTruthy();
  expect(component.getByLabelText('Additional Notes')).toBeTruthy();

  const checkbox = component.getByTestId('accept-policy').querySelector('input[type="checkbox"]');
  expect(checkbox).toBeTruthy();
  fireEvent.click(checkbox as HTMLElement);
  expect(checkbox).toHaveProperty('checked', true);

  const registerButton = component.getByTestId('register-button');
  expect(registerButton).toBeTruthy();

  const c = await waitFor(() => fireEvent.click(registerButton), {
    timeout: 3000,
  });
});