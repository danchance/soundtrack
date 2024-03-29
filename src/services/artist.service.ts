import { UniqueConstraintError } from 'sequelize';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import spotifyApi, { SpotifyArtist } from '../data_access/spotify.data.js';
import albumService from './album.service.js';
import { sequelize } from '../models/_index.js';
import { QueryTypes } from 'sequelize';

/**
 * Define types used in this file.
 */
type TopListener = {
  id: string;
  username: string;
  picture: string;
  count: number;
};

type TopTrack = {
  id: string;
  trackName: string;
  duration: string;
  artwork: string;
  count: number;
  trackSlug: string;
  albumSlug: string;
  artistSlug: string;
};

type TopAlbum = {
  id: string;
  albumName: string;
  artwork: string;
  count: number;
  albumSlug: string;
};

type Album = {
  id: string;
  albumName: string;
  artwork: string;
  albumSlug: string;
};

type Track = {
  id: string;
  name: string;
  artwork: string;
  trackSlug: string;
  albumSlug: string;
  artistSlug: string;
};

/**
 * Handles all artist logic.
 */
const artistService = (() => {
  let newArtists: SpotifyArtist[] = [];

  /**
   * Add an artist to the database.
   * @param artist Artist to add to the database.
   * @param accessToken Spotify access token.
   */
  const addArtist = async (artist: SpotifyArtist) => {
    try {
      await artistDb.createArtist({
        id: artist.id,
        name: artist.name,
        image: artist.images![0].url
      });
      newArtists.push(artist);
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) {
        throw error;
      }
    }
  };

  /**
   * Processes all artists in the newArtists array. Adds all the artist's albums
   * and tracks to the database.
   * @param AccessToken Spotify access token.
   */
  const processNewArtists = async (AccessToken: string) => {
    const newArtistsCopy = newArtists;
    newArtists = [];
    for (const artist of newArtistsCopy) {
      await processNewArtist(artist, AccessToken);
    }
  };

  /**
   * Adds all the albums and tracks for a single artist to the database.
   * Duplicates are ignored.
   * @param artist Artist to process.
   * @param accessToken Spotify access token.
   */
  const processNewArtist = async (
    artist: SpotifyArtist,
    accessToken: string
  ) => {
    let spotifyAlbums;
    let page = 0;
    let pageSize = 50;
    do {
      // Fetch albums and format them.
      spotifyAlbums = await spotifyApi.getArtistAlbums(
        accessToken,
        artist.id,
        ['album'],
        pageSize,
        page * 50
      );
      const localAlbums = spotifyAlbums.items.map((album) => {
        return {
          id: album.id,
          name: album.name,
          type: album.album_type,
          trackNum: album.total_tracks,
          releaseYear: album.release_date.split('-')[0] as unknown as number,
          artwork: album.images[0].url,
          artistId: artist.id
        };
      });
      // Add albums and tracks to the database.
      await albumDb.bulkCreateAlbums(localAlbums);
      for (const album of spotifyAlbums.items) {
        await albumService.addAlbumTracks(album, accessToken);
      }
      page++;
    } while (spotifyAlbums.total > pageSize * page);
  };

  /**
   * Returns the users with the most streams of the artist.
   * @param artistId Id of the artist.
   * @param limit Maximum number of users to return.
   */
  const getTopListeners = async (
    artistId: string,
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
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE artists.id = :artist_id
      GROUP BY users.id
      ORDER BY count DESC
      LIMIT :limit;
      `,
      {
        replacements: { artist_id: artistId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topListeners as TopListener[];
  };

  /**
   * Returns an artists most streamed tracks. Top tracks are based on the
   * number of of streams by soundTrack users.
   * @param artistId Id of the artist.
   * @param limit Maximum number of tracks to return.
   */
  const getTopTracks = async (
    artistId: string,
    limit: number
  ): Promise<TopTrack[]> => {
    const topTracks = await sequelize.query(
      `
      SELECT
        tracks.id,
        tracks.name as trackName,
        tracks.duration,
        albums.artwork,
        tracks.slug as trackSlug,
        albums.slug as albumSlug,
        artists.slug as artistSlug,
        COUNT(tracks.id) as count
      FROM
        user_track_histories
      LEFT JOIN 
        tracks ON user_track_histories.track_id = tracks.id
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE artists.id = :artist_id
      GROUP BY tracks.id
      ORDER BY count DESC
      LIMIT :limit;
      `,
      {
        replacements: { artist_id: artistId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topTracks as TopTrack[];
  };

  /**
   * Returns an artists most streamed albums. Top albums are based on the
   * number of of streams by soundTrack users.
   * @param artistId Id of the artist.
   * @param limit Maximum number of albums to return.
   */
  const getTopAlbums = async (
    artistId: string,
    limit: number
  ): Promise<TopAlbum[]> => {
    const topAlbums = await sequelize.query(
      `
      SELECT
        albums.id,
        albums.name as albumName,
        albums.artwork,
        albums.slug as albumSlug,
        COUNT(albums.id) as count
      FROM
        user_track_histories
      LEFT JOIN 
        tracks ON user_track_histories.track_id = tracks.id
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE artists.id = :artist_id
      GROUP BY albums.id
      ORDER BY count DESC
      LIMIT :limit;
      `,
      {
        replacements: { artist_id: artistId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topAlbums as TopAlbum[];
  };

  /**
   * Returns a random list of tracks by an artist.
   * @param albumId Id of the album.
   * @param limit Maximum number of albums to return.
   */
  const getArtistRandomTracks = async (artistId: string, limit: number) => {
    const tracks = await sequelize.query(
      `
      SELECT
        tracks.id,
        tracks.name,
        albums.artwork,
        tracks.slug as trackSlug,
        albums.slug as albumSlug,
        artists.slug as artistSlug
      FROM
        tracks
      LEFT JOIN
        albums ON tracks.album_id = albums.id
      LEFT JOIN
        artists ON albums.artist_id = artists.id
      WHERE artists.id = :artist_id
      ORDER BY rand()
      LIMIT :limit;
      `,
      {
        replacements: { artist_id: artistId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return tracks as Track[];
  };

  /**
   * Returns a random list of albums by an artist.
   * @param albumId Id of the album.
   * @param limit Maximum number of albums to return.
   */
  const getArtistRandomAlbums = async (
    artistId: string,
    limit: number
  ): Promise<Album[]> => {
    const albums = await sequelize.query(
      `
      SELECT
        albums.id,
        albums.name as albumName,
        albums.slug as albumSlug,
        albums.artwork
      FROM
        albums
      WHERE albums.artist_id = :artist_id
      ORDER BY rand()
      LIMIT :limit;
      `,
      {
        replacements: { artist_id: artistId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return albums as Album[];
  };

  return {
    processNewArtists,
    addArtist,
    getTopListeners,
    getTopTracks,
    getTopAlbums,
    getArtistRandomTracks,
    getArtistRandomAlbums
  };
})();

export default artistService;
