import React from 'react'
import { LineDrawingWrapper, regular } from './shared.mjs'

const strokeScale = 0.5

export const Gozer = ({
  className = 'w-64', // CSS classes to apply
  stroke = 1, // Stroke width to use
}) => {
  // Normalize stroke across designs
  stroke = stroke * strokeScale

  return (
    <LineDrawingWrapper viewBox="0 0 186 178" {...{ className, stroke }}>
      <Front stroke={stroke} />
      <Back stroke={stroke} />
    </LineDrawingWrapper>
  )
}

/*
 * React component for the front
 */
export const GozerFront = ({
  className = 'w-64', // CSS classes to apply
  stroke = 1, // Stroke width to use
}) => {
  // Normalize stroke across designs
  stroke = stroke * strokeScale

  return (
    <LineDrawingWrapper viewBox="0 0 93 178" {...{ className, stroke }}>
      <Front stroke={stroke} />
    </LineDrawingWrapper>
  )
}

/*
 * React component for the back
 */
export const GozerBack = ({
  className = 'w-64', // CSS classes to apply
  stroke = 1, // Stroke width to use
}) => {
  // Normalize stroke across designs
  stroke = stroke * strokeScale

  return (
    <LineDrawingWrapper viewBox="93 0 93 178" {...{ className, stroke }}>
      <Back stroke={stroke} />
    </LineDrawingWrapper>
  )
}

/*
 * SVG elements for the front
 */
export const Front = ({ stroke }) => (
  <>
    <path
      key="folds"
      opacity={0.3}
      {...regular(stroke)}
      d="m 61.62,30.16
      c 0,0 -0.19,-12.37 -6.16,-17.97

      m 21.37,95.12
      c 0,0 -9.14,-42.73 -11.96,-69.64

      M 53.14,159.68
      c 0,0 0,-52.26 -0.22,-78.39 -0.07,-8.27 -0.35,-24.8 -0.35,-24.8

      m 16.02,108.84
      c 0,0 -0.7,-51.63 -2.36,-77.38 -0.9,-13.91 -4.11,-41.63 -4.11,-41.63

      M 70.39,157.19 69.89,144.44

      M 30.79,30.16
      c 0,0 0.19,-12.37 6.16,-17.97

      M 15.57,107.32
      c 0,0 9.14,-42.73 11.96,-69.64

      M 39.27,159.68
      c 0,0 -0,-52.26 0.22,-78.39 0.07,-8.27 0.35,-24.8 0.35,-24.8

      M 23.82,165.33
      c 0,0 0.7,-51.63 2.36,-77.38 0.9,-13.91 4.11,-41.63 4.11,-41.63

      M 22.02,157.19 22.52,144.44"
    />
    <path
      key="outline"
      d="m 50,23.14
      a 2.92,2.92 0 0 0 2.92,2.92 2.92,2.92 0 0 0 2.92,-2.92 2.92,2.92 0 0 0 -2.92,-2.92 2.92,2.92 0 0 0 -2.92,2.92
      z

      m 25.5,131.09 -0.09,-5.78

      M 46.2,5.29
      c 0,0 3.55,-0.03 5.22,0.5 2.09,0.66 4.06,1.8 5.72,3.23 2.55,2.2 4.56,5.03 6.22,7.96 3.29,5.8 4.27,12.67 7.21,18.65 3.81,7.74 10.99,13.86 13.43,22.13 3.15,10.7 3.11,83.38 3.11,83.38 0,0 -11.88,7.77 -18.15,10.51 0,0 6.03,2.05 6.59,2.61 0,0 -2.92,0.68 -5.16,2.92
      l 0.31,6.34
      c 0,0 -0.93,1.31 -2.11,1.8
      l 0.37,2.18
      c -4.3,2.58 -8.74,4.23 -15.47,3.85 0,0 -0.44,0.31 -0.57,1.01 0,0 -2.29,0.53 -7.87,0.35

      M 42.41,23.14
      a 2.92,2.92 0 0 1 -2.92,2.92 2.92,2.92 0 0 1 -2.92,-2.92 2.92,2.92 0 0 1 2.92,-2.92 2.92,2.92 0 0 1 2.92,2.92
      z

      M 46.2,5.29
      c 0,0 -3.55,-0.03 -5.22,0.5 -2.09,0.66 -4.06,1.8 -5.72,3.23 -2.55,2.2 -4.56,5.03 -6.22,7.96 -3.29,5.8 -4.27,12.67 -7.21,18.65 -3.81,7.74 -10.99,13.86 -13.43,22.13 -3.15,10.7 -3.11,83.38 -3.11,83.38 0,0 11.88,7.77 18.15,10.51 0,0 -6.03,2.05 -6.59,2.61 0,0 2.92,0.68 5.16,2.92
      l -0.31,6.34
      c 0,0 0.93,1.31 2.11,1.8
      l -0.37,2.18
      c 4.3,2.58 8.74,4.23 15.47,3.85 0,0 0.44,0.31 0.57,1.01 0,0 2.29,0.53 7.87,0.35

      m -30.44,-18.5 0.09,-5.78"
    />
  </>
)

/*
 * SVG elements for the back
 */
const Back = ({ stroke }) => (
  <>
    <path
      key="outline"
      {...regular(stroke)}
      d="m 168.62,154.23 -0.09,-5.78

      M 139.33,5.29
      c 0,0 3.55,-0.03 5.22,0.5 2.09,0.66 4.06,1.8 5.72,3.23 2.55,2.2 4.56,5.03 6.22,7.96 3.29,5.8 4.27,12.67 7.21,18.65 3.81,7.74 10.99,13.86 13.43,22.13 3.15,10.7 3.11,83.38 3.11,83.38 0,0 -11.88,7.77 -18.15,10.51 0,0 6.03,2.05 6.59,2.61 0,0 -2.92,0.68 -5.16,2.92
      l 0.31,6.34
      c 0,0 -0.93,1.31 -2.11,1.8
      l 0.37,2.18
      c -4.3,2.58 -8.74,4.23 -15.47,3.85 0,0 -0.44,0.31 -0.57,1.01 0,0 -2.29,0.53 -7.87,0.35

      M 139.33,5.29
      c 0,0 -3.55,-0.03 -5.22,0.5 -2.09,0.66 -4.06,1.8 -5.72,3.23 -2.55,2.2 -4.56,5.03 -6.22,7.96 -3.29,5.8 -4.27,12.67 -7.21,18.65 -3.81,7.74 -10.99,13.86 -13.43,22.13 -3.15,10.7 -3.11,83.38 -3.11,83.38 0,0 11.88,7.77 18.15,10.51 0,0 -6.03,2.05 -6.59,2.61 0,0 2.92,0.68 5.16,2.92
      l -0.31,6.34
      c 0,0 0.93,1.31 2.11,1.8
      l -0.37,2.18
      c 4.3,2.58 8.74,4.23 15.47,3.85 0,0 0.44,0.31 0.57,1.01 0,0 2.29,0.53 7.87,0.35

      m -30.44,-18.5 0.09,-5.78"
    />
    <path
      key="folds"
      opacity={0.3}
      d="m 154.75,30.16
      c 0,0 -0.19,-12.37 -6.16,-17.97

      M 169.96,107.32
      c 0,0 -9.14,-42.73 -11.96,-69.64

      M 146.27,159.68
      c 0,0 0,-52.26 -0.22,-78.39 -0.07,-8.27 -0.35,-24.8 -0.35,-24.8

      m 16.02,108.84
      c 0,0 -0.7,-51.63 -2.36,-77.38 -0.9,-13.91 -4.11,-41.63 -4.11,-41.63

      m 8.27,110.86 -0.5,-12.75

      M 123.91,30.16
      c 0,0 0.19,-12.37 6.16,-17.97

      M 108.69,107.32
      c 0,0 9.14,-42.73 11.96,-69.64

      M 132.39,159.68
      c 0,0 -0,-52.26 0.22,-78.39 0.07,-8.27 0.35,-24.8 0.35,-24.8

      M 116.95,165.33
      c 0,0 0.7,-51.63 2.36,-77.38 0.9,-13.91 4.11,-41.63 4.11,-41.63

      m -8.27,110.86 0.5,-12.75"
    />
  </>
)
