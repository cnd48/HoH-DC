import { AssessmentState, INITIAL_ASSESSMENT_STATE } from '../types';

const STORAGE_KEY = 'host_or_hold_dc_answers_v1';

export function loadAssessmentState(): AssessmentState {
  if (typeof window === 'undefined') {
    return INITIAL_ASSESSMENT_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_ASSESSMENT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_ASSESSMENT_STATE,
      ...parsed,
      user: {
        ...INITIAL_ASSESSMENT_STATE.user,
        ...(parsed.user || {})
      },
      step1: {
        ...INITIAL_ASSESSMENT_STATE.step1,
        ...(parsed.step1 || {})
      },
      step2: {
        ...INITIAL_ASSESSMENT_STATE.step2,
        ...(parsed.step2 || {}),
        householdLiving: {
          ...INITIAL_ASSESSMENT_STATE.step2.householdLiving,
          ...((parsed.step2 && parsed.step2.householdLiving) || {})
        }
      },
      step3: {
        ...INITIAL_ASSESSMENT_STATE.step3,
        ...(parsed.step3 || {})
      },
      step4: {
        ...INITIAL_ASSESSMENT_STATE.step4,
        ...(parsed.step4 || {})
      }
    };
  } catch (e) {
    console.warn('Failed to load assessment state from localStorage', e);
    return INITIAL_ASSESSMENT_STATE;
  }
}

export function saveAssessmentState(state: AssessmentState): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save assessment state to localStorage', e);
  }
}

export function resetAssessmentState(): AssessmentState {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  }
  return INITIAL_ASSESSMENT_STATE;
}
