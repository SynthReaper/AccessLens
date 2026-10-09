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
    assert(Array.isArray(sample.cachedResult.hotspots), 'hotspots must be an array');
    assert(sample.cachedResult.modelUsed.includes('gemma'), 'Must explicitly attribute Gemma model');
  }
});

test('Spatial 2D Box coordinates are normalized 0-1000 and well-formed', () => {
  for (const sample of SAMPLE_POSTERS) {
    assert(sample.cachedResult.hotspots.length > 0, `Sample ${sample.id} must have hotspots`);
    for (const hs of sample.cachedResult.hotspots) {
      assert(hs.id, 'Hotspot must have an id');
      assert(hs.label, 'Hotspot must have a label');
      assert(Array.isArray(hs.box2d) && hs.box2d.length === 4, 'Hotspot box2d must be a 4-tuple [ymin, xmin, ymax, xmax]');
      const [ymin, xmin, ymax, xmax] = hs.box2d;
      assert(ymin >= 0 && ymin <= 1000, `ymin must be 0-1000, got ${ymin}`);
      assert(xmin >= 0 && xmin <= 1000, `xmin must be 0-1000, got ${xmin}`);
      assert(ymax >= ymin && ymax <= 1000, `ymax must be >= ymin and <= 1000, got ${ymax}`);
      assert(xmax >= xmin && xmax <= 1000, `xmax must be >= xmin and <= 1000, got ${xmax}`);
    }
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
