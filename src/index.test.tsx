import { useLog } from './index'
import { act, renderHook } from '@testing-library/react'
import { useEffect, useState } from 'react'

describe('useLog', () => {
  const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
  const consoleGroup = jest.spyOn(console, 'group').mockImplementation(() => {})

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('exists', () => {
    expect(useLog).toBeTruthy()
  })

  it('renders hook', () => {
    const { result } = renderHook(useLog)
    expect(result.current.log).toBeTruthy()

    renderHook(() => result.current.log('Test'))
    expect(consoleLog).toBeCalledWith('      On mount: Test')
    expect(consoleLog).toBeCalledWith(
      'Previous value: %cTest',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      ' Current value: %cTest',
      'color: green; font-weight: bold;',
    )
    expect(consoleLog).toBeCalledTimes(3)
  })

  it('renders hook with changes', async () => {
    const { result } = renderHook(useLog)
    const { unmount: logUnmount, rerender: logRerender } = renderHook(() => {
      const [state, setState] = useState<string | null>(null)

      result.current.log(state)

      useEffect(() => {
        setState('onMount')

        setTimeout(() => {
          setState('onChange 1s')
        }, 1000)

        setTimeout(() => {
          setState('onChange 2s')
        }, 2000)
      }, [])
    })

    /*
     * Set Initial Values
     */
    expect(consoleGroup).toBeCalledWith(
      `Mount in %c<TestComponent /> %c@ ${new Date().toLocaleTimeString()}`,
      'color: DodgerBlue',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith('      On mount: null')

    expect(consoleGroup).toBeCalledWith(
      `Change in %c<TestComponent /> %c@ ${new Date().toLocaleTimeString()}`,
      'color: DodgerBlue',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      'Previous value: %cnull',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      ' Current value: %cnull',
      'color: green; font-weight: bold;',
    )
    expect(consoleGroup).toBeCalledWith(
      `Change in %c<TestComponent /> %c@ ${new Date().toLocaleTimeString()}`,
      'color: DodgerBlue',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      'Previous value: %cnull',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      ' Current value: %cnull',
      'color: green; font-weight: bold;',
    )
    expect(consoleLog).toBeCalledTimes(5)
    expect(consoleGroup).toBeCalledTimes(3)

    /*
     * Check first change
     */
    await act(() => {
      jest.advanceTimersByTime(1000)
      logRerender()
    })
    expect(consoleGroup).toBeCalledWith(
      `Change in %c<TestComponent /> %c@ ${new Date().toLocaleTimeString()}`,
      'color: DodgerBlue',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      'Previous value: %cnull',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      ' Current value: %conChange 1s',
      'color: green; font-weight: bold;',
    )
    expect(consoleLog).toBeCalledTimes(7)
    expect(consoleGroup).toBeCalledTimes(4)

    /*
     * Check second change
     */
    await act(() => {
      jest.advanceTimersByTime(1000)
      logRerender()
    })
    expect(consoleGroup).toBeCalledWith(
      `Change in %c<TestComponent /> %c@ ${new Date().toLocaleTimeString()}`,
      'color: DodgerBlue',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      'Previous value: %conChange 1s',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      ' Current value: %conChange 2s',
      'color: green; font-weight: bold;',
    )
    expect(consoleLog).toBeCalledTimes(9)
    expect(consoleGroup).toBeCalledTimes(5)

    /*
     * Check unmount change
     */
    await act(() => {
      logUnmount()
    })
    expect(consoleGroup).toBeCalledWith(
      `Unmount in %c<TestComponent /> %c@ ${new Date().toLocaleTimeString()}`,
      'color: DodgerBlue',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      'Previous value: %conChange 2s',
      'color: SlateGray; font-weight: thin;',
    )
    expect(consoleLog).toBeCalledWith(
      ' Current value: %cnull',
      'color: green; font-weight: bold;',
    )
    expect(consoleLog).toBeCalledTimes(11)
    expect(consoleGroup).toBeCalledTimes(6)
  })
})
