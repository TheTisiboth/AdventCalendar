import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCalendarStore, useSnackBarStore } from './store'

describe('useMulti hook (via store hooks)', () => {
    describe('useCalendarStore', () => {
        it('should retrieve multiple items from the calendar store', () => {
            const { result } = renderHook(() =>
                useCalendarStore('date', 'isFake', 'startingDate')
            )

            expect(result.current).toHaveProperty('date')
            expect(result.current).toHaveProperty('isFake')
            expect(result.current).toHaveProperty('startingDate')
            expect(result.current.date).toBeInstanceOf(Date)
            expect(typeof result.current.isFake).toBe('boolean')
            expect(result.current.startingDate).toBeInstanceOf(Date)
        })

        it('should retrieve a single item from the store', () => {
            const { result } = renderHook(() => useCalendarStore('isFake'))

            expect(result.current).toHaveProperty('isFake')
            expect(typeof result.current.isFake).toBe('boolean')
        })

        it('should update when store values change', () => {
            const { result } = renderHook(() =>
                useCalendarStore('isFake', 'setIsFake')
            )

            const initialValue = result.current.isFake

            act(() => {
                result.current.setIsFake(!initialValue)
            })

            expect(result.current.isFake).toBe(!initialValue)
        })

        it('should maintain consistent hook calls across re-renders', () => {
            const { result, rerender } = renderHook(() =>
                useCalendarStore('date', 'isFake', 'startingDate')
            )

            const firstRender = result.current

            // Re-render the hook
            rerender()

            // The hook should return the same structure
            expect(Object.keys(result.current)).toEqual(Object.keys(firstRender))
        })
    })

    describe('useSnackBarStore', () => {
        it('should retrieve multiple items from the snackbar store', () => {
            const { result } = renderHook(() =>
                useSnackBarStore('open', 'message', 'severity')
            )

            expect(result.current).toHaveProperty('open')
            expect(result.current).toHaveProperty('message')
            expect(result.current).toHaveProperty('severity')
            expect(typeof result.current.open).toBe('boolean')
            expect(typeof result.current.message).toBe('string')
        })

        it('should handle snackbar state changes', () => {
            const { result } = renderHook(() =>
                useSnackBarStore('open', 'message', 'handleClick', 'handleClose', 'severity')
            )

            act(() => {
                result.current.handleClick('Test message', 'success')
            })

            expect(result.current.open).toBe(true)
            expect(result.current.message).toBe('Test message')
            expect(result.current.severity).toBe('success')

            act(() => {
                result.current.handleClose()
            })

            expect(result.current.open).toBe(false)
        })
    })

    describe('Rules of Hooks compliance', () => {
        it('should not violate Rules of Hooks with varying number of items', () => {
            // This test ensures that the refactored useMulti calls the store hook
            // only once, regardless of how many items are requested

            // First render with 3 items
            const { result: result1, rerender: rerender1 } = renderHook(() =>
                useCalendarStore('date', 'isFake', 'startingDate')
            )

            expect(result1.current).toHaveProperty('date')
            expect(result1.current).toHaveProperty('isFake')
            expect(result1.current).toHaveProperty('startingDate')

            // Re-render should work consistently
            rerender1()
            expect(result1.current).toHaveProperty('date')
            expect(result1.current).toHaveProperty('isFake')
            expect(result1.current).toHaveProperty('startingDate')

            // Second hook with different number of items should also work
            const { result: result2 } = renderHook(() =>
                useCalendarStore('date')
            )

            expect(result2.current).toHaveProperty('date')
        })

        it('should work with zero items (edge case)', () => {
            const { result } = renderHook(() => useCalendarStore())

            // Should return an empty object
            expect(result.current).toEqual({})
        })

        it('should work with all store items', () => {
            const { result } = renderHook(() =>
                useCalendarStore(
                    'date',
                    'setDate',
                    'isFake',
                    'setIsFake',
                    'startingDate',
                    'endingDate',
                    'isStarted',
                    'setIsStarted'
                )
            )

            expect(Object.keys(result.current).length).toBe(8)
        })
    })
})
