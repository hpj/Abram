import snapshotDiff from 'snapshot-diff';

expect.addSnapshotSerializer(snapshotDiff.getSnapshotDiffSerializer());