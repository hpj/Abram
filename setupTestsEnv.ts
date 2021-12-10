import 'jest-date-mock';
import 'jest-extended/all';

import { toMatchDiffSnapshot, getSnapshotDiffSerializer } from 'snapshot-diff';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
__TEST__ = true;

expect.extend({
  toMatchDiffSnapshot
});

expect.addSnapshotSerializer(getSnapshotDiffSerializer());