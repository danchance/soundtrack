import { FindAndCountOptions } from 'sequelize';
import { ITrack } from '../models/track.model.js';
import { models } from '../models/_index.js';
import { RecordNotFoundError } from './errors.js';

/**
 * Database functions used to manage all operations on Track records.
 */
const trackDb = (() => {
  /**
   * Adds a new Track record to the Track table. Note: adding tracks should be done
   * using the addTracks function in the trackService to ensure foreign key contraints
   * are not violated (album and artist exist).
   * @param track The track to create.
   * @returns The new track record.
   */
  const createTrack = async (track: ITrack): Promise<ITrack> => {
    return (await models.track.create(track)).toJSON();
  };

  /**
   * Adds multiple Track records to the Track table. Note: adding tracks should be done
   * using the addTracks function in the trackService to ensure foreign key contraints
   * are not violated (album and artist exist).
   * @param tracks Array of tracks to create.
   * @returns
   */
  const bulkCreateTracks = async (tracks: Array<ITrack>) => {
    return await models.track.bulkCreate(tracks, {
      validate: true,
      ignoreDuplicates: true
    });
  };

  /**
   * Retrieves a track record by Id.
   * @param trackId Id of the track to retrieve.
   * @returns The requested track record.
   * @throws RecordNotFoundError if no track with the given Id exists.
   */
  const getTrackById = async (trackId: string): Promise<ITrack> => {
    const track = await models.track.findByPk(trackId);
    if (track === null) {
      throw new RecordNotFoundError(
        'Track',
        `Track with ID ${trackId} not found.`
      );
    }
    return track.toJSON();
  };

  /**
   * Retrieves track records for the query and the number of records that
   * match the query.
   * @param query Search query to execute.
   * @returns The requested track records and record count.
   */
  const getTracks = async (
    query: FindAndCountOptions<ITrack>
  ): Promise<{ count: number; rows: Array<ITrack> }> => {
    const tracks = (await models.track.findAndCountAll({
      ...query,
      raw: true,
      nest: true
    })) as any;
    return tracks;
  };

  /**
   * Updates a track record in the Track table.
   * @param trackId The Id of the track to update.
   * @param updates The fields to update.
   * @returns The updated track record.
   * @throws RecordNotFoundError if no track with the given Id exists.
   */
  const updateTrack = async (
    trackId: string,
    updates: Partial<ITrack>
  ): Promise<ITrack> => {
    const track = await models.track.findByPk(trackId);
    if (track === null) {
      throw new RecordNotFoundError(
        'Track',
        `Track with ID ${trackId} not found.`
      );
    }
    return (await track.update(updates)).toJSON();
  };

  /**
   * Deletes a track record from the Track table.
   * @param trackId The Id of the track to delete.
   * @throws RecordNotFoundError if no track with the given Id exists.
   */
  const deleteTrack = async (trackId: string) => {
    const track = await models.track.findByPk(trackId);
    if (track === null) {
      throw new RecordNotFoundError(
        'Track',
        `Track with ID ${trackId} not found.`
      );
    }
    await track.destroy();
  };

  return {
    createTrack,
    bulkCreateTracks,
    getTrackById,
    getTracks,
    updateTrack,
    deleteTrack
  };
})();

export default trackDb;
