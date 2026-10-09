import { SAMPLE_POSTERS } from '../lib/sample-data';
import assert from 'node:assert';
import test from 'node:test';

test('SAMPLE_POSTERS catalog contains valid realistic fixtures', () => {
  assert(SAMPLE_POSTERS.length >= 3, 'Must have at least 3 campus sample fixtures');

  for (const sample of SAMPLE_POSTERS) {
    assert(sample.id, 'Sample must have an id');
    assert(sample.title, 'Sample must have a title');
    assert(sample.cachedResult, 'Sample must have a cachedResult');
    assert(sample.cachedResult.headlineSummary, 'Summary must be non-empty');
    assert(sample.cachedResult.eventDetails, 'Event details object must exist');
    assert(Array.isArray(sample.cachedResult.actionItems), 'actionItems must be an array');
    assert(Array.isArray(sample.cachedResult.uncertainties), 'uncertainties must be an array');
    assert(sample.cachedResult.modelUsed.includes('gemma'), 'Must explicitly attribute Gemma model');
  }
});

test('Uncertainty detection flags are non-empty and well-formed', () => {
  const symposiumSample = SAMPLE_POSTERS.find((s) => s.id === 'sample-tech-symposium');
  assert(symposiumSample, 'Tech symposium fixture must exist');
  assert(symposiumSample.cachedResult.uncertainties.length > 0, 'Must have at least 1 uncertainty note');
  const unc = symposiumSample.cachedResult.uncertainties[0];
  assert(['blurry', 'cropped', 'absent', 'ambiguous'].includes(unc.reason), 'Reason must be one of the enum values');
  assert(unc.observation.length > 10, 'Observation explanation must be detailed');
});
