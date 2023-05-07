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
  artwork: string;
  count: number;
  trackSlug: string;
  albumSlug: string;
  artistSlug: string;
};

/**
 * Handles all album logic.
 */
const albumService = (() => {
  /**
   * **Should only be called to process a list of recently played albums.**
   * Takes a list of Spotify album objects and adds them to the database,
   * and handles the necessary dependencies.
   * @param albums List of Spotify album objects.
   * @param accessToken Spotify access token.
   */
  const processRecentlyPlayedAlbums = async (
    albums: SpotifyAlbum[],
    accessToken: string
  ) => {
    for (const album of albums) {
      const localAlbum = await albumDb.getAlbums({ where: { id: album.id } });
      // Album exists, update the album tracks.
      if (localAlbum.count !== 0) {
        await addAlbumTracks(album, accessToken);
        continue;
      }
      // Album does not exist, check if artist exists.
      const localArtist = await artistDb.getArtists({
        where: { id: album.artists[0].id }
      });
      // Artist does not exist, add artist first.
      // Need to fetch artist as we only have a simplified artist object.
      if (localArtist.count === 0) {
        const spotifyArtist = await spotifyApi.getArtist(
          accessToken,
          album.artists[0].id
        );
        await artistService.addArtist(spotifyArtist);
      }
      // Now add album and its tracks.
      await addAlbum(album, accessToken);
    }
    // Process any new artists that were added, do not wait for this to finish
    // as it is is not necessary and will delay the response.
    artistService.processNewArtists(accessToken);
  };

  /**
   * Add an album and its tracks to the database.
   * @param album Album to add to the database.
   * @param accessToken Spotify access token.
   */
  const addAlbum = async (album: SpotifyAlbum, accessToken: string) => {
    try {
      await albumDb.createAlbum({
        id: album.id,
        name: album.name,
        type: album.album_type,
        trackNum: album.total_tracks,
        releaseYear: album.release_date.split('-')[0] as unknown as number,
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
      const localTracks = spotifyTracks.items.map((track) => {
        return {
          id: track.id,
          name: track.name,
          duration: track.duration_ms,
          albumId: album.id
        };
      });
      await trackDb.bulkCreateTracks(localTracks);
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
        albums.artwork,
        tracks.slug as trackSlug,
        albums.slug as albumSlug,
        artists.slug as artistSlug,
        COUNT(user_track_histories.id) as count
      FROM
        albums
      LEFT JOIN
        tracks ON albums.id = tracks.album_id
      LEFT JOIN
        user_track_histories ON tracks.id = user_track_histories.track_id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
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
      LIMIT :limit;
      `,
      {
        replacements: { album_id: albumId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topListeners as TopListener[];
  };

  /**
   * Calculates the total duration of an album.
   * The duration of the album is not stored, so it must be calculated
   * using the duration of each track.
   * @param albumId Id of the album.
   * @returns The total duration of the album in milliseconds.
   */
  const getAlbumDuration = async (albumId: string): Promise<number> => {
    const albumTracks = await getAlbumTracks(albumId);
    const albumDuration = albumTracks.reduce(
      (total, track) => total + track.duration,
      0
    );
    return albumDuration;
  };

  return {
    processRecentlyPlayedAlbums,
    addAlbum,
    addAlbumTracks,
    getAlbumTracks,
    getTopListeners,
    getAlbumDuration
  };
})();

export default albumService;
