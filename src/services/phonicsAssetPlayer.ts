import { cacheDirectory, getInfoAsync, makeDirectoryAsync, downloadAsync, deleteAsync } from 'expo-file-system/build/legacy/FileSystem';
import { Audio } from 'expo-av';

const CDN_BASE_URL = 'https://raw.githubusercontent.com/702-lab/tiengviet-doc-app/main/assets/audio';
const LOCAL_AUDIO_DIR = `${cacheDirectory}audio/`;

const cleanFilename = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[.,!?;:"()“”]/g, '')
    .trim()
    .normalize('NFC');
};

async function ensureAudioDir() {
  try {
    const dirInfo = await getInfoAsync(LOCAL_AUDIO_DIR);
    if (!dirInfo.exists) {
      await makeDirectoryAsync(LOCAL_AUDIO_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to create cache audio directory:', error);
  }
}

/**
 * Resolves the relative path for a phonic asset based on type and dialect.
 */
export function getAssetRelativePath(
  text: string, 
  type: 'onset' | 'rhyme' | 'combined_no_tone' | 'tone' | 'final', 
  dialect: 'north' | 'south' | 'central'
): string {
  const clean = cleanFilename(text);
  
  switch (type) {
    case 'onset':
      return `${dialect}/onsets/${clean}.mp3`;
    case 'rhyme':
      return `common/rhymes/${clean}.mp3`;
    case 'tone':
      return `common/tones/${clean}.mp3`;
    case 'combined_no_tone':
    case 'final':
    default:
      return `common/words/${clean}.mp3`;
  }
}

/**
 * Attempts to play a custom pre-recorded phonic asset.
 * If the asset does not exist in local cache, it downloads it from the CDN.
 * Returns true if played successfully, or false if it failed (so we fallback to TTS).
 */
export async function playPhonicAssetAsync(
  text: string,
  type: 'onset' | 'rhyme' | 'combined_no_tone' | 'tone' | 'final',
  dialect: 'north' | 'south' | 'central'
): Promise<boolean> {
  const relativePath = getAssetRelativePath(text, type, dialect);
  const remoteUrl = `${CDN_BASE_URL}/${relativePath}`;
  
  const localFileName = relativePath.replace(/\//g, '_');
  const localFileUri = `${LOCAL_AUDIO_DIR}${localFileName}`;

  try {
    await ensureAudioDir();

    const fileInfo = await getInfoAsync(localFileUri);
    
    // Download if not already cached
    if (!fileInfo.exists) {
      const downloadResult = await downloadAsync(remoteUrl, localFileUri);
      
      // Basic check for empty or invalid download responses (like a 404 HTML body instead of mp3 file)
      if (!downloadResult.headers || downloadResult.status !== 200) {
        // Delete invalid file to prevent broken caching
        await deleteAsync(localFileUri, { idempotent: true });
        return false;
      }
    }

    // Play the cached audio file
    const { sound } = await Audio.Sound.createAsync(
      { uri: localFileUri },
      { shouldPlay: true }
    );

    return new Promise<boolean>((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            sound.unloadAsync();
            resolve(true);
          }
        } else if (status.error) {
          sound.unloadAsync();
          resolve(false);
        }
      });
    });
  } catch (error) {
    try {
      await deleteAsync(localFileUri, { idempotent: true });
    } catch {}
    return false;
  }
}
