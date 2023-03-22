import { UniqueConstraintError } from 'sequelize';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import spotifyApi, { Album } from '../data_access/spotify.data.js';
import trackDb from '../data_access/track.data.js';
import artistService from './artist.service.js';

/**
 * Hanldes all album logic.
 */
const albumService = (() => {
  /**
   * Adds an album to the Album table.
   * If the album already exists in the database, the tracks on the album will
   * be updated.
   * If the album does not exist in the database, it will be added along with
   * all the tracks on the album.
   * @param album The album to add to the database.
   * @param accessToken Spotify access token.
   */
  /**
   * TODO: update comments
   */
  const addAlbum = async (album: Album, accessToken: string) => {
    // Check if artist exists before adding the album
    const artists = await artistDb.getArtists({
      where: { id: album.artists[0].id }
    });
    if (artists.count === 0) {
      // Artist does not exist, add the artist, all albums and tracks
      await artistService.addArtist(album.artists[0], accessToken);
    } else {
      // Artist exists, add the album and its tracks
      try {
        await albumDb.createAlbum({
          id: album.id,
          name: album.name,
          type: album.album_type,
          trackNum: album.total_tracks,
          releaseYear: 2022,
          artwork: album.images[0].url,
          artistId: album.artists[0].id
        });
        await addAlbumTracks(album, accessToken);
      } catch (error) {
        if (!(error instanceof UniqueConstraintError)) {
          throw error;
        }
      }
    }
  };

  const addAlbumTracks = async (album: Album, accessToken: string) => {
    let spotifyTracks;
    let page = 0;
    let pageSize = 50;
    do {
      spotifyTracks = await spotifyApi.getAlbumTracks(
        accessToken,
        album.id,
        pageSize,
        page * 50
      );
      const tracks = spotifyTracks.items.map((track) => {
        return {
          id: track.id,
          name: track.name,
          duration: track.duration_ms,
          albumId: album.id
        };
      });
      await trackDb.bulkCreateTracks(tracks);
      page++;
      // If there are more results, loop back to request the next page
    } while (spotifyTracks.total > pageSize * page);
  };

  return { addAlbum, addAlbumTracks };
})();

export default albumService;
