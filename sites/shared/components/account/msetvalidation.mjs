import { useTranslation } from 'next-i18next'
import { formatMm } from '../../utils.mjs'
import { ns as inputNs } from 'shared/components/inputs.mjs'

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

const { t } = useTranslation(inputNs, 'account')

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
        warnings.push(t('shouldBeLarger', { lhs: t(biggerMeasurement), rhs: t(measurement) }))
      } else {
        biggerValue = value
        biggerMeasurement = measurement
      }
    }
  }
}

function formatSum(params) {
  let result = ''
  for (const e of params) {
    let prefix = ''
    if (e.coefficient === -1) {
      prefix = '-'
    } else if (e.coefficient !== 1) {
      prefix = e.coefficient + '×'
    }
    result += prefix + t(e.m) + ' '
  }
  return result.trim()
}

function sumMeasurements(params, measies) {
  let result = 0
  for (const e of params) {
    if (!measies[e.m]) {
      return false
    }
    result += e.coefficient * measies[e.m]
  }
  return result
}

function formatWarningMessage(constraint, lhsSum, rhsSum, imperial) {
  let leftConstraint = formatSum(constraint.lhs)
  let rightConstraint = formatSum(constraint.rhs)

  return t('shouldBeEqual', {
    lhsSum: formatMm(lhsSum, imperial),
    lhsConstraint: leftConstraint,
    rhsSum: formatMm(rhsSum, imperial),
    rhsConstraint: rightConstraint,
  })
}

function checkConstraint(constraint, warnings, measies, imperial) {
  let lhsSum = sumMeasurements(constraint.lhs, measies)
  let rhsSum = sumMeasurements(constraint.rhs, measies)
  if (lhsSum === false || rhsSum === false) {
    // Some measurements are missing
    return
  }
  const difference = Math.abs(((lhsSum - rhsSum) / (lhsSum + rhsSum)) * 2)
  if (difference > constraint.tolerance) {
    warnings.add(formatWarningMessage(constraint, lhsSum, rhsSum, imperial))
  }
}

function checkDescendingSets(warnings, measies) {
  for (const e of descendingCheck) {
    checkDescendingSet(e, warnings, measies)
  }
}
function checkConstraints(warnings, measies, imperial) {
  for (const e of constraintCheck) {
    checkConstraint(e, warnings, measies, imperial)
  }
}

export function validateMset(measies, imperial) {
  const warnings = []
  checkDescendingSets(warnings, measies)
  checkConstraints(warnings, measies, imperial)
  if (warnings.length === 0) {
    warnings.push(t('validationSuccess'))
  }
  return warnings
}
