import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HackathonCertificates from '../components/sections/HackathonCertificates';

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

describe('HackathonCertificates Section', () => {
  it('renders both verified hackathon certificates and opens full certificate modal', () => {
    render(<HackathonCertificates />);

    expect(screen.getByText('Hackathon Certificates')).toBeInTheDocument();
    expect(screen.getByText('National Innovation Hackathon 2026')).toBeInTheDocument();
    expect(
      screen.getByText("RIFT '26 – Hackathon (Unstop Freedom Festival)")
    ).toBeInTheDocument();

    const viewButtons = screen.getAllByRole('button', { name: /View Certificate/i });
    expect(viewButtons).toHaveLength(2);

    // Open lightbox modal
    fireEvent.click(viewButtons[0]);
    const fullLink = screen.getByRole('link', { name: /Open Full Certificate/i });
    expect(fullLink).toHaveAttribute(
      'href',
      '/images/hackathon-national-innovation-2026.jpg'
    );
  });

  it('renders a clear empty state when no certificates are provided', () => {
    render(<HackathonCertificates certificates={[]} />);
    expect(screen.getByText('No Hackathon Certificates Yet')).toBeInTheDocument();
  });
});
