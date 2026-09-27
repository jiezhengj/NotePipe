import { describe, expect, it } from 'vitest';
import { clampFloatingButtonPosition } from '../src/floating-position';

describe('floating button positioning', () => {
    it('keeps the button inside the viewport on every edge', () => {
        expect(clampFloatingButtonPosition(-10, -20, 32, 32, 800, 600)).toEqual({
            top: 4,
            left: 4,
        });
        expect(clampFloatingButtonPosition(590, 790, 32, 32, 800, 600)).toEqual({
            top: 564,
            left: 764,
        });
    });

    it('uses a minimum margin when the viewport is smaller than the button', () => {
        expect(clampFloatingButtonPosition(0, 0, 44, 44, 32, 32)).toEqual({
            top: 4,
            left: 4,
        });
    });
});
