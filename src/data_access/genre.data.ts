import { FindAndCountOptions } from 'sequelize';
import { IGenre } from '../models/genre.model.js';
import { models } from '../models/_index.js';
import { RecordNotFoundError } from './errors.js';

/**
 * Database functions used to manage all operations on Genre records.
 */
const genreDb = (() => {
  /**
   * Adds a new Genre record to the Genre table.
   * @param genre The genre to create.
   * @returns The new genre record.
   */
  const createGenre = async (genre: IGenre): Promise<IGenre> => {
    return (await models.genre.create(genre)).toJSON();
  };

  /**
   * Adds multiple Genre records to the Genre table.
   * @param genres Array of genres to create.
   * @returns
   */
  const bulkCreateGenres = async (genres: Array<IGenre>) => {
    return await models.genre.bulkCreate(genres, {
      validate: true
    });
  };

  /**
   * Retrieves a Genre record by Id.
   * @param genreId Id of the genre to retrieve.
   * @returns The requested genre record.
   * @throws RecordNotFoundError if no genre with the given Id exists.
   */
  const getGenreById = async (genreId: string): Promise<IGenre> => {
    const genre = await models.genre.findByPk(genreId);
    if (genre === null) {
      throw new RecordNotFoundError(
        'Genre',
        `Genre with ID ${genreId} not found.`
      );
    }
    return genre.toJSON();
  };

  /**
   * Retrieves genre records for the query and the number of records that
   * match the query.
   * @param genre Search query to execute.
   * @returns The requested genre records and record count.
   * @throws RecordNotFoundError if no genre records exist.
   */
  const getGenres = async (
    query: FindAndCountOptions<IGenre>
  ): Promise<{ count: number; rows: Array<IGenre> }> => {
    const genres = (await models.genre.findAndCountAll({
      ...query,
      raw: true
    })) as any;
    if (genres === null) {
      throw new RecordNotFoundError(
        'Genre',
        `No Genre for query: ${query}  found`
      );
    }
    return genres;
  };

  /**
   * Updates a genre record in the Genre table.
   * @param genreId The Id of the genre to update.
   * @param updates The fields to update.
   * @returns The updated genre record.
   * @throws RecordNotFoundError if no genre with the given Id exists.
   */
  const updateGenre = async (
    genreId: string,
    updates: Partial<IGenre>
  ): Promise<IGenre> => {
    const genre = await models.genre.findByPk(genreId);
    if (genre === null) {
      throw new RecordNotFoundError(
        'Genre',
        `Genre with ID ${genreId} not found.`
      );
    }
    return (await genre.update(updates)).toJSON();
  };

  /**
   * Deletes a genre record from the Genre table.
   * @param genreId The Id of the genre to delete.
   * @throws RecordNotFoundError if no genre with the given Id exists.
   */
  const deleteGenre = async (genreId: string) => {
    const genre = await models.genre.findByPk(genreId);
    if (genre === null) {
      throw new RecordNotFoundError(
        'Genre',
        `Genre with ID ${genreId} not found.`
      );
    }
    await genre.destroy();
  };

  return {
    createGenre,
    bulkCreateGenres,
    getGenreById,
    getGenres,
    updateGenre,
    deleteGenre
  };
})();

export default genreDb;
