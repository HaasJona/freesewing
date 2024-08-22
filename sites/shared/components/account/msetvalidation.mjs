const descendingCheck = [
  ['hpsToWaistFront', 'hpsToBust'],
  ['hpsToWaistFront', 'waistToUnderbust'],
  ['shoulderToWrist', 'shoulderToElbow'],
  ['waistToFloor', 'waistToKnee', 'waistToUpperLeg', 'waistToSeat', 'waistToHips'],
  ['waistToFloor', 'inseam'],
  ['crossSeam', 'crossSeamFront'],
  ['seat', 'seatBack'],
  ['highBust', 'highBustFront'],
  ['chest', 'bustFront', 'bustSpan'],
  ['waist', 'waistBack'],
]

const constraintCheck = [
  {
    lhs: [
      { m: 'highBust', coefficient: 1 },
      { m: 'highBustFront', coefficient: -1 },
    ],
    rhs: [
      { m: 'chest', coefficient: 1 },
      { m: 'bustFront', coefficient: -1 },
    ],
    tolerance: 0.05,
  },
  {
    lhs: [{ m: 'hpsToWaistFront', coefficient: 1 }],
    rhs: [
      { m: 'hpsToBust', coefficient: 1 },
      { m: 'bustPointToUnderbust', coefficient: 1 },
      { m: 'waistToUnderbust', coefficient: 1 },
    ],
    tolerance: 0.08,
  },
  {
    lhs: [{ m: 'waistToFloor', coefficient: 1 }],
    rhs: [
      { m: 'waistToUpperLeg', coefficient: 1 },
      { m: 'inseam', coefficient: 1 },
    ],
    tolerance: 0.03,
  },
]

function checkDescendingSet(set, warnings, measies) {
  let biggerValue = null
  let biggerMeasurement = null
  for (const measurement of set) {
    let value = measies[measurement]
    if (value !== null) {
      if (biggerValue !== null && value >= biggerValue) {
        warnings.push(`${biggerMeasurement} should be larger than ${measurement}`)
      } else {
        biggerValue = value
        biggerMeasurement = measurement
      }
    }
  }
}

function checkDescendingSets(warnings, measies) {
  for (const e of descendingCheck) {
    checkDescendingSet(e, warnings, measies)
  }
}

export function validateMset(measies) {
  const warnings = []
  checkDescendingSets(warnings, measies)
  // checkConstraints(warnings, measies)
  return warnings
}
