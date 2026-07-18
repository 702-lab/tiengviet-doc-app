import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getAssetRelativePath, playPhonicAssetAsync } from './phonicsAssetPlayer';
import * as FileSystem from 'expo-file-system/src/legacy/FileSystem';
import { Audio } from 'expo-av';

// Mock the exact legacy file path that the service imports from source
vi.mock('expo-file-system/src/legacy/FileSystem', () => {
  return {
    cacheDirectory: 'mock-cache://',
    getInfoAsync: vi.fn(async (uri: string) => {
      if (uri.includes('already-cached') || uri.includes('exists')) {
        return { exists: true, uri };
      }
      return { exists: false, uri };
    }),
    makeDirectoryAsync: vi.fn(),
    downloadAsync: vi.fn(async (url: string, uri: string) => {
      if (url.includes('invalid') || url.includes('404')) {
        return { status: 404, headers: {} };
      }
      return { status: 200, headers: { 'content-type': 'audio/mpeg' }, uri };
    }),
    deleteAsync: vi.fn(),
  };
});

// Mock expo-av
vi.mock('expo-av', () => {
  return {
    Audio: {
      Sound: {
        createAsync: vi.fn(async (source: any) => {
          if (source.uri && source.uri.includes('broken')) {
            throw new Error('Playback failed');
          }
          return {
            sound: {
              setOnPlaybackStatusUpdate: vi.fn((callback) => {
                // Instantly trigger success callback
                setTimeout(() => {
                  callback({ isLoaded: true, didJustFinish: true });
                }, 5);
              }),
              unloadAsync: vi.fn(),
            },
          };
        }),
      },
    },
  };
});

describe('Phonics Asset Player Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly resolve relative paths under regional dialect folders', () => {
    // 1. Onsets
    expect(getAssetRelativePath('b', 'onset', 'north')).toBe('north/onsets/b.mp3');
    expect(getAssetRelativePath('v', 'onset', 'south')).toBe('south/onsets/v.mp3');
    expect(getAssetRelativePath('r', 'onset', 'central')).toBe('central/onsets/r.mp3');

    // 2. Rhymes
    expect(getAssetRelativePath('oang', 'rhyme', 'north')).toBe('north/rhymes/oang.mp3');
    expect(getAssetRelativePath('oang', 'rhyme', 'south')).toBe('south/rhymes/oang.mp3');

    // 3. Tones
    expect(getAssetRelativePath('huyền', 'tone', 'north')).toBe('north/tones/huyen.mp3');
    expect(getAssetRelativePath('ngã', 'tone', 'south')).toBe('south/tones/nga.mp3');
    expect(getAssetRelativePath('hỏi', 'tone', 'central')).toBe('central/tones/hoi.mp3');

    // 4. Combined / Words
    expect(getAssetRelativePath('bàn', 'final', 'north')).toBe('north/words/ban.mp3');
    expect(getAssetRelativePath('bàn', 'final', 'south')).toBe('south/words/ban.mp3');
  });

  it('should play cached file directly if it already exists locally', async () => {
    const played = await playPhonicAssetAsync('already-cached', 'onset', 'north');
    
    expect(played).toBe(true);
    expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
  });

  it('should download and play file if it does not exist locally', async () => {
    const played = await playPhonicAssetAsync('new-phonic', 'onset', 'north');
    
    expect(played).toBe(true);
    expect(FileSystem.downloadAsync).toHaveBeenCalled();
    expect(Audio.Sound.createAsync).toHaveBeenCalled();
  });

  it('should return false and delete temp cache file if download fails with 404', async () => {
    const played = await playPhonicAssetAsync('404-word', 'onset', 'north');
    
    expect(played).toBe(false);
    expect(FileSystem.deleteAsync).toHaveBeenCalled();
    expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
  });

  it('should return false and fallback if audio playback throws an error', async () => {
    const played = await playPhonicAssetAsync('broken-audio', 'onset', 'north');
    
    expect(played).toBe(false);
    expect(FileSystem.deleteAsync).toHaveBeenCalled();
  });
});
