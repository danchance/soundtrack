import { QueryTypes } from 'sequelize';
import albumDb from '../data_access/album.data.js';
import { SpotifyTrack } from '../data_access/spotify.data.js';
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
   * Adds a list of Spotify tracks to add to the track table. A track must reference an album
   * in the albums table, the album must reference an artist in the artist table.
   * To reduce requests to the Spotify API, when an artist is added all the artists albums and
   * tracks on the albums will be added at the same time.
   * @param tracks List of tracks to add to the track table.
   * @param accessToken Spotify access token.
   */
  const addTracks = async (
    tracks: Array<SpotifyTrack>,
    accessToken: string
  ) => {
    for (const track of tracks) {
      // Check if the track already exists in the database
      const res = await trackDb.getTracks({ where: { id: track.id } });
      if (res.count !== 0) continue;
      const albums = await albumDb.getAlbums({ where: { id: track.album.id } });
      if (albums.count === 0) {
        // Album doesn't exist, add the album and all album tracks
        await albumService.addAlbum(track.album, accessToken);
      } else {
        // Album exists, update all tracks on the album
        await albumService.addAlbumTracks(track.album, accessToken);
      }
    }
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
        replacements: { artist_id: trackId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topListeners as TopListener[];
  };

  return { addTracks, getTopListeners };
})();

export default trackService;
