/* eslint-disable jest/no-mocks-import */

import snapshotDiff from 'snapshot-diff';

expect.addSnapshotSerializer(snapshotDiff.getSnapshotDiffSerializer());