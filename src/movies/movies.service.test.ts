import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MoviesService', () => {
  let service: MoviesService;
  let mockMovieRepository: Partial<Repository<Movie>>;

  beforeEach(async () => {
    mockMovieRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
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
      mockMovieRepository.findOne.mockResolvedValue(null);
      
      await expect(service.getMovieById('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMovie', () => {
    it('should throw NotFoundException when updating non-existent movie', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);
      
      await expect(service.updateMovie('non-existent-id', {}))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid update data', async () => {
      mockMovieRepository.findOne.mockResolvedValue({} as Movie);
      
      await expect(service.updateMovie('existing-id', {
        year: -1 // Invalid year
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteMovie', () => {
    it('should throw NotFoundException when deleting non-existent movie', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);
      
      await expect(service.deleteMovie('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // Edge Case Tests

  describe('searchMovies', () => {
    it('should handle empty search results gracefully', async () => {
      mockMovieRepository.find.mockResolvedValue([]);
      
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

// Mock TypeORM's getRepositoryToken for testing
function getRepositoryToken(entity: any): string {
  return `${entity.name}Repository`;
}