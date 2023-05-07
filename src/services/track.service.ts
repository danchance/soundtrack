import { QueryTypes } from 'sequelize';
import albumDb from '../data_access/album.data.js';
import { SpotifyAlbum, SpotifyTrack } from '../data_access/spotify.data.js';
import trackDb from '../data_access/track.data.js';
import albumService from './album.service.js';
import { sequelize } from '../models/_index.js';

/**
 * Define types used in this file.
 */
type TopListener = {
  id: string;
  username: string;
  picture: string;
  count: number;
};

/**
 * Handles all track logic.
 */
const trackService = (() => {
  /**
   * **Should only be called to process a list of recently played tracks.**
   * Takes a list of Spotify track objects and creates a list of unknown albums to
   * add to the album table. When an album is added, all tracks on the album are
   * also added, this is done to reduce requests to the Spotify API.
   * @param tracks List of Spotify track objects.
   * @param accessToken Spotify access token.
   */
  const processRecentlyPlayedTracks = async (
    tracks: SpotifyTrack[],
    accessToken: string
  ) => {
    const unknownAlbums: SpotifyAlbum[] = [];
    for (const track of tracks) {
      // Check if the album is already in the unknownAlbums list
      if (unknownAlbums.find((album) => album.id === track.album.id)) continue;
      // Check if the track already exists in the database
      const localTrack = await trackDb.getTracks({ where: { id: track.id } });
      if (localTrack.count !== 0) continue;
      unknownAlbums.push(track.album);
    }
    await albumService.processRecentlyPlayedAlbums(unknownAlbums, accessToken);
  };

  /**
   * Returns the users with the most streams of the track.
   * @param trackId Id of the track.
   * @param limit Maximum number of users to return.
   */
  const getTopListeners = async (
    trackId: string,
    limit: number
  ): Promise<TopListener[]> => {
    const topListeners = await sequelize.query(
      `
        SELECT
          users.id,
          users.username,
          users.picture,
          COUNT(users.id) as count
        FROM
          user_track_histories
        LEFT JOIN
          users ON user_track_histories.user_id = users.id
        LEFT JOIN 
          tracks ON user_track_histories.track_id = tracks.id
        WHERE tracks.id = :track_id
        GROUP BY users.id
        ORDER BY count DESC
        LIMIT :limit;
        `,
      {
        replacements: { track_id: trackId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topListeners as TopListener[];
  };

  return { processRecentlyPlayedTracks, getTopListeners };
})();

export default trackService;
