import { UniqueConstraintError } from 'sequelize';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import spotifyApi, { Album, Artist } from '../data_access/spotify.data.js';
import albumService from './album.service.js';

/**
 * Handles all artist logic.
 */
const artistService = (() => {
  /**
   * Adds an artist to the Artist table along with all their albums and tracks.
   * @param artist Artist to add to the database.
   * @param accessToken Spotify access token.
   */
  const addArtist = async (artist: Artist, accessToken: string) => {
    try {
      // Add the artist
      const spotifyArtist = await spotifyApi.getArtist(accessToken, artist.id);
      await artistDb.createArtist({
        id: spotifyArtist.id,
        name: spotifyArtist.name,
        image: spotifyArtist.images![0].url
      });
      let spotifyAlbums;
      let page = 0;
      let pageSize = 50;
      do {
        // Add all albums
        spotifyAlbums = await spotifyApi.getArtistAlbums(
          accessToken,
          artist.id,
          ['album'],
          pageSize,
          page * 50
        );
        const albums = spotifyAlbums.items.map((album) => {
          return {
            id: album.id,
            name: album.name,
            type: album.album_type,
            trackNum: album.total_tracks,
            releaseYear: 2022,
            artwork: album.images[0].url,
            artistId: artist.id
          };
        });
        // Add all the tracks
        await albumDb.bulkCreateAlbums(albums);
        for (const album of spotifyAlbums.items) {
          await albumService.addAlbumTracks(album, accessToken);
        }
        // If there are more results, loop back to request the next page
        page++;
      } while (spotifyAlbums.total > pageSize * page);
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) {
        throw error;
      }
    }
  };

  return { addArtist };
})();

export default artistService;
