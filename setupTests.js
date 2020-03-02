const snapshotDiff = require('snapshot-diff');

expect.addSnapshotSerializer(snapshotDiff.getSnapshotDiffSerializer());