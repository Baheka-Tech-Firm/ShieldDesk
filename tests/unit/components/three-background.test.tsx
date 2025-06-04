import { render, screen } from '@testing-library/react';
import ThreeBackground from '@/components/ui/three-background';

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
  })),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    setClearColor: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas'),
    dispose: jest.fn(),
  })),
  BufferGeometry: jest.fn(),
  BufferAttribute: jest.fn(),
  Points: jest.fn(),
  PointsMaterial: jest.fn(),
  Vector3: jest.fn(),
  Color: jest.fn(),
}));

describe('ThreeBackground', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ThreeBackground variant="default" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  it('handles different variants', () => {
    const { rerender } = render(<ThreeBackground variant="dashboard" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();

    rerender(<ThreeBackground variant="vault" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();

    rerender(<ThreeBackground variant="cyber" />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  it('accepts intensity prop', () => {
    render(<ThreeBackground variant="default" intensity={0.5} />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(<ThreeBackground variant="default" />);
    unmount();
    // Test should not throw any errors during cleanup
  });
});