export const MINIMUM_PREFERENCE_SELECTIONS = 3

interface PreferenceCandidate {
  selections: number
}

export function hasEnoughPreferenceData(candidate: PreferenceCandidate | undefined) {
  return (candidate?.selections ?? 0) >= MINIMUM_PREFERENCE_SELECTIONS
}

export function getPreferenceProgress(candidate: PreferenceCandidate | undefined) {
  return `${Math.min(candidate?.selections ?? 0, MINIMUM_PREFERENCE_SELECTIONS)}/${MINIMUM_PREFERENCE_SELECTIONS} sélections`
}
