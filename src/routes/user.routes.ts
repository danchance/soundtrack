import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import checkJwt from '../middleware/auth.js';
import fileupload from 'express-fileupload';
import validateRequest from '../middleware/validate_request.js';
import getUserInfoSchema from '../validation_schemas/user/get_user_info.schema.js';
import getUserTrackHistorySchema from '../validation_schemas/user/get_user_track_history.schema.js';
import getUserTracksSchema from '../validation_schemas/user/get_user_tracks.schema.js';
import getUserAlbumsSchema from '../validation_schemas/user/get_user_albums.schema.js';
import getUserArtistsSchema from '../validation_schemas/user/get_user_artists.schema.js';
import getUserCurrentTrackSchema from '../validation_schemas/user/get_user_current_track.schema.js';
import patchUserSettingsSchema from '../validation_schemas/user/patch_user_settings.schema.js';
import postSpotifyConnectionSchema from '../validation_schemas/user/post_spotify_connection.schema.js';

const router: Router = Router();

router.get('/settings', checkJwt, userController.getUserSettings);

router.patch(
  '/settings',
  checkJwt,
  patchUserSettingsSchema,
  validateRequest,
  userController.patchUserSettings
);

router.post(
  '/profile-picture',
  checkJwt,
  fileupload(),
  userController.postProfilePicture
);

router.post(
  '/banner-picture',
  checkJwt,
  fileupload(),
  userController.postBannerImage
);

router.post('/add', userController.postUser);

router.post(
  '/spotify',
  checkJwt,
  postSpotifyConnectionSchema,
  validateRequest,
  userController.postSpotifyConnection
);

router.delete('/spotify', checkJwt, userController.deleteSpotifyConnection);

router.get(
  '/:username/info',
  getUserInfoSchema,
  validateRequest,
  userController.getUserInfo
);

router.get(
  '/:username/track-history',
  getUserTrackHistorySchema,
  validateRequest,
  userController.getUserTrackHistory
);

router.get('/:username/recap', userController.getUserRecap);

router.get('/:username/discover', userController.getUserDiscover);

router.get(
  '/:username/tracks',
  getUserTracksSchema,
  validateRequest,
  userController.getUserTracks
);

router.get(
  '/:username/albums',
  getUserAlbumsSchema,
  validateRequest,
  userController.getUserAlbums
);

router.get(
  '/:username/artists',
  getUserArtistsSchema,
  validateRequest,
  userController.getUserArtists
);

router.get(
  '/:userid/current-track',
  getUserCurrentTrackSchema,
  validateRequest,
  userController.getUserCurrentTrack
);

router.delete('/:userid', checkJwt, userController.deleteUser);

export default router;
