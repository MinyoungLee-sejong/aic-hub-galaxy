import { render, screen } from '@testing-library/react';
import { GalaxyBackground, calculatePointerTargetX, createStarData } from './GalaxyBackground';

describe('GalaxyBackground', () => {
  it('creates deterministic star positions and colors inside the requested bounds', () => {
    const first = createStarData(8, 12, 6, 1234);
    const second = createStarData(8, 12, 6, 1234);

    expect(first.positions).toEqual(second.positions);
    expect(first.colors).toEqual(second.colors);
    expect(first.positions).toHaveLength(24);
    expect(first.colors).toHaveLength(24);
    expect(Math.max(...first.positions)).toBeLessThanOrEqual(6);
    expect(Math.min(...first.positions)).toBeGreaterThanOrEqual(-6);
  });

  it('keeps the CSS galaxy fallback when WebGL is unavailable', () => {
    render(<GalaxyBackground webglAvailable={false} />);

    expect(screen.getByTestId('galaxy-visuals')).toHaveClass('galaxy-visuals');
    expect(screen.getByTestId('galaxy-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('galaxy-canvas')).not.toBeInTheDocument();
  });

  it('pushes nearby stars farther while leaving distant stars in place', () => {
    expect(
      calculatePointerTargetX({
        originX: 1,
        y: 0,
        z: 0,
        pointerX: 0,
        pointerY: 0,
      }),
    ).toBeCloseTo(1.507, 2);

    expect(
      calculatePointerTargetX({
        originX: 3,
        y: 0,
        z: 0,
        pointerX: 0,
        pointerY: 0,
      }),
    ).toBe(3);
  });
});
