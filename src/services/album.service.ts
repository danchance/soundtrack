import { QueryTypes, UniqueConstraintError } from 'sequelize';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import spotifyApi, { SpotifyAlbum } from '../data_access/spotify.data.js';
import trackDb from '../data_access/track.data.js';
import artistService from './artist.service.js';
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

type AlbumTrack = {
  id: string;
  trackName: string;
  duration: number;
  count: number;
}[];

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
  const addAlbum = async (album: SpotifyAlbum, accessToken: string) => {
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
  const addAlbumTracks = async (album: SpotifyAlbum, accessToken: string) => {
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

  /**
   * Returns all tracks on an album along with the stream count for each
   * track.
   * @param albumId Id of the album.
   */
  const getAlbumTracks = async (albumId: string): Promise<AlbumTrack[]> => {
    const albumTracks = await sequelize.query(
      `
      SELECT
        tracks.id,
        tracks.name as trackName,
        tracks.duration,
        COUNT(user_track_histories.id) as count
      FROM
        albums
      LEFT JOIN
        tracks ON albums.id = tracks.album_id
      LEFT JOIN
        user_track_histories ON tracks.id = user_track_histories.track_id
      WHERE albums.id = :album_id
      GROUP BY tracks.id
      ORDER BY count DESC
      `,
      {
        replacements: { album_id: albumId },
        type: QueryTypes.SELECT
      }
    );
    return albumTracks as AlbumTrack[];
  };

  /**
   * Returns the users with the most streams of the tracks in the album.
   * @param albumId Id of the album.
   * @param limit Maximum number of top listeners to return.
   */
  const getTopListeners = async (
    albumId: string,
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
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      WHERE albums.id = :album_id
      GROUP BY users.id
      ORDER BY count DESC
      `,
      {
        replacements: { album_id: albumId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topListeners as TopListener[];
  };

  return { addAlbum, addAlbumTracks, getAlbumTracks, getTopListeners };
})();

export default albumService;
