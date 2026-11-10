import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Certifications from '../components/sections/Certifications';

beforeAll(() => {
  // Mock IntersectionObserver for Framer Motion whileInView in JSDOM
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

describe('Certifications Section', () => {
  it('renders all 9 verified certifications including Machine Learning Using Python and opens details modal', () => {
    render(<Certifications />);

    expect(screen.getByText('Professional Credentials')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(9);

    const mlCertHeading = screen.getByRole('heading', {
      level: 3,
      name: 'Machine Learning Using Python',
    });
    expect(mlCertHeading).toBeInTheDocument();
    expect(screen.getByText('Simplilearn SkillUp')).toBeInTheDocument();

    // Open certificate lightbox modal
    fireEvent.click(mlCertHeading);

    expect(screen.getByText('May 27, 2026')).toBeInTheDocument();
    expect(screen.getByText('10275986')).toBeInTheDocument();

    const fullCertLink = screen.getByRole('link', { name: /View Full Certificate/i });
    expect(fullCertLink).toHaveAttribute('href', '/images/cert-simplilearn-ml-python.png');
  });
});
