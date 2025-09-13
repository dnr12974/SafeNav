import { render, screen } from '@testing-library/react';
import Bye from './safeRoute';

test('renders goodbye with name', () => {
  render(<Bye name="Bob" />);
  expect(screen.getByText('Goodbye, Bob!')).toBeInTheDocument();
});