import albumDb from '../data_access/album.data.js';
import { Track } from '../data_access/spotify.data.js';
import trackDb from '../data_access/track.data.js';
import albumService from './album.service.js';

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
  const addTracks = async (tracks: Array<Track>, accessToken: string) => {
    for (const track of tracks) {
      // Check if the track already exists in the database
      const res = await trackDb.getTracks({ where: { id: track.id } });
      if (res.count !== 0) continue;
      // Track does not exist, check if the album exists in the database
      const albums = await albumDb.getAlbums({ where: { id: track.album.id } });
      if (albums.count === 0) {
        // Album does not exist, call album service to add the album and all tracks
        // on the album
        await albumService.addAlbum(track.album, accessToken);
      } else {
        // Album exists, update all tracks on the album
        await albumService.addAlbumTracks(track.album, accessToken);
      }
    }
  };

  return { addTracks };
})();

export default trackService;
