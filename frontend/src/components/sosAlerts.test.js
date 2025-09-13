// src/components/Hello.test.js
import { render, screen } from '@testing-library/react';
import Hello from './sosAlerts';

test('renders greeting with name', () => {
  render(<Hello name="World" />);
  expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});