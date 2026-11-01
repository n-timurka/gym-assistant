// tests/unit/helpers/capacitor.helper.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import {
  getCachedImageSrc,
  getCacheSize,
  clearExerciseCache,
} from '../../../src/helpers/capacitor.helper';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    convertFileSrc: vi.fn((uri) => uri),
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Filesystem: {
    stat: vi.fn(),
    getUri: vi.fn(),
    readFile: vi.fn(),
    readdir: vi.fn(),
    rmdir: vi.fn(),
  },
}));

describe('capacitor.helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCachedImageSrc', () => {
    it('returns null when the file does not exist in cache', async () => {
      vi.mocked(Filesystem.stat).mockRejectedValueOnce(new Error('File does not exist'));

      const result = await getCachedImageSrc('missing.png');
      expect(result).toBeNull();
    });

    it('returns converted uri when native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.stat).mockResolvedValueOnce({} as any);
      vi.mocked(Filesystem.getUri).mockResolvedValueOnce({ uri: 'file:///path/to/img.png' });
      vi.mocked(Capacitor.convertFileSrc).mockReturnValue('http://localhost/_capacitor_file_/path/to/img.png');

      const result = await getCachedImageSrc('bench-press.png');
      expect(result).toBe('http://localhost/_capacitor_file_/path/to/img.png');
    });
  });

  describe('getCacheSize', () => {
    it('calculates total size in MB across cached files', async () => {
      vi.mocked(Filesystem.readdir).mockResolvedValueOnce({
        files: [
          { name: 'img1.png', type: 'file', size: 1048576, mtime: 0, uri: '' },
          { name: 'img2.png', type: 'file', size: 2097152, mtime: 0, uri: '' },
        ],
      });
      vi.mocked(Filesystem.stat).mockResolvedValueOnce({ size: 1048576 } as any);
      vi.mocked(Filesystem.stat).mockResolvedValueOnce({ size: 2097152 } as any);

      const sizeMB = await getCacheSize();
      expect(sizeMB).toBe(3); // (1MB + 2MB)
    });
  });

  describe('clearExerciseCache', () => {
    it('invokes Filesystem.rmdir with recursive flag', async () => {
      await clearExerciseCache();
      expect(Filesystem.rmdir).toHaveBeenCalledWith({
        path: 'exercise-images',
        directory: Directory.Cache,
        recursive: true,
      });
    });
  });
});