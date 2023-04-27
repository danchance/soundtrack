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
type TopListeners = {
  id: string;
  username: string;
  picture: string;
  count: number;
}[];

type TopTracks = {
  id: string;
  trackName: string;
  artwork: string;
  count: number;
}[];

type TopAlbums = {
  id: string;
  albumName: string;
  artwork: string;
  count: number;
}[];

/**
 * Handles all artist logic.
 */
const artistService = (() => {
  /**
   * Adds an artist to the Artist table along with all their albums and tracks.
   * @param artist Artist to add to the database.
   * @param accessToken Spotify access token.
   */
  const addArtist = async (artist: SpotifyArtist, accessToken: string) => {
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

  /**
   * Returns the users with the most streams of the artist.
   * @param artistId Id of the artist.
   * @param limit Maximum number of users to return.
   */
  const getTopListeners = async (
    artistId: string,
    limit: number
  ): Promise<TopListeners> => {
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
      `,
      {
        replacements: { artist_id: artistId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topListeners as TopListeners;
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
  ): Promise<TopTracks> => {
    const topTracks = await sequelize.query(
      `
      SELECT
        tracks.id,
        tracks.name as trackName,
        albums.artwork,
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
      `,
      {
        replacements: { artist_id: artistId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topTracks as TopTracks;
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
  ): Promise<TopAlbums> => {
    const topAlbums = await sequelize.query(
      `
      SELECT
        albums.id,
        albums.name as albumName,
        albums.artwork,
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
      `,
      {
        replacements: { artist_id: artistId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topAlbums as TopAlbums;
  };

  return { addArtist, getTopListeners, getTopTracks, getTopAlbums };
})();

export default artistService;
