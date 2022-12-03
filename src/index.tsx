// Copyright (c) Dolf Barr <mail@dolf.me>. All rights reserved. Licensed under the MIT license.

/**
 * A react hook for logging through component lifecycle.
 *
 * @packageDocumentation
 */

import { useEffect, useRef } from 'react'
import {
  UseLogConfig,
  UseLogReturn,
  LogConfig,
  ComponentLifecycleLabels,
  _PrintConfig,
  Printer,
} from './types'
import { getComponentName, print } from './utils'
import {
  ALLOWED_NODE_ENVS,
  CSS_CHANGE,
  CSS_COMPONENT,
  CSS_SUB_VALUE,
  DEFAULT_LOG_LEVEL,
} from './constants'

/**
 * Provides a function to log through react component lifecycle.
 *
 * @param config - component level configuration for any log function in the component
 * @see {@link UseLogConfig} for the config data structure
 *
 * @returns set of functions suitable for logging
 *
 * @example
 * ```ts
 * const {log} = useLog({environments: ['dev']})
 * ```
 */
export function useLog({
  styles: {
    componentCSS = CSS_COMPONENT,
    changeCSS = CSS_CHANGE,
    subValueCSS = CSS_SUB_VALUE,
  } = {},
  environments = ALLOWED_NODE_ENVS,
  isGroupingEnabled = true,
  isGroupCollapsed = false,
  printer = console as Printer,
  logLevel = DEFAULT_LOG_LEVEL,
  groupLabelRenderer,
}: UseLogConfig = {}): UseLogReturn {
  const componentName = getComponentName()

  /**
   * Logging function to log through react component lifecycle.
   *
   * @param value - a value which changes will be logged
   * @typeParam T - type of the tracking value
   * @param config - component level configuration for any log function in the component
   * @see {@link LogConfig} for the config data structure
   *
   * @example
   * ```ts
   * log(someState, {environments: ['production']})
   * ```
   */
  function log<T>(value: T, props?: LogConfig): void {
    const clonedValue = JSON.parse(JSON.stringify(value)) as T
    const prevValueRef = useRef<T>()
    const printProps: Pick<
      _PrintConfig<T>,
      | 'value'
      | 'styles'
      | 'componentName'
      | 'flags'
      | 'printer'
      | 'logLevel'
      | 'groupLabelRenderer'
    > = {
      value: clonedValue,
      styles: {
        componentCSS: props?.styles?.componentCSS ?? componentCSS,
        subValueCSS: props?.styles?.subValueCSS ?? subValueCSS,
        changeCSS: props?.styles?.changeCSS ?? changeCSS,
      },
      componentName,
      flags: {
        isGrouped: props?.isGroupingEnabled ?? isGroupingEnabled,
        isCollapsed: props?.isGroupCollapsed ?? isGroupCollapsed,
      },
      printer: props?.printer ?? printer,
      logLevel: props?.logLevel ?? logLevel,
      groupLabelRenderer: props?.groupLabelRenderer ?? groupLabelRenderer,
    }

    if (environments.includes(process.env.NODE_ENV ?? 'production')) {
      function logHooks(): void {
        const isUnmounting = useRef(false)

        useEffect(function setIsUnmounting() {
          return function setIsUnmountingOnMount() {
            isUnmounting.current = true
          }
        }, [])

        useEffect(function onMount() {
          print({
            type: ComponentLifecycleLabels.Mount,
            ...printProps,
          })

          prevValueRef.current = value

          return function onUnmount() {
            print({
              type: ComponentLifecycleLabels.Unmount,
              prevValue: prevValueRef.current,
              ...printProps,
            })
          }
        }, [])

        useEffect(
          function onChange() {
            print({
              type: ComponentLifecycleLabels.Change,
              prevValue: prevValueRef.current,
              ...printProps,
            })

            prevValueRef.current = value
          },
          [value],
        )
      }

      return logHooks()
    }
  }

  return { log }
}
