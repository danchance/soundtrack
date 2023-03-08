import { FindAndCountOptions } from 'sequelize';
import { IAlbum } from '../models/album.model.js';
import { models } from '../models/_index.js';
import { RecordNotFoundError } from './errors.js';

/**
 * Database functions used to manage all operations on Album records.
 */
const albumDb = (() => {
  /**
   * Adds a new Album record to the Album table.
   * @param album The album to create.
   * @returns The new album record.
   */
  const createAlbum = async (album: IAlbum): Promise<IAlbum> => {
    return (await models.album.create(album)).toJSON();
  };

  /**
   * Adds multiple Album records to the Album table.
   * @param albums Array of albums to create.
   * @returns
   */
  const bulkCreateAlbums = async (albums: Array<IAlbum>) => {
    return await models.album.bulkCreate(albums, {
      validate: true
    });
  };

  /**
   * Retrieves a album record by Id.
   * @param albumId Id of the album to retrieve.
   * @returns The requested album record.
   * @throws RecordNotFoundError if no album with the given Id exists.
   */
  const getAlbumById = async (albumId: string): Promise<IAlbum> => {
    const album = await models.album.findByPk(albumId);
    if (album === null) {
      throw new RecordNotFoundError(
        'Album',
        `Album with ID ${albumId} not found.`
      );
    }
    return album.toJSON();
  };

  /**
   * Retrieves album records for the query and the number of records that
   * match the query.
   * @param query Search query to execute.
   * @returns The requested album records and record count.
   * @throws RecordNotFoundError if no album records exist.
   */
  const getAlbums = async (query: FindAndCountOptions<IAlbum>) => {
    const albums = await models.album.findAndCountAll(query);
    if (albums === null) {
      throw new RecordNotFoundError(
        'Album',
        `No albums for query: ${query}  found`
      );
    }
    return albums;
  };

  /**
   * Updates a album record in the Album table.
   * @param albumId The Id of the album to update.
   * @param updates The fields to update.
   * @returns The updated album record.
   * @throws RecordNotFoundError if no album with the given Id exists.
   */
  const updateAlbum = async (
    albumId: string,
    updates: Partial<IAlbum>
  ): Promise<IAlbum> => {
    const album = await models.album.findByPk(albumId);
    if (album === null) {
      throw new RecordNotFoundError(
        'Album',
        `Album with ID ${albumId} not found.`
      );
    }
    return (await album.update(updates)).toJSON();
  };

  /**
   * Deletes a album record from the Album table.
   * @param albumId The Id of the album to delete.
   * @throws RecordNotFoundError if no album with the given Id exists.
   */
  const deleteAlbum = async (albumId: string) => {
    const album = await models.album.findByPk(albumId);
    if (album === null) {
      throw new RecordNotFoundError(
        'Album',
        `Album with ID ${albumId} not found.`
      );
    }
    await album.destroy();
  };

  return {
    createAlbum,
    bulkCreateAlbums,
    getAlbumById,
    getAlbums,
    updateAlbum,
    deleteAlbum
  };
})();

export default albumDb;
