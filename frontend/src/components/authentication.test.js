import { render, screen } from '@testing-library/react';
import Greet from './authentication';

test('renders greeting with person', () => {
  render(<Greet person="Alice" />);
  expect(screen.getByText('Greetings, Alice!')).toBeInTheDocument();
});