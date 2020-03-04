/* eslint-disable jest/no-mocks-import */

import snapshotDiff from 'snapshot-diff';

expect.addSnapshotSerializer(snapshotDiff.getSnapshotDiffSerializer());

// mock the back button handler module
jest.mock('react-native/Libraries/Utilities/BackHandler', () =>
  require('./node_modules/react-native/Libraries/Utilities/__mocks__/BackHandler'));