/* eslint-disable @typescript-eslint/no-explicit-any */
import { pronoun, relativeDate, sharedInterests } from '../src/utils';

jest.mock('axios', () => ({
  get: jest.fn()
}));

describe('Testing Utils', () =>
{
  describe('Pronouns', () =>
  {
    test('Non-binary', () =>
    {
      expect(pronoun('Non-binary')).toEqual({
        they: 'they',
        them: 'them',
        themselves: 'themselves',
        their: 'their',
        theirs: 'theirs',
        are: 'are'
      });
    });

    test('Woman', () =>
    {
      expect(pronoun('Woman')).toEqual({
        they: 'she',
        them: 'her',
        themselves: 'herself',
        their: 'her',
        theirs: 'hers',
        are: 'is'
      });
    });

    test('Man', () =>
    {
      expect(pronoun('Man')).toEqual({
        they: 'he',
        them: 'him',
        themselves: 'himself',
        their: 'his',
        theirs: 'his',
        are: 'is'
      });
    });
  });

  describe('Shared Interests', () =>
  {
    test('2 Profiles', () =>
    {
      expect(sharedInterests({
        interests: [ 'A', 'B', 'C' ]
      } as any, {
        interests: [ 'A', 'B', 'C', 'D' ]
      } as any))
        .toEqual({
          shared: [ 'A', 'B', 'C' ],
          mismatched: [ 'D' ]
        });
    });

    test('3 or More Profiles', () =>
    {
      expect(sharedInterests({
        interests: [ 'A', 'B', 'C' ]
      } as any, {
        interests: [ 'A', 'B', 'C', 'D' ]
      } as any, {
        interests: [ 'C', 'D' ]
      } as any))
        .toEqual({
          shared: [ 'C' ],
          mismatched: []
        });
    });
  });
});