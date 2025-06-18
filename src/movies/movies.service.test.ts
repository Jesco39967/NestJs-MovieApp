import { describe, it, expect, beforeEach } from 'vitest';
import { MoviesService } from './movies.service';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MoviesService', () => {
  let service: MoviesService;
  let mockMovieRepository: Partial<Repository<Movie>>;

  beforeEach(() => {
    mockMovieRepository = {
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = new MoviesService(mockMovieRepository as any);
  });

  // Error Handling Tests

  describe('createMovie', () => {
    it('should throw BadRequestException for invalid movie data', async () => {
      await expect(service.createMovie({
        title: '', // Empty title
        year: -1, // Invalid year
        genres: []
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMovieById', () => {
    it('should throw NotFoundException for non-existent movie', async () => {
      mockMovieRepository.findOne = vi.fn().mockResolvedValue(null);
      
      await expect(service.getMovieById('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMovie', () => {
    it('should throw NotFoundException when updating non-existent movie', async () => {
      mockMovieRepository.findOne = vi.fn().mockResolvedValue(null);
      
      await expect(service.updateMovie('non-existent-id', {}))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid update data', async () => {
      mockMovieRepository.findOne = vi.fn().mockResolvedValue({} as Movie);
      
      await expect(service.updateMovie('existing-id', {
        year: -1 // Invalid year
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteMovie', () => {
    it('should throw NotFoundException when deleting non-existent movie', async () => {
      mockMovieRepository.findOne = vi.fn().mockResolvedValue(null);
      
      await expect(service.deleteMovie('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // Edge Case Tests

  describe('searchMovies', () => {
    it('should handle empty search results gracefully', async () => {
      mockMovieRepository.find = vi.fn().mockResolvedValue([]);
      
      const results = await service.searchMovies('non-existent-movie');
      expect(results).toEqual([]);
    });
  });

  describe('Movie Validation', () => {
    it('should validate movie title length', async () => {
      await expect(service.createMovie({
        title: 'a', // Too short title
        year: 2023,
        genres: ['Action']
      })).rejects.toThrow(BadRequestException);
    });

    it('should validate movie year range', async () => {
      await expect(service.createMovie({
        title: 'Valid Movie',
        year: 2300, // Future year
        genres: ['Sci-Fi']
      })).rejects.toThrow(BadRequestException);
    });
  });
});