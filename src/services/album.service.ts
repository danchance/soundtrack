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
    // Check if the album already exists in the database
    // const albums = await albumDb.getAlbums({ where: { id: album.id } });
    // if (albums.count !== 0) return;
    // Check if artist exists before adding the album
    const artists = await artistDb.getArtists({
      where: { id: album.artists[0].id }
    });
    if (artists.count === 0) {
      // Artist does not exist, call artist service to add the artist, their albums,
      // and their tracks
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
        // If the album already exists, ignore the error
        if (!(error instanceof UniqueConstraintError)) throw error;
      }
    }
  };

  const addAlbumTracks = async (album: Album, accessToken: string) => {
    const albumTracks = await spotifyApi.getAlbumTracks(
      accessToken,
      album.id,
      50
    );
    // TODO: change to bulk create
    for (const track of albumTracks.items) {
      try {
        await trackDb.createTrack({
          id: track.id,
          name: track.name,
          duration: track.duration_ms,
          albumId: album.id
        });
      } catch (error) {
        if (!(error instanceof UniqueConstraintError)) throw error;
      }
    }
  };

  return { addAlbum, addAlbumTracks };
})();

/**
 * export interface IAlbum {
  id: string;
  name: string;
  type: AlbumType;
  trackNum: number;
  releaseYear: number;
  artwork: string;
}
 */

export default albumService;
