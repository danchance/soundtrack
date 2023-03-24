import { UniqueConstraintError } from 'sequelize';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import { RateLimitError } from '../data_access/errors.js';
import spotifyApi, { Album } from '../data_access/spotify.data.js';
import trackDb from '../data_access/track.data.js';
import artistService from './artist.service.js';

/**
 * Handles all album logic.
 */
const albumService = (() => {
  /**
   * Adds an album to the Album table.
   * If the artist does not exist, it will add the artist, all albums and tracks,
   * otherwise it will add the album and its tracks.
   * @param album The album to add to the database.
   * @param accessToken Spotify access token.
   */
  const addAlbum = async (album: Album, accessToken: string) => {
    const spotifyArtist = await artistDb.getArtists({
      where: { id: album.artists[0].id }
    });
    if (spotifyArtist.count === 0) {
      // Artist does not exist, add the artist, all albums and tracks
      await artistService.addArtist(album.artists[0], accessToken);
      // addArtist does not add compilations or singles, so check if the album is a compilation or single.
      if (album.album_type !== 'compilation' && album.album_type !== 'single') {
        return;
      }
    }
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
  };

  /**
   * Add all tracks on an album to the Track table.
   * @param album Album to add tracks to the database.
   * @param accessToken Spotify access token.
   */
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
      // If there are more results, loop back to request the next page.
      page++;
    } while (spotifyTracks.total > pageSize * page);
  };

  return { addAlbum, addAlbumTracks };
})();

export default albumService;
