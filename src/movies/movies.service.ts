import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {}

  async createMovie(createMovieDto: Partial<Movie>): Promise<Movie> {
    // Validate movie data
    if (!createMovieDto.title || createMovieDto.title.length < 2) {
      throw new BadRequestException('Movie title must be at least 2 characters long');
    }

    if (createMovieDto.year < 1900 || createMovieDto.year > 2250) {
      throw new BadRequestException('Invalid movie year');
    }

    const movie = this.moviesRepository.create(createMovieDto);
    return this.moviesRepository.save(movie);
  }

  async getMovieById(id: string): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async updateMovie(id: string, updateMovieDto: Partial<Movie>): Promise<Movie> {
    // First, check if movie exists
    const existingMovie = await this.getMovieById(id);

    // Validate update data
    if (updateMovieDto.year && (updateMovieDto.year < 1900 || updateMovieDto.year > 2250)) {
      throw new BadRequestException('Invalid movie year');
    }

    await this.moviesRepository.update(id, updateMovieDto);
    return this.getMovieById(id);
  }

  async deleteMovie(id: string): Promise<void> {
    // First, check if movie exists
    await this.getMovieById(id);
    
    await this.moviesRepository.delete(id);
  }

  async searchMovies(query: string): Promise<Movie[]> {
    return this.moviesRepository.find({
      where: {
        title: query // Implement more sophisticated search if needed
      }
    });
  }
}