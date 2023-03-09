import { FindAndCountOptions } from 'sequelize';
import { IArtist } from '../models/artist.model.js';
import { models } from '../models/_index.js';
import { RecordNotFoundError } from './errors.js';

/**
 * Database functions used to manage all operations on Artist records.
 */
const artistDb = (() => {
  /**
   * Adds a new Artist record to the Artist table.
   * @param artist The artist to create.
   * @returns The new artist record.
   */
  const createArtist = async (artist: IArtist): Promise<IArtist> => {
    return (await models.artist.create(artist)).toJSON();
  };

  /**
   * Adds multiple Artist records to the Artist table.
   * @param artists Array of albums to create.
   * @returns
   */
  const bulkCreateArtists = async (artists: Array<IArtist>) => {
    return await models.artist.bulkCreate(artists, {
      validate: true
    });
  };

  /**
   * Retrieves a Artist record by Id.
   * @param artistId Id of the artist to retrieve.
   * @returns The requested artist record.
   * @throws RecordNotFoundError if no album with the given Id exists.
   */
  const getArtistById = async (artistId: string): Promise<IArtist> => {
    const artist = await models.artist.findByPk(artistId);
    if (artist === null) {
      throw new RecordNotFoundError(
        'Artist',
        `Artist with ID ${artistId} not found.`
      );
    }
    return artist.toJSON();
  };

  /**
   * Retrieves artist records for the query and the number of records that
   * match the query.
   * @param query Search query to execute.
   * @returns The requested artist records and record count.
   * @throws RecordNotFoundError if no artist records exist.
   */
  const getArtists = async (query: FindAndCountOptions<IArtist>) => {
    const artists = await models.artist.findAndCountAll(query);
    if (artists === null) {
      throw new RecordNotFoundError(
        'Artist',
        `No Artist for query: ${query}  found`
      );
    }
    return artists;
  };

  /**
   * Updates a artist record in the Artist table.
   * @param artistId The Id of the artist to update.
   * @param updates The fields to update.
   * @returns The updated artist record.
   * @throws RecordNotFoundError if no artist with the given Id exists.
   */
  const updateArtist = async (
    artistId: string,
    updates: Partial<IArtist>
  ): Promise<IArtist> => {
    const artist = await models.artist.findByPk(artistId);
    if (artist === null) {
      throw new RecordNotFoundError(
        'Artist',
        `Artist with ID ${artistId} not found.`
      );
    }
    return (await artist.update(updates)).toJSON();
  };

  /**
   * Deletes a artist record from the Artist table.
   * @param artistId The Id of the artist to delete.
   * @throws RecordNotFoundError if no artist with the given Id exists.
   */
  const deleteArtist = async (artistId: string) => {
    const artist = await models.artist.findByPk(artistId);
    if (artist === null) {
      throw new RecordNotFoundError(
        'Artist',
        `Artist with ID ${artistId} not found.`
      );
    }
    await artist.destroy();
  };

  return {
    createArtist,
    bulkCreateArtists,
    getArtistById,
    getArtists,
    updateArtist,
    deleteArtist
  };
})();

export default artistDb;
